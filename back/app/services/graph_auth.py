import requests
import os

def get_graph_token():
    url = f"https://login.microsoftonline.com/{os.getenv('AZURE_TENANT_ID')}/oauth2/v2.0/token"

    data = {
        "client_id": os.getenv("AZURE_CLIENT_ID"),
        "client_secret": os.getenv("AZURE_CLIENT_SECRET"),
        "scope": "https://graph.microsoft.com/.default",
        "grant_type": "client_credentials"
    }

    res = requests.post(url, data=data)

    if res.status_code != 200:
        raise Exception(res.text)

    return res.json()["access_token"]


def get_graph_token_on_behalf_of(user_token: str):
    url = f"https://login.microsoftonline.com/{os.getenv('AZURE_TENANT_ID')}/oauth2/v2.0/token"

    data = {
        "client_id": os.getenv("AZURE_CLIENT_ID"),
        "client_secret": os.getenv("AZURE_CLIENT_SECRET"),
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "requested_token_use": "on_behalf_of",
        "scope": "https://graph.microsoft.com/.default",
        "assertion": user_token,
    }

    res = requests.post(url, data=data)

    if res.status_code != 200:
        raise Exception(res.text)

    return res.json()["access_token"]