import os
import requests

def upload_to_sharepoint(file_path: str, token: str):
    filename = os.path.basename(file_path)

    site_id = "TU_SITE_ID"
    drive_id = "TU_DRIVE_ID"

    url = f"https://graph.microsoft.com/v1.0/sites/{site_id}/drives/{drive_id}/root:/{filename}:/content"

    headers = {
        "Authorization": token,  # 👈 ya viene "Bearer ..."
        "Content-Type": "application/pdf"
    }

    with open(file_path, "rb") as f:
        res = requests.put(url, headers=headers, data=f)

    return res.json()