from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL', 'mock://memory')

if mongo_url.startswith('mock://'):
    # In-memory transient database for automatic cloud deployments with no URL
    from mongomock_motor import AsyncMongoMockClient
    client = AsyncMongoMockClient()
else:
    client = AsyncIOMotorClient(mongo_url)

db_name = os.environ.get('DB_NAME', 'mealbridge_db')
db = client[db_name]
