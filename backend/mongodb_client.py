from pymongo import MongoClient
from bson.objectid import ObjectId
from db_config import DBConfig
from bson import json_util
import json

def mongo_to_json(data):
    return json.loads(json_util.dumps(data))

class MongoDBClient:
    def __init__(self, collection_name, config_type='default'):
        config = getattr(DBConfig, config_type)()
        connection_string = f"mongodb://{config['username']}:{config['password']}@{config['host']}:{config['port']}/{config['database_name']}?authSource=admin"
        self.client = MongoClient(connection_string)
        self.db = self.client[config['database_name']]
        self.collection = self.db[collection_name]

    def insert_document(self, data):
        """ Inserts a document into the collection """
        return self.collection.insert_one(data).inserted_id

    def find_document(self, query):
        """ Finds documents in the collection based on a query """
        return self.collection.find(query)

    def find_document_by_id(self, id):
        """ Finds a single document in the collection by its ObjectId """
        return self.collection.find_one({"_id": ObjectId(id)})

    def update_document(self, query, new_values):
        """ Updates documents in the collection based on a query """
        return self.collection.update_one(query, {"$set": new_values})
    
    def delete_document_by_id(self, id):
        return self.collection.delete_one({"_id": ObjectId(id)})

    def delete_document(self, query):
        """ Deletes documents from the collection based on a query """
        return self.collection.delete_one(query)
    
    def find_one_document(self, query):
        return self.collection.find_one(query)