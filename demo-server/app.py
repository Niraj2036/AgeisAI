from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import os
from datetime import datetime
from dotenv import load_dotenv
import google.generativeai as genai

# ---------------- LOAD ENVIRONMENT VARIABLES ----------------
load_dotenv()

# ---------------- INITIALIZE FLASK APP ----------------
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# ---------------- CREATE REQUIRED FOLDERS ----------------
os.makedirs("logs", exist_ok=True)
os.makedirs("models", exist_ok=True)

# ---------------- LOAD ML MODELS ----------------
loan_model = joblib.load("models/loan_model.pkl")
loan_encoders = joblib.load("models/loan_encoders.pkl")
loan_columns = joblib.load("models/loan_columns.pkl")

fraud_model = joblib.load("models/fraud_model.pkl")
fraud_columns = joblib.load("models/fraud_columns.pkl")

# ---------------- INITIALIZE GEMINI AI MODEL ----------------
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel("gemini-2.0-flash")

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

# ---------------- GUARDRAIL KEYWORDS ----------------
BANKING_KEYWORDS = [
    "account", "bank", "loan", "credit", "debit", "emi", "interest",
    "upi", "transaction", "kyc", "atm", "card", "balance", "payment",
    "ifsc", "cheque", "fd", "rd", "net banking", "mobile banking",
    "fraud", "charge", "transfer", "limit"
]

# ---------------- CHAT MEMORY ----------------
chat_memory = {}

# ---------------- HELPERS ----------------
def clean_text(val):
    return str(val).strip().lower()

def is_banking_query(text: str):
    """Check if query is banking-related"""
    text = text.lower()
    return any(word in text for word in BANKING_KEYWORDS)

def add_memory(session_id, role, message):
    """Add message to chat memory"""
    if session_id not in chat_memory:
        chat_memory[session_id] = []
    
    chat_memory[session_id].append({
        "role": role,
        "parts": [message]
    })
    
    # Keep last 10 messages only
    chat_memory[session_id] = chat_memory[session_id][-10:]

def get_memory(session_id):
    """Get chat history for session"""
    return chat_memory.get(session_id, [])

@app.route("/")
def home():
    return jsonify({
        "message": "Bank AI Backend Running",
        "endpoints": {
            "loan_prediction": "/loan-predict",
            "fraud_detection": "/fraud-predict",
            "chatbot": "/chat"
        }
    })


# =====================================================
# LOAN PREDICTION API
# =====================================================
@app.route("/loan-predict", methods=["POST"])
def loan_predict():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # convert to dataframe
        df = pd.DataFrame([data])

        # enforce schema
        df = df.reindex(columns=loan_columns)

        # numeric conversion
        numeric_cols = [
            "no_of_dependents","income_annum","loan_amount","loan_term",
            "cibil_score","residential_assets_value","commercial_assets_value",
            "luxury_assets_value","bank_asset_value"
        ]
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors="coerce")

        # categorical encoding
        for col in ["education", "self_employed"]:
            df[col] = df[col].astype(str).apply(clean_text)
            df[col] = loan_encoders[col].transform(df[col])

        # prediction
        prob = loan_model.predict_proba(df)[0][1]
        pred = loan_model.predict(df)[0]
        result = "Approved" if pred == 1 else "Rejected"

        # logging
        log = {
            "timestamp": str(datetime.now()),
            **data,
            "prediction": result,
            "probability": float(prob)
        }

        log_file = "logs/loan_logs.csv"
        pd.DataFrame([log]).to_csv(
            log_file,
            mode="a",
            header=not os.path.exists(log_file),
            index=False
        )

        return jsonify({
            "loan_status": result,
            "confidence": float(prob)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =====================================================
# FRAUD DETECTION API
# =====================================================
@app.route("/fraud-predict", methods=["POST"])
def fraud_predict():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No input data provided"}), 400

        df = pd.DataFrame([data])

        # enforce schema
        df = df.reindex(columns=fraud_columns)

        # numeric conversion
        for col in fraud_columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

        prob = fraud_model.predict_proba(df)[0][1]
        pred = fraud_model.predict(df)[0]

        result = "Fraud" if pred == 1 else "Legitimate"

        log = {
            "timestamp": str(datetime.now()),
            "prediction": result,
            "fraud_probability": float(prob)
        }

        log_file = "logs/fraud_logs.csv"
        pd.DataFrame([log]).to_csv(
            log_file,
            mode="a",
            header=not os.path.exists(log_file),
            index=False
        )

        return jsonify({
            "transaction_status": result,
            "fraud_probability": float(prob)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =====================================================
# AI CHATBOT API
# =====================================================
@app.route("/chat", methods=["POST"])
def chat():
    """Banking AI Chatbot endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No input data provided"}), 400
        
        session_id = data.get("session_id", "default")
        message = data.get("message", "")
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        # 1️⃣ Guardrail filter
        if not is_banking_query(message):
            return jsonify({
                "response": "I am a banking assistant and can only help with banking related queries."
            })
        
        # 2️⃣ Save user message
        add_memory(session_id, "user", message)
        
        # 3️⃣ Create conversation
        history = get_memory(session_id)
        chat_session = gemini_model.start_chat(history=history)
        
        # 4️⃣ Send prompt
        response = chat_session.send_message(
            SYSTEM_PROMPT + "\nUser Question: " + message
        )
        
        # 5️⃣ Save AI response
        add_memory(session_id, "model", response.text)
        
        return jsonify({
            "response": response.text
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------- RUN SERVER ----------------
if __name__ == "__main__":
    app.run(debug=True, port=5000, host="0.0.0.0")
