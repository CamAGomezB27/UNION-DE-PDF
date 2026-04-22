import json
import redis

redis_client = redis.Redis(host="localhost", port=6379, decode_responses=True)

def create_job(job_id: str):
    redis_client.set(job_id, json.dumps({
        "progress": 0,
        "status": "iniciando"
    }))

def set_progress(job_id: str, progress: int, status: str = None):
    data = redis_client.get(job_id)

    if not data:
        return

    job = json.loads(data)

    job["progress"] = progress
    if status:
        job["status"] = status

    # ✅ Preservar logs existentes
    redis_client.set(job_id, json.dumps(job))