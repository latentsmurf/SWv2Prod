import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
if not MONGODB_URL:
    # Fallback or warning
    print("Warning: MONGODB_URL not set.")

client = AsyncIOMotorClient(MONGODB_URL)
db = client.get_database("sceneweaver_db") # Default DB name

async def get_db():
    return db

def get_vector_search_pipeline(query_embedding: list[float], limit: int = 10, num_candidates: int = 100) -> list[dict]:
    """
    Constructs the aggregation pipeline for Atlas Vector Search.
    
    Args:
        query_embedding: The embedding vector to search for.
        limit: Number of results to return.
        num_candidates: Number of candidates to consider (approximate NN).
        
    Returns:
        List of aggregation stages.
    """
    return [
        {
            "$vectorSearch": {
                "index": "vector_index", # Name of the index on Atlas
                "path": "embedding",
                "queryVector": query_embedding,
                "numCandidates": num_candidates,
                "limit": limit
            }
        },
        {
            "$project": {
                "_id": 1,
                "tags": 1,
                "meta": 1,
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ]
