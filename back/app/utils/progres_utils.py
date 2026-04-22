from typing import Dict

jobs: Dict[str, dict] = {}

def set_progress(job_id: str, progress: int, status: str = None):
    if job_id not in jobs:
        return

    jobs[job_id]["progress"] = progress
    if status:
        jobs[job_id]["status"] = status