from mock_aws.s3 import S3
from file.file_dao import FileDAO

class FileApi:

    def __init__(self):
        self.s3 = S3()
        self.file_dao = FileDAO()
        self.bucket_name = 'file'

    def upload_file(self, user_id, file_bytes, file_name):
        if(not user_id or not file_bytes or not file_name):
            raise ValueError("missing input")
        key = f"{user_id}/{file_name}"
        res = self.s3.put_object(key=key, bucket=self.bucket_name, body=file_bytes)
        insert_id = self.file_dao.write(key=key, name=file_name, user_id=user_id)

        if(not insert_id):
            raise ValueError("failed insert")

        return True
    
    def list_file_from_user_id(self, user_id):        
        return self.file_dao.find_by_user_id(user_id=user_id)
    

    def delete_file(self, user_id, file_id):
        if(not user_id or not file_id):
            raise ValueError("missing input")
        
        file = self.file_dao.find_by_id(file_id)

        if(not file):
            raise ValueError("no file found")
        
        if(file.get('user_id') != user_id):
            raise ValueError("user not match")
        
        file_key = file.get('key')
        
        if(not file_key):
            raise ValueError("no key")
        
        s3_delete_res = self.s3.delete_object(key=file_key, bucket=self.bucket_name)

        print(s3_delete_res)

        self.file_dao.delete(file_id)

        return True

        

        
        
