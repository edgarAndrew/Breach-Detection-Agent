from fastapi import HTTPException, status
from app.repositories.rule import RuleRepository
from app.routers.utils import normalize
from fastapi.responses import JSONResponse
from groq import Groq
import PyPDF2
import io
import yaml
import json

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


class RuleController:
    def __init__(self, db):
        self.repo = RuleRepository(db)

    async def create(self, payload):
        if not await self.repo.datasource_exists(payload.data_src_id):
            raise HTTPException(404, "Datasource not found")
        return normalize(await self.repo.create(payload.dict()))

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
                try:
                    parsed = yaml.safe_load(llm_output)
                    parsed = json.loads(json.dumps(parsed))
                except Exception:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="LLM returned invalid JSON/YAML. Response was:\n" + llm_output[:200]
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