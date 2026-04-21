from jose import jwt
from jose.utils import base64url_decode
import requests
import os

TENANT_ID = os.getenv("AZURE_TENANT_ID")
print("TENANT_ID:", TENANT_ID)

def verify_token(token: str):
    jwks_url = f"https://login.microsoftonline.com/{TENANT_ID}/discovery/v2.0/keys"
    
    res = requests.get(jwks_url)
    print("JWKS STATUS:", res.status_code)
    print("JWKS RESPONSE:", res.text)  # 👈 CLAVE

    jwks = res.json()

    headers = jwt.get_unverified_header(token)

    key = next(k for k in jwks["keys"] if k["kid"] == headers["kid"])

    public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)

    decoded = jwt.decode(
        token,
        public_key,
        algorithms=["RS256"],
        options={"verify_aud": False}
    )

    return decoded