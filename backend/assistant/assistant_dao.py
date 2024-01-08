from mongodb_client import MongoDBClient, mongo_to_json
from bson import ObjectId

class AssistantDAO:
    def __init__(self):
        self.client = MongoDBClient(collection_name="assistant")

    def write_to_assistant(self, name, instructions, external_id):
        if (not name or not instructions or not external_id):
            raise ValueError("")

        insert_id = self.client.insert_document(
            {"name": name, "instructions": instructions, "external_id": external_id})

        return insert_id
    
    def delete_by_id(self, id):
        return self.client.delete_document_by_id(id)
    
    def find_by_id(self, id):
        return self.client.find_document_by_id(id)

    def find_by_ids(self, ids):
        results = []
        if(len(ids) == 0):
            return results
        
        cursor = self.client.find_document({"_id": {"$in": [ObjectId(id) for id in ids]}})
        for c in cursor:
            convert_data = mongo_to_json(c)
            convert_data["_id"] = convert_data["_id"]["$oid"]
            results.append(convert_data)

        return results
