from mongodb_client import MongoDBClient, mongo_to_json

class UserAssistantDAO:
    def __init__(self):
        self.client = MongoDBClient(collection_name="user_assistant")

    def write(self, user_id, assistant_id):
        if (not user_id or not assistant_id):
            raise ValueError("Internal Error")

        insert_id = self.client.insert_document(
            {"user_id": user_id, "assistant_id": assistant_id,})

        return insert_id
    
    def delete_by_id(self, id):
        return self.client.delete_document_by_id(id)
    
    def find_by_user_id(self, user_id):
        cursor = self.client.find_document({"user_id": user_id})
        results = []
        for c in cursor:
            convert_data = mongo_to_json(c)
            convert_data["_id"] = convert_data["_id"]["$oid"]
            results.append(convert_data)
        return results
    
    def find_by_user_id_and_assistant_id(self, user_id, assistant_id):
        data = self.client.find_one_document({"user_id": user_id, "assistant_id": assistant_id})
        if not data:
            return data
        convert_data = mongo_to_json(data)
        convert_data["_id"] = convert_data["_id"]["$oid"]
        return convert_data
