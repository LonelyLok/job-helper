from mongodb_client import MongoDBClient, mongo_to_json
from datetime import datetime

class FileDAO:
    def __init__(self):
        self.client = MongoDBClient(collection_name='file')

    def write(self, user_id, key, name):
        if(not user_id or not key or not name):
            raise ValueError("Missing required user information")
        return self.client.insert_document({
            "user_id": user_id,
            "key": key,
            "name": name,
            "created_at": int(datetime.utcnow().timestamp() * 1000)
        })
    
    def delete(self, file_id):
        if(not file_id):
            raise ValueError("Missing required user information")
        return self.client.delete_document_by_id(id=file_id)
    
    def find_by_id(self, id):
        if(not id):
            raise ValueError
        return self.client.find_document_by_id(id)
    
    def find_by_user_id(self, user_id):
        if(not user_id):
            raise ValueError("Missing required user information")
        
        cursor = self.client.find_document({"user_id": user_id})
        results = []
        for c in cursor:
            convert_data = mongo_to_json(c)
            convert_data["_id"] = convert_data["_id"]["$oid"]
            results.append(convert_data)
        return results