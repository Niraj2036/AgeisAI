# AegisAI Server - Observability Backend

A FastAPI-based backend server for collecting, processing, and serving AI/ML observability data. Provides authentication, event ingestion, and dashboard APIs for the AegisAI observability platform.

## 🎯 Overview

The AegisAI Server is the central backend that:
- **Authenticates** client applications using JWT tokens
- **Ingests** ML and LLM events from instrumented applications
- **Stores** telemetry data in MongoDB
- **Serves** dashboard data to the frontend
- **Processes** background tasks for analytics and alerts

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│      FastAPI Application                │
│  ┌───────────────────────────────────┐  │
│  │  Authentication Router            │  │
│  │  • POST /auth/token               │  │
│  │  • JWT token generation           │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Ingestion Router                 │  │
│  │  • POST /ingest/ml                │  │
│  │  • POST /ingest/llm               │  │
│  │  • Event validation & storage      │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Dashboard Router                 │  │
│  │  • GET /dashboard/overview        │  │
│  │  • GET /dashboard/ml-metrics      │  │
│  │  • GET /dashboard/llm-metrics     │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Background Workers                │  │
│  │  • Periodic analytics              │  │
│  │  • Alert processing                │  │
│  │  • Data aggregation                │  │
│  └───────────────────────────────────┘  │
└───────────────┬─────────────────────────┘
                │
                │ Motor (Async MongoDB)
                │
                ▼
┌─────────────────────────────────────────┐
│         MongoDB Database                │
│  • ml_events collection                │
│  • llm_events collection               │
│  • audit_logs collection               │
│  • users collection                    │
└─────────────────────────────────────────┘
```

## 🚀 Installation

### Prerequisites

- Python 3.8+
- MongoDB 4.4+ (running locally or remotely)
- Virtual environment (recommended)

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
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URL=mongodb://localhost:27017
   DATABASE_NAME=aegisai
   JWT_SECRET=your-secret-key-here
   JWT_ALGORITHM=HS256
   JWT_EXPIRATION=3600
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Run the server**
   ```bash
   uvicorn app.main:app --reload
   ```

   Or use the built-in runner:
   ```bash
   python -m app.main
   ```

The server will start on `http://localhost:8000`

## 📁 Project Structure

```
ageisai-server/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── api/
│   │   └── routes/
│   │       ├── auth.py         # Authentication endpoints
│   │       ├── ingest.py       # Event ingestion endpoints
│   │       └── dashboard.py    # Dashboard data endpoints
│   ├── auth/
│   │   ├── __init__.py
│   │   └── jwt.py              # JWT token handling
│   ├── core/
│   │   ├── config.py           # Configuration management
│   │   └── logging_middleware.py  # Request logging
│   ├── db/
│   │   └── mongo.py            # MongoDB connection
│   ├── models/
│   │   ├── event.py            # Event data models
│   │   └── user.py             # User models
│   ├── schemas/
│   │   ├── auth.py             # Auth request/response schemas
│   │   ├── event.py            # Event schemas
│   │   └── dashboard.py        # Dashboard response schemas
│   ├── services/
│   │   ├── analytics.py        # Analytics processing
│   │   ├── alerts.py           # Alert processing
│   │   └── storage.py          # Data storage operations
│   └── workers/
│       └── background.py       # Background task workers
├── requirements.txt
└── README.md
```

## 📡 API Documentation

### Interactive API Docs

Once the server is running, access:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Authentication

#### Get Access Token

```http
POST /auth/token
Content-Type: application/json
```

