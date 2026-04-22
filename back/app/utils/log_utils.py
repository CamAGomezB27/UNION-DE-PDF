import json
import redis

redis_client = redis.Redis(host="localhost", port=6379, decode_responses=True)

def add_log(job_id: str, message: str):
    data = redis_client.get(job_id)

    if not data:
        return

    payload = json.loads(data)

    logs = payload.get("logs", [])
    logs.append(message)

    payload["logs"] = logs

    redis_client.set(job_id, json.dumps(payload))