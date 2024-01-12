import openai_helper
import json
import secrets
from user.user_api import UserApi
from user.user_dao import UserDAO
from user.user_assistant_dao import UserAssistantDAO

from mock_aws.s3 import S3

if __name__ == '__main__':
    # user_api = UserApi()
    # user_dao = UserDAO()
    # user_assistant_dao = UserAssistantDAO()
    # s3_client = S3()

    # s3_client.create_bucket(name='file')
    threads = []

    for t in threads:
        openai_helper.delete_thread(t)
