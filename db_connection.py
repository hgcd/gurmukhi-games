# db_connection.py
from pymongo import MongoClient
from env_config import DB_NAME, DB_URL

# Singleton class to manage MongoDB connection
class MongoDBConnection:
    _client = None
    _db = None

    @classmethod
    def get_db(cls):
        """Get the MongoDB database instance. Establish a connection if not already created."""
        if cls._db is None:
            # Retrieve MongoDB connection details from environment variables
            MONGO_DB_URL = DB_URL
            MONGO_DB_NAME = DB_NAME

            # Establish MongoDB connection (connect only once)
            cls._client = MongoClient(MONGO_DB_URL)
            cls._db = cls._client[MONGO_DB_NAME]
            print(f"Connected to MongoDB database: {MONGO_DB_NAME}")

        return cls._db
