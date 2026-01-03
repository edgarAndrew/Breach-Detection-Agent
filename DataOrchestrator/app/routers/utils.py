from bson import ObjectId

def oid(id: str) -> ObjectId:
    return ObjectId(id)

def normalize(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    return doc