**Request Body:**
```json
{
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### Event Ingestion

#### Ingest ML Events

```http
POST /ingest/ml
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "events": [
    {
      "model_type": "RandomForestClassifier",
      "model_id": "model_hash_123",
      "input_shape": [100, 10],
      "prediction_count": 100,
      "timestamp": "2024-01-01T12:00:00Z",
      "metadata": {
        "n_estimators": 100
      }
    }
  ]
}
```

#### Ingest LLM Events

```http
POST /ingest/llm
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "events": [
    {
      "model_name": "gemini-2.0-flash",
      "prompt_length": 50,
      "response_length": 200,
      "tokens_used": 250,
      "cost": 0.001,
      "timestamp": "2024-01-01T12:00:00Z",
      "metadata": {
        "temperature": 0.7
      }
    }
  ]
}
```

### Dashboard APIs

#### Get Overview

```http
GET /dashboard/overview
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_ml_predictions": 10000,
  "total_llm_requests": 5000,
  "active_models": 5,
  "total_cost": 125.50,
  "recent_events": [...]
}
```

#### Get ML Metrics

```http
GET /dashboard/ml-metrics?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <token>
```

#### Get LLM Metrics

```http
GET /dashboard/llm-metrics?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <token>
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `DATABASE_NAME` | Database name | `aegisai` |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `JWT_EXPIRATION` | Token expiration (seconds) | `3600` |
| `LOG_LEVEL` | Logging level | `INFO` |

### Settings

Configuration is managed in `app/core/config.py` using Pydantic Settings:

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongodb_url: str
    database_name: str
    jwt_secret: str
    # ...
```

## 🗄️ Database Schema

### ML Events Collection

```javascript
{
  "_id": ObjectId,
  "client_id": String,
  "model_type": String,
  "model_id": String,
  "input_shape": [Number],
  "prediction_count": Number,
  "timestamp": ISODate,
  "metadata": Object
}
```

### LLM Events Collection

```javascript
{
  "_id": ObjectId,
  "client_id": String,
  "model_name": String,
  "prompt_length": Number,
  "response_length": Number,
  "tokens_used": Number,
  "cost": Number,
  "timestamp": ISODate,
  "metadata": Object
}
```

### Audit Logs Collection

```javascript
{
  "_id": ObjectId,
  "event_type": String,
  "client_id": String,
  "action": String,
  "timestamp": ISODate,
  "details": Object
}
```

## 🔄 Background Workers

The server runs background tasks for:
- **Analytics Processing**: Aggregate metrics periodically
- **Alert Processing**: Check alert conditions
- **Data Cleanup**: Remove old events (optional)

Workers are started automatically when the server starts.

## 🔒 Security

### Authentication

- JWT-based authentication
- Token expiration and refresh
- Secure secret key management

### CORS

CORS is configured to allow frontend access:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Input Validation

- Pydantic models for request validation
- Type checking and data validation
- Error handling for invalid inputs

## 📊 Logging

The server includes comprehensive logging:
- Request/response logging middleware
- Error logging
- Background task logging

Log format:
```
2024-01-01 12:00:00 - aegisai - INFO - Event ingested: ml_prediction
```

## 🧪 Testing

### Manual Testing

Use the interactive API docs at `/docs` to test endpoints.

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Verify MongoDB is running: `mongosh` or `mongo`
- Check connection string in `.env`
- Verify network connectivity
- Check MongoDB authentication if required

### Authentication Failures

- Verify `JWT_SECRET` is set
- Check client credentials are correct
- Verify token expiration settings

### Port Already in Use

- Change port: `uvicorn app.main:app --port 8001`
- Or stop the process using port 8000

## 🚀 Production Deployment

### Environment Setup

1. Set secure environment variables
2. Use strong `JWT_SECRET`
3. Configure CORS for specific origins
4. Set up MongoDB with authentication
5. Use HTTPS

### Running with Gunicorn

```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Docker (if applicable)

```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📝 API Rate Limiting

Consider implementing rate limiting for production:
- Per-client rate limits
- Per-endpoint rate limits
- Burst protection

## 🔄 Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] Advanced analytics and ML insights
- [ ] Alert rules engine
- [ ] Data export functionality
- [ ] Multi-tenancy support
- [ ] API versioning
- [ ] Caching layer (Redis)
- [ ] GraphQL API option

## 📄 License

[Add your license here]

## 🤝 Contributing

[Add contribution guidelines here]

## 📧 Support

[Add support contact information]
