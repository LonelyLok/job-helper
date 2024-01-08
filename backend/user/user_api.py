from user.user_dao import UserDAO
from user.user_assistant_dao import UserAssistantDAO
from assistant.assistant_dao import AssistantDAO
import openai_helper
import bcrypt
import jwt
import datetime
import os

secret_key = os.getenv('TEST_SECRET_KEY')

class UserApi:
    def __init__(self):
        self.user_dao = UserDAO()
        self.user_assistant_dao = UserAssistantDAO()
        self.assistant_dao = AssistantDAO()

    def create_assistant_for_user(self, user_id, assistant_name, assistant_instructions):
        if not user_id or not assistant_name or not assistant_instructions:
            raise ValueError("Internal Error")
        
        assistant_from_openai = openai_helper.create_assistant({"name": assistant_name, "instructions": assistant_instructions })
        external_assistant_id = assistant_from_openai.id
        assistant_id = self.assistant_dao.write_to_assistant(name=assistant_name, instructions=assistant_instructions, external_id=external_assistant_id)
        user_assistant_id = self.user_assistant_dao.write(user_id=str(user_id), assistant_id=str(assistant_id))
        return 'OK'
    
    def delete_assistant_for_user(self, user_id, assistant_id, external_assistant_id):
        if(not user_id or not assistant_id or not external_assistant_id):
            return False
        user_assistant_data = self.user_assistant_dao.find_by_user_id_and_assistant_id(user_id=user_id, assistant_id=assistant_id)
        if(not user_assistant_data):
            return False
        assistant_data = self.assistant_dao.find_by_id(id=assistant_id)
        if(not assistant_data):
            return False
        
        if(assistant_data.get('external_id') != external_assistant_id):
            return False
        
        res = openai_helper.delete_assistant({"assistant_id": external_assistant_id})

        if(not res.deleted):
            return False
        
        self.user_assistant_dao.delete_by_id(id=user_assistant_data['_id'])
        self.assistant_dao.delete_by_id(id=assistant_id)

        return True
        
    
    def list_assistants_for_user(self, user_id):
        user_assistant_data = self.user_assistant_dao.find_by_user_id(user_id)
        if(len(user_assistant_data) == 0):
            return []
        
        assistant_ids = [item.get('assistant_id') for item in user_assistant_data]
        assistant_data = self.assistant_dao.find_by_ids(assistant_ids)

        return assistant_data
        

     

    def create_user(self, username, password, name):
        if(not username or not password or not name):
            raise ValueError("Missing required user information")
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        return self.user_dao.create_user(username=username, hashed_password=hashed_password, name=name)
    
    def check_password(self, raw_password, hashed_password):
        return bcrypt.checkpw(raw_password.encode('utf-8'), hashed_password)
    

    def login(self, username, password):
        if(not username or not password):
            raise ValueError("Missing required infomration")
        
        user_data = self.user_dao.find_by_username(username=username)
        if(user_data is None):
            raise ValueError("Wrong information")
        
        user_id = user_data.get('_id')
        
        if(user_id is None):
            raise ValueError("Wrong information")
        
        check = self.check_password(password, hashed_password=user_data.get('hashed_password'))

        if(not check):
            raise ValueError("Invalid credentials")
        
        token = jwt.encode({
            'sub': str(user_id),
            'iat': datetime.datetime.utcnow(),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=300)
        }, secret_key, algorithm="HS256")

        if(not token):
            raise ValueError("Invalid token")

        return {
            "token": token,
            "user_id": str(user_id),
            "name": user_data.get("name")
        }
    
    def is_token_valid(self, user_id, token):
        if(not token or not user_id):
            raise ValueError("Missing required infomration")
        
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
        token_user_id = payload['sub']

        if(user_id != token_user_id):
            raise ValueError("wrong user for the given token")
        
        return True

        

 

