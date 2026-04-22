import contextvars

# Almacenar el job_id actual en contexto thread-safe
current_job_id = contextvars.ContextVar('job_id', default=None)

def set_current_job_id(job_id: str):
    current_job_id.set(job_id)

def get_current_job_id() -> str | None:
    return current_job_id.get()
