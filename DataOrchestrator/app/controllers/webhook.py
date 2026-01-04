from fastapi import HTTPException
from app.repositories.webhook import WebhookRepository
from app.routers.utils import normalize
from app.controllers.security import generate_api_key, hash_api_key
from dotenv import load_dotenv
import os
load_dotenv()

class WebhookController:
    def __init__(self, db):
        self.repo = WebhookRepository(db)

    async def create(self, user_id):
        res = await self.repo.get_ids_from_user_id(user_id)
        org_id = res['org_id']
        data_src_id = res['ds_id']
        if not data_src_id:
            raise HTTPException(404, "Datasource not found")
        
        raw_key = generate_api_key()
        hashed_key = hash_api_key(raw_key)
        payload ={
            "data_src_id": str(data_src_id),
            "api_key": hashed_key,
            "active": True
        }

        webhook_id = await self.repo.create(payload)
        webhook_id = webhook_id['_id']

        return {
            "url": f"{os.getenv('WEBHOOK_ENDPOINT', '')}/{org_id}/{webhook_id}",
            "api_key": raw_key
        }

    async def get_webhook(self, user_id):
        res = await self.repo.get_ids_from_user_id(user_id)
        org_id = res['org_id']
        data_src_id = res['ds_id']
        webhook_id = await self.repo.get_webhook_id_from_data_source_id(str(data_src_id))

        return {
            "webhook_id": webhook_id,
            "url": f"{os.getenv('WEBHOOK_ENDPOINT', '')}/{org_id}/{webhook_id}"
        }

    async def regenerate_webhook_api(self, user_id):
        res = await self.repo.get_ids_from_user_id(user_id)
        org_id = res['org_id']
        data_src_id = res['ds_id']
        webhook_id = await self.repo.get_webhook_id_from_data_source_id(str(data_src_id))

        raw_key = generate_api_key()
        hashed_key = hash_api_key(raw_key)
        self.repo.regenerate_webhook_api(webhook_id, data_src_id, hashed_key)
        return {
            "webhook_id": webhook_id,
            "api_key": raw_key,
            "url": f"{os.getenv('WEBHOOK_ENDPOINT', '')}/{org_id}/{webhook_id}"
        }