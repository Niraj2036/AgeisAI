# AgeisAI - AI Observability Platform for Banking

A comprehensive AI observability and monitoring platform designed for banking applications, providing real-time monitoring, fraud detection, loan prediction, and AI chatbot capabilities.To integrate it with the existing system you just need to get the credentials from our website and then within one line of code the system will be integrated with our dashboard..

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATIONS                          │
│  (Banking Apps, ML Services, AI Services using AegisAI SDK)     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ AegisAI SDK
                             │ (Auto-instrumentation)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AEGISAI SDK (Library)                         │
│  • Auto-patches ML models (sklearn)                             │
│  • Auto-patches LLM calls (Gemini)                              │
│  • Buffers and batches events                                   │
│  • Sends telemetry to server                                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS
                             │ (Events, Metrics, Logs)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                 AEGISAI SERVER (FastAPI)                        │
│  • Authentication & Authorization                               │
│  • Event Ingestion API                                          │
│  • Dashboard Data API                                           │
│  • Background Workers                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ MongoDB
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                             │
│  • ML Events Storage                                            │
│  • LLM Events Storage                                           │
│  • Audit Logs                                                   │
│  • Metrics & Analytics                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    DEMO SERVER (Flask)                          │
│  • Loan Prediction API                                          │
│  • Fraud Detection API                                          │
│  • Banking AI Chatbot                                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ REST API
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                           │
│  • Real-time Dashboard                                          │
│  • ML Model Monitoring                                          │
│  • LLM Monitoring                                               │
│  • Risk Engine Visualization                                    │
│  • Audit Logs                                                   │
│  • Alerts & Notifications                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Flow

1. **Client Applications** → Use AegisAI SDK to instrument their ML/LLM code
2. **AegisAI SDK** → Automatically tracks events and sends to server
3. **AegisAI Server** → Receives, processes, and stores events in MongoDB
4. **Frontend** → Queries server to display real-time dashboards
5. **Demo Server** → Provides banking AI services (loan, fraud, chatbot)

## 📦 Components

### 1. **AegisAI SDK** (`ageisai-sdk/`)
Python library that automatically instruments ML models and LLM calls, collecting telemetry data and sending it to the observability server.

### 2. **AegisAI Server** (`ageisai-server/`)
FastAPI-based backend server that receives, processes, and stores observability data. Provides APIs for authentication, data ingestion, and dashboard queries.

### 3. **Demo Server** (`demo-server/`)
Flask application demonstrating banking AI capabilities:
- **Loan Prediction**: ML model for loan approval decisions
- **Fraud Detection**: ML model for transaction fraud detection
- **AI Chatbot**: Banking assistant powered by Google Gemini

### 4. **Frontend** (`frontend/`)
Next.js/React dashboard providing real-time visualization of:
- ML model performance metrics
- LLM usage and costs
- Risk engine analytics
- Audit logs and compliance tracking
- Alerts and notifications

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- MongoDB (for AegisAI Server)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Innovgenius
   ```

2. **Set up AegisAI SDK**
   ```bash
   cd ageisai-sdk
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -e .
   ```

3. **Set up AegisAI Server**
   ```bash
   cd ageisai-server
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   # Configure MongoDB connection in .env
   uvicorn app.main:app --reload
   ```

4. **Set up Demo Server**
   ```bash
   cd demo-server
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   # Add GEMINI_API_KEY to .env
   python app.py
   ```

5. **Set up Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

**AegisAI Server** (`.env`):
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=aegisai
JWT_SECRET=your-secret-key
```

**Demo Server** (`.env`):
```
GEMINI_API_KEY=your-gemini-api-key
```

## 📊 Data Flow

1. **Client Application** uses AegisAI SDK
2. SDK automatically patches ML/LLM calls
3. Events are buffered and batched
4. Batched events sent to AegisAI Server
5. Server stores data in MongoDB
6. Frontend queries server for real-time dashboards

## 🔐 Security

- JWT-based authentication for API access
- Secure token storage in SDK
- CORS configuration for frontend
- Environment-based configuration

## 📝 API Endpoints

### AegisAI Server
- `POST /auth/token` - Get access token
- `POST /ingest/ml` - Ingest ML events
- `POST /ingest/llm` - Ingest LLM events
- `GET /dashboard/*` - Dashboard data endpoints

### Demo Server
- `POST /loan-predict` - Loan prediction
- `POST /fraud-predict` - Fraud detection
- `POST /chat` - AI chatbot

## 🧪 Testing

Each component includes its own test suite. Refer to individual README files for testing instructions.

## 📄 License

[Add your license here]

## 🤝 Contributing

[Add contribution guidelines here]

## 📧 Contact

[Add contact information here]
