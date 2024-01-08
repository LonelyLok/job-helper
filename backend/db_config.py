from dotenv import load_dotenv
import os

load_dotenv()

class DBConfig:

    @staticmethod
    def default():
        return {
            "username": os.getenv('DB_USER'),
            "password":  os.getenv('DB_PASSWORD'),
            "host": "localhost",
            "port": 27017,
            "database_name": "backend"
        }

