# Demo Server - Banking AI Services

A Flask-based microservice providing ML-powered banking services including loan prediction, fraud detection, and an AI-powered banking chatbot.

## 🎯 Overview

The Demo Server is a unified Flask application that combines three key banking AI services:

1. **Loan Prediction Service**: ML model for automated loan approval decisions
2. **Fraud Detection Service**: Real-time transaction fraud detection
3. **Banking AI Chatbot**: Conversational AI assistant for banking queries

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Flask Application               │
│  ┌───────────────────────────────────┐  │
│  │  Loan Prediction Endpoint         │  │
│  │  • Loads loan_model.pkl           │  │
│  │  • Processes loan applications    │  │
│  │  • Returns approval/rejection     │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Fraud Detection Endpoint          │  │
│  │  • Loads fraud_model.pkl          │  │
│  │  • Analyzes transactions          │  │
│  │  • Returns fraud probability      │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  AI Chatbot Endpoint              │  │
│  │  • Google Gemini 2.0 Flash        │  │
│  │  • Banking-focused responses      │  │
│  │  • Session memory management      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## 📋 Features

### 1. Loan Prediction API
- **Endpoint**: `POST /loan-predict`
- **Input**: Loan application data (income, credit score, assets, etc.)
- **Output**: Approval status and confidence score
- **Model**: Random Forest Classifier
- **Logging**: All predictions logged to `logs/loan_logs.csv`

### 2. Fraud Detection API
- **Endpoint**: `POST /fraud-predict`
- **Input**: Transaction features (V1-V28 from credit card dataset)
- **Output**: Fraud status and probability
- **Model**: XGBoost or Random Forest (selected by recall)
- **Logging**: All predictions logged to `logs/fraud_logs.csv`

### 3. Banking AI Chatbot
- **Endpoint**: `POST /chat`
- **Input**: Session ID and user message
- **Output**: AI-generated banking response
- **Model**: Google Gemini 2.0 Flash
- **Features**:
  - Banking-focused guardrails
  - Session-based memory (last 10 messages)
  - Context-aware responses

## 🚀 Installation

### Prerequisites
- Python 3.8+
- Trained ML models in `models/` directory:
  - `loan_model.pkl`
  - `loan_encoders.pkl`
  - `loan_columns.pkl`
  - `fraud_model.pkl`
  - `fraud_columns.pkl`

### Setup

1. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   Create a `.env` file:
   ```env
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

4. **Ensure models are present**
   - Place trained models in `models/` directory
   - Or train models using `Loan.py` and `Credit.py` scripts

5. **Run the server**
   ```bash
   python app.py
   ```

The server will start on `http://localhost:5000`

## 📡 API Documentation

### Health Check
```http
GET /
```
**Response:**
```json
{
  "message": "Bank AI Backend Running",
  "endpoints": {
    "loan_prediction": "/loan-predict",
    "fraud_detection": "/fraud-predict",
    "chatbot": "/chat"
  }
}
```

### Loan Prediction

```http
POST /loan-predict
Content-Type: application/json
```

**Request Body:**
```json
{
  "no_of_dependents": 2,
  "education": "Graduate",
  "self_employed": "No",
  "income_annum": 500000,
  "loan_amount": 2000000,
  "loan_term": 20,
  "cibil_score": 750,
  "residential_assets_value": 5000000,
  "commercial_assets_value": 2000000,
  "luxury_assets_value": 1000000,
  "bank_asset_value": 3000000
}
```

**Response:**
```json
{
  "loan_status": "Approved",
  "confidence": 0.85
}
```

### Fraud Detection

```http
POST /fraud-predict
Content-Type: application/json
```

**Request Body:**
```json
{
  "V1": -1.359807134,
  "V2": -0.072781173,
  "V3": 2.536346738,
  ...
  "V28": 0.133558377,
  "Amount": 149.62
}
```

**Response:**
```json
{
  "transaction_status": "Legitimate",
  "fraud_probability": 0.02
}
```

### AI Chatbot

```http
POST /chat
Content-Type: application/json
```

**Request Body:**
```json
{
  "session_id": "user123",
  "message": "What is the interest rate for home loans?"
}
```

**Response:**
```json
{
  "response": "Home loan interest rates typically range from 8.5% to 10.5% per annum, depending on factors such as credit score, loan amount, and tenure..."
}
```

## 🧪 Training Models

### Loan Model Training
```bash
python Loan.py
```
This will:
- Load loan approval dataset
- Train Random Forest model
- Save model and encoders to `models/` directory

### Fraud Model Training
```bash
python Credit.py
```
This will:
- Load credit card fraud dataset
- Train XGBoost and Random Forest models
- Select best model based on recall
- Save model to `models/` directory

## 📁 Project Structure

```
demo-server/
├── app.py                 # Main Flask application
├── Loan.py               # Loan model training script
├── Credit.py             # Fraud model training script
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables (create this)
├── models/               # ML model files (gitignored)
│   ├── loan_model.pkl
│   ├── loan_encoders.pkl
│   ├── loan_columns.pkl
│   ├── fraud_model.pkl
│   └── fraud_columns.pkl
└── logs/                 # Prediction logs (gitignored)
    ├── loan_logs.csv
    └── fraud_logs.csv
```

## 🔒 Security Considerations

- **Input Validation**: All endpoints validate input data
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
- **Logging**: All predictions are logged for audit purposes
- **CORS**: Enabled for frontend integration (configure appropriately for production)

## 🐛 Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request (missing/invalid input)
- `500`: Internal Server Error

Error response format:
```json
{
  "error": "Error message description"
}
```

## 📊 Logging

All predictions are automatically logged to CSV files:
- **Loan predictions**: `logs/loan_logs.csv`
- **Fraud predictions**: `logs/fraud_logs.csv`

Log format includes:
- Timestamp
- Input features
- Prediction result
- Confidence/probability score

## 🔧 Configuration

### Port Configuration
Default port is `5000`. To change:
```python
app.run(debug=True, port=YOUR_PORT, host="0.0.0.0")
```

### Model Paths
Models are loaded from `models/` directory. Ensure all required model files are present before starting the server.

## 🚨 Troubleshooting

### Model Not Found Error
- Ensure all model files exist in `models/` directory
- Train models using `Loan.py` and `Credit.py` if missing

### Gemini API Error
- Verify `GEMINI_API_KEY` is set in `.env` file
- Check API key validity and quota

### Port Already in Use
- Change port in `app.py` or stop the process using port 5000

## 📝 Notes

- The chatbot uses session-based memory (last 10 messages)
- Banking guardrails ensure only banking-related queries are answered
- Models should be retrained periodically with new data
- Logs can grow large; implement log rotation for production

## 🔄 Future Enhancements

- [ ] Add authentication/authorization
- [ ] Implement rate limiting
- [ ] Add model versioning
- [ ] Implement A/B testing for models
- [ ] Add metrics endpoint for monitoring
- [ ] Implement request/response caching
- [ ] Add Swagger/OpenAPI documentation
