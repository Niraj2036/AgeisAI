from flask import Flask, request, jsonify
import pandas as pd
import joblib
import os
from datetime import datetime

app = Flask(__name__)

# ---------------- CREATE REQUIRED FOLDERS ----------------
os.makedirs("logs", exist_ok=True)
os.makedirs("models", exist_ok=True)

# ---------------- LOAD MODELS ----------------
loan_model = joblib.load("models/loan_model.pkl")
loan_encoders = joblib.load("models/loan_encoders.pkl")
loan_columns = joblib.load("models/loan_columns.pkl")

fraud_model = joblib.load("models/fraud_model.pkl")
fraud_columns = joblib.load("models/fraud_columns.pkl")

# ---------------- HELPERS ----------------
def clean_text(val):
    return str(val).strip().lower()

@app.route("/")
def home():
    return "Bank AI Backend Running"


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


# ---------------- RUN SERVER ----------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
