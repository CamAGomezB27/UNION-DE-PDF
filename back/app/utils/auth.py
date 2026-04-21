import jwt
import requests
from fastapi import HTTPException
import os
from dotenv import load_dotenv
load_dotenv()

TENANT_ID = os.getenv("AZURE_TENANT_ID")

JWKS_URL = f"https://login.microsoftonline.com/{TENANT_ID}/discovery/v2.0/keys"

def verify_token(token: str):
    try:
        # 🔎 Obtener header del token
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        # 📡 Obtener keys públicas de Azure
        jwks = requests.get(JWKS_URL).json()

        key = None
        for k in jwks["keys"]:
            if k["kid"] == kid:
                key = jwt.algorithms.RSAAlgorithm.from_jwk(k)
                break

        if not key:
            raise Exception("No se encontró la key")

        # ✅ Validar token
        decoded = jwt.decode(
            token,
            key=key,
            algorithms=["RS256"],
            audience=os.getenv("AZURE_CLIENT_ID"),
        )

        return decoded

    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))