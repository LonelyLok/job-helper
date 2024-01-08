from mock_aws.client_builder import build_client

class S3:

    def __init__(self):
        self.client = build_client('s3')

    
    def create_bucket(self, name):
        return self.client.create_bucket(Bucket=name)
    
    def delete_bucket(self, name):
        return self.client.delete_bucket(Bucket=name)
    
    def put_object(self, key, bucket, body):
        return self.client.put_object(Bucket=bucket, Key=key, Body=body)
    
    def delete_object(self, key, bucket):
        return self.client.delete_object(Bucket=bucket, Key=key)
