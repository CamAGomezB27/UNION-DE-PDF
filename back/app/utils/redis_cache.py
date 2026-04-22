import redis
import json

redis_client = redis.Redis(host="localhost", port=6379, decode_responses=True)

def add_log(job_id, message):
    data = json.loads(redis_client.get(job_id))
    
    logs = data.get("logs", [])
    logs.append(message)

    data["logs"] = logs
    redis_client.set(job_id, json.dumps(data))