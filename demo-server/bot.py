import os
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

# ---------------- LOAD API KEY ----------------
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.0-flash")


app = FastAPI(title="Banking AI Assistant")

# ---------------- BANKING SYSTEM RULES ----------------
SYSTEM_PROMPT = """
You are an AI Banking Assistant for a digital bank.

STRICT RULES:
- Answer ONLY banking and finance related questions
- If question is unrelated → politely refuse
- Never guess user account details
- Never create fake policies
- Give step-by-step answers when possible
- Keep answers simple and professional

Allowed topics:
Accounts, Loans, EMI, Interest Rates, UPI, Cards, ATM, KYC,
Fraud Prevention, Charges, Transactions, Net banking

If unrelated question:
Reply exactly:
"I am a banking assistant and can only help with banking related queries."
"""

# ---------------- GUARDRAIL ----------------
BANKING_KEYWORDS = [
    "account","bank","loan","credit","debit","emi","interest",
    "upi","transaction","kyc","atm","card","balance","payment",
    "ifsc","cheque","fd","rd","net banking","mobile banking",
    "fraud","charge","transfer","limit"
]

def is_banking_query(text: str):
    text = text.lower()
    return any(word in text for word in BANKING_KEYWORDS)

# ---------------- MEMORY ----------------
chat_memory = {}

def add_memory(session_id, role, message):
    if session_id not in chat_memory:
        chat_memory[session_id] = []

    chat_memory[session_id].append({
        "role": role,
        "parts": [message]
    })

    # keep last 10 messages only
    chat_memory[session_id] = chat_memory[session_id][-10:]

def get_memory(session_id):
    return chat_memory.get(session_id, [])

# ---------------- REQUEST MODEL ----------------
class ChatRequest(BaseModel):
    session_id: str
    message: str

# ---------------- CHAT ENDPOINT ----------------
@app.post("/chat")
async def chat(req: ChatRequest):

    # 1️⃣ Guardrail filter
    if not is_banking_query(req.message):
        return {
            "response": "I am a banking assistant and can only help with banking related queries."
        }

    # 2️⃣ Save user message
    add_memory(req.session_id, "user", req.message)

    # 3️⃣ Create conversation
    history = get_memory(req.session_id)
    chat = model.start_chat(history=history)

    # 4️⃣ Send prompt
    response = chat.send_message(
        SYSTEM_PROMPT + "\nUser Question: " + req.message
    )

    # 5️⃣ Save AI response
    add_memory(req.session_id, "model", response.text)

    return {
        "response": response.text
    }

# ---------------- ROOT ----------------
@app.get("/")
def home():
    return {"message": "Banking AI Chatbot Running"}
