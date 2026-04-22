import json
import redis
from app.utils.context import get_current_job_id

redis_client = redis.Redis(host="localhost", port=6379, decode_responses=True)

def add_log(job_id: str = None, message: str = ""):
    # Si no se proporciona job_id, intentar obtenerlo del contexto global
    if not job_id:
        job_id = get_current_job_id()
    
    if not job_id:
        return
    
    data = redis_client.get(job_id)

    if not data:
        return

    payload = json.loads(data)

    logs = payload.get("logs", [])
    
    # Evitar logs vacíos
    if message.strip():
        logs.append(message)

    payload["logs"] = logs

    redis_client.set(job_id, json.dumps(payload))

def log(message: str):
    """Función de logging global que automáticamente captura el job_id del contexto"""
    add_log(message=message)