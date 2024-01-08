from dotenv import load_dotenv
import boto3
import os
import time

load_dotenv()

endpoint_url = os.getenv('FAKE_AWS_ENDPOINT')

fake_creds = {
   "aws_access_key_id": os.getenv('FAKE_AWS_ACCESS_KEY_ID'),
    "aws_secret_access_key": os.getenv('FAKE_AWS_SECRET_ACCESS_KEY')
}

def build_client(service: str):
    return boto3.client(service, endpoint_url=endpoint_url, **fake_creds)


if __name__ == '__main__':
    pass