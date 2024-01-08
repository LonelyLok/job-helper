from mongodb_client import MongoDBClient
from typing import TypedDict

class User(TypedDict):
    __id: str
    username: str
    password: str
    name: str

class UserDAO:
    def __init__(self):
        self.client = MongoDBClient(collection_name="user")

    def find_by_username(self, username: str):
        cursor = self.client.find_document({"username": username})
        result = None
        for c in cursor:
            result = c
            break
        return result

    def create_user(self, username: str, hashed_password:str, name:str):
        if(not username or not hashed_password or not name):
            raise ValueError("Missing required user information")
        
        insert_id = self.client.insert_document({"username": username, "hashed_password": hashed_password, "name": name })
        return insert_id