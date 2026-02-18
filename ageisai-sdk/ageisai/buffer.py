import threading
import time
from .sender import send_batch

ML_BUFFER = []
LLM_BUFFER = []

LOCK = threading.Lock()

MAX_SIZE = 50
FLUSH_INTERVAL = 10


def add_ml_event(event):
    with LOCK:
        ML_BUFFER.append(event)
        if len(ML_BUFFER) >= MAX_SIZE:
            flush_ml()


def add_llm_event(event):
    with LOCK:
        LLM_BUFFER.append(event)
        if len(LLM_BUFFER) >= MAX_SIZE:
            flush_llm()


def flush_ml():
    global ML_BUFFER
    if ML_BUFFER:
        send_batch("ml", ML_BUFFER.copy())
        ML_BUFFER.clear()


def flush_llm():
    global LLM_BUFFER
    if LLM_BUFFER:
        send_batch("llm", LLM_BUFFER.copy())
        LLM_BUFFER.clear()


def background_flusher():
    while True:
        time.sleep(FLUSH_INTERVAL)
        flush_ml()
        flush_llm()


def start_background_worker():
    t = threading.Thread(target=background_flusher, daemon=True)
    t.start()
