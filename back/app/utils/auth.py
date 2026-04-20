from jose import jwt
import requests
import os

TENANT_ID = os.getenv("TENANT_ID")
CLIENT_ID = os.getenv("AZURE_CLIENT_ID")


def verify_token(token: str):
    jwks_url = f"https://login.microsoftonline.com/{TENANT_ID}/discovery/v2.0/keys"
    jwks = requests.get(jwks_url).json()

    headers = jwt.get_unverified_header(token)

    key = next(k for k in jwks["keys"] if k["kid"] == headers["kid"])

    public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)

    decoded = jwt.decode(
        token,
        public_key,
        algorithms=["RS256"],
        audience="TU_CLIENT_ID",
    )

    return decoded