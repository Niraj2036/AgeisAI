import threading
import time

from .auth import authenticate
from .patcher import auto_patch
from .buffer import start_background_worker
from .config import Config


def init(client_id, client_secret, server_url=None):

    if server_url:
        Config.SERVER_URL = server_url

    Config.CLIENT_ID = client_id

    authenticate(client_id, client_secret)

    auto_patch()

    start_background_worker()

    # late import detection
    def delayed_patch():
        time.sleep(2)
        auto_patch()

    threading.Thread(target=delayed_patch, daemon=True).start()

    print("[AegisAI] Initialized successfully")
