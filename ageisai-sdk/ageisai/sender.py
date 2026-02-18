import requests
from .config import Config


def send_batch(event_type, events):

    if not Config.TOKEN:
        return

    headers = {
        "Authorization": f"Bearer {Config.TOKEN}"
    }

    try:
        requests.post(
            f"{Config.SERVER_URL}/ingest/{event_type}",
            json={"events": events},
            headers=headers,
            timeout=5
        )
    except Exception as e:
        print("[AegisAI] send failed:", e)
