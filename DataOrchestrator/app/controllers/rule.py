from fastapi import HTTPException, status
from app.repositories.rule import RuleRepository
from app.repositories.webhook import WebhookRepository
from app.repositories.rawevent import RawEventRepository
from app.routers.utils import normalize
from app.controllers.user import UserController
from fastapi.responses import JSONResponse
from groq import Groq
import PyPDF2
import io
import json
import os
import httpx

# System prompt to enforce structured JSON output
RULES_PROMPT = """
You are given a set of business rules and a list of valid field names.

Inputs

Business Rules: [
{pdf_rules}
]

Valid Fields: A comma-separated list of field names that rules may reference. {fields}

Task Parse each business rule and convert it into a JSON configuration following the schema below.

JSON Schema

[
    {{ 
        "attribute_name": <string>, # Field name corresponding to this rule (must be one of the valid fields) 
        "threshold": <number>, # Hard limit threshold value 
        "near_thres": <number>, # Percentage limit value (e.g., 1 means 1%) 
        "operator": <string>, # One of: is greater than | is less than | is at least | is at most | equals
    }},
    ...
]

Requirements

Generate one JSON rule entry per business rule.

Ensure attribute_name matches one of the provided valid fields.

Use only the allowed operators: gt, lt, gte, lte, eq.

Output only the final JSON configuration.

Output

Only a valid JSON document containing all parsed rules.
"""

RULE_SERVICE_URL = os.getenv("RULE_SERVICE_URL", "http://localhost:8081/health/evaluate")

class RuleController:
    def __init__(self, db):
        self.repo = RuleRepository(db)
        self.webhookRepo = WebhookRepository(db)
        self.raweventRepo = RawEventRepository(db)
        self.userController = UserController(db)

    async def create(self, payload, user_id):
        col_ids = self.userController.get_data_src(user_id)
        datasource_id = col_ids["datasource_id"]
        org_id = col_ids["org_id"]
        if not await self.repo.datasource_exists(datasource_id):
            raise HTTPException(404, "Datasource not found")
        
        payload = [
            {**p, "data_src_id": datasource_id, "org_id": org_id}
            for p in payload
        ]
        return normalize(await self.repo.create(payload))

    async def list(self):
        return [normalize(r) for r in await self.repo.list()]

    async def getOrgRules(self, org_id: str):
        return [normalize(r) for r in await self.repo.getOrgRules(org_id)]
    
    async def delete(self, rule_id: str):
        res = await self.repo.delete(rule_id)
        if res.deleted_count == 0:
            raise HTTPException(404, "Rule not found")

    async def convert_to_config(self, file, user_id):
        client = Groq()

        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are allowed."
            )

        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(await file.read()))
            text = ""
            for page in pdf_reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
            
            if not text.strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="PDF contains no extractable text."
                )

            text = text[:12000]

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to parse PDF: {str(e)}"
            )

        try:
            fields_list = await self.repo.getOrgFieldsFromUserID(user_id)
            if fields_list is None:
                fields = ""
            else:
                fields = ",".join(str(f) for f in fields_list if f is not None)

            
            completion = client.chat.completions.create(
                model="meta-llama/llama-4-scout-17b-16e-instruct",
                messages=[
                    {"role": "system", "content": "You are an assistant that reads business rules and converts them to JSON schema format."},
                    {"role": "user", "content": RULES_PROMPT.format(pdf_rules=text, fields=fields)}
                ],
                temperature=0.2,
                max_tokens=2048,
                top_p=1,
                stream=False,
                response_format={ "type": "json_object" }
            )
 
            llm_output = completion.choices[0].message.content or ""

            try:
                parsed = json.loads(llm_output)
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="LLM returned invalid JSON. Response was:\n" + llm_output[:200]
                )

            if not isinstance(parsed, dict) or "rules" not in parsed:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="LLM response missing 'rules' key"
                )

            if not isinstance(parsed["rules"], list):
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="'rules' must be an array"
                )

            for rule in parsed["rules"]:
                required = {"attribute_name", "operator", "threshold", "near_thres"}
                if not required.issubset(rule.keys()):
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Rule missing required fields. Got: {rule.keys()}"
                    )

            return JSONResponse(content=parsed)

        except HTTPException as e:
            print(f"LLM processing failed  HTTPExcep : {str(e)}")
            raise
        except Exception as e:
            import traceback
            print(f"LLM processing failed HTTPExcep:\n{traceback.format_exc()}")
            print(f"LLM processing failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"LLM processing failed: {str(e)}"
            )
        
    async def get_events_by_rule_and_time_range(self,rule_id: str,start_ts: float,end_ts: float):
        if start_ts > end_ts:
            raise HTTPException(
                status_code=400,detail="start_ts must be less than or equal to end_ts",
            )
        
        data_src_id = await self.repo.get_data_source_id_from_rule_id(rule_id)
        if not data_src_id:
            raise HTTPException(404, "Rule not found")
        
        webhook_id = await self.webhookRepo.get_webhook_id_from_data_source_id(data_src_id)
        if not webhook_id:
            raise HTTPException(404, "Datasource not found")
        
        if not await self.raweventRepo.webhook_exists(webhook_id):
            raise HTTPException(404, "Webhook not found")
        
        rawevents = await self.raweventRepo.get_by_webhook_and_time_range(webhook_id,start_ts,end_ts)

        if len(rawevents) == 0:
            raise HTTPException(404, "No raw events founds beween start_ts and end_ts")
        
        payload = {
            "rule_id": rule_id,
            "rawevents": rawevents
        }
        
        return await self.evaluate_health_rule(payload)

    
    async def get_by_id(self, rule_id: str):
        if not await self.repo.get_by_id(rule_id):
            raise HTTPException(404, "Rule not found")
        return normalize(await self.repo.get_by_id(rule_id))
    
    async def evaluate_health_rule(self,payload: dict):
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(RULE_SERVICE_URL, json=payload)
                response.raise_for_status()
                return response.json()

            except httpx.HTTPStatusError as e:
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=e.response.text
                )

            except httpx.RequestError as e:
                raise HTTPException(
                    status_code=503,
                    detail=f"Rule engine unreachable: {str(e)}"
                )
