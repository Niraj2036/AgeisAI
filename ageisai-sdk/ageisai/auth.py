import requests
from .config import Config


def authenticate(client_id, client_secret):

    res = requests.post(
        f"{Config.SERVER_URL}/auth/token",
        json={
            "clientId": client_id,
            "clientSecret": client_secret
        }
    )

    res.raise_for_status()

    data = res.json()
    Config.TOKEN = data["access_token"]
