# AegisAI SDK - AI Observability Library

A Python SDK that automatically instruments ML models and LLM calls, collecting telemetry data and sending it to the AegisAI observability server for monitoring and analysis.

## 🎯 Overview

AegisAI SDK provides automatic instrumentation for:
- **ML Models**: Scikit-learn models (auto-patches `predict()` methods)
- **LLM Calls**: Google Gemini API calls (auto-patches API methods)
- **Event Batching**: Efficiently batches and sends events to the server
- **Background Processing**: Non-blocking event transmission

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│      Your Application Code              │
│  ┌───────────────────────────────────┐  │
│  │  from aegisai import init         │  │
│  │  init(client_id, client_secret)   │  │
│  └───────────────────────────────────┘  │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│         AegisAI SDK                     │
│  ┌───────────────────────────────────┐  │
│  │  Authentication                    │  │
│  │  • Gets JWT token from server      │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Auto-Patching                    │  │
│  │  • Patches sklearn.predict()      │  │
│  │  • Patches Gemini API calls       │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Event Tracking                   │  │
│  │  • ML prediction events            │  │
│  │  • LLM request/response events     │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Buffer & Batch                   │  │
│  │  • Buffers events in memory       │  │
│  │  • Batches for efficient sending  │  │
│  └───────────────────────────────────┘  │
└───────────────┬─────────────────────────┘
                │
                │ HTTP POST
                │ (Batched Events)
                ▼
┌─────────────────────────────────────────┐
│      AegisAI Server                     │
│      (FastAPI Backend)                  │
└─────────────────────────────────────────┘
```

## 🚀 Installation

### From Source

```bash
cd ageisai-sdk
pip install -e .
```

### From Requirements

```bash
pip install -r requirements.txt
```

## 📖 Usage

### Basic Setup

```python
from aegisai import init

# Initialize SDK with credentials
init(
    client_id="your-client-id",
    client_secret="your-client-secret",
    server_url="http://localhost:8000"  # Optional, defaults to localhost:8000
)
```

### Automatic ML Model Instrumentation

Once initialized, the SDK automatically patches scikit-learn models:

```python
from sklearn.ensemble import RandomForestClassifier
import pandas as pd

# SDK automatically tracks this prediction
model = RandomForestClassifier()
model.fit(X_train, y_train)

# This call is automatically instrumented
predictions = model.predict(X_test)
# Event sent to server: model type, input shape, prediction count, timestamp
```

### Automatic LLM Instrumentation

The SDK automatically tracks Gemini API calls:

```python
import google.generativeai as genai

genai.configure(api_key="your-api-key")
model = genai.GenerativeModel("gemini-2.0-flash")

# This call is automatically instrumented
response = model.generate_content("What is AI?")
# Event sent to server: model name, prompt length, response length, tokens, cost
```

### Complete Example

```python
from aegisai import init
from sklearn.ensemble import RandomForestClassifier
import pandas as pd

# 1. Initialize SDK
init(
    client_id="your-client-id",
    client_secret="your-client-secret"
)

# 2. Use ML models (automatically tracked)
model = RandomForestClassifier()
model.fit(X_train, y_train)
predictions = model.predict(X_test)  # Automatically tracked

# 3. Use LLM (automatically tracked)
import google.generativeai as genai
genai.configure(api_key="your-key")
llm = genai.GenerativeModel("gemini-2.0-flash")
response = llm.generate_content("Hello")  # Automatically tracked
```

## 📁 Project Structure

```
ageisai-sdk/
├── ageisai/
│   ├── __init__.py          # Public API (init function)
│   ├── core.py              # Main initialization logic
│   ├── auth.py              # Authentication with server
│   ├── config.py            # Configuration management
│   ├── patcher.py           # Auto-patching logic
│   ├── buffer.py            # Event buffering and batching
│   ├── sender.py            # HTTP event transmission
│   └── trackers/
│       ├── __init__.py
│       ├── ml.py            # ML model tracking
│       └── gemini.py        # Gemini LLM tracking
├── setup.py                 # Package setup
└── requirements.txt         # Dependencies
```

## 🔧 Configuration

### Environment Variables

The SDK can be configured via environment variables:

```bash
AEGISAI_SERVER_URL=http://your-server.com:8000
```

### Programmatic Configuration

```python
from aegisai import init

init(
    client_id="your-id",
    client_secret="your-secret",
    server_url="https://api.aegisai.com"  # Override default
)
```

## 📊 Tracked Events

### ML Model Events

When a scikit-learn model's `predict()` is called, the SDK tracks:

```json
{
  "event_type": "ml_prediction",
  "model_type": "RandomForestClassifier",
  "model_id": "model_hash",
  "input_shape": [100, 10],
  "prediction_count": 100,
  "timestamp": "2024-01-01T12:00:00Z",
  "metadata": {
    "n_estimators": 100,
    "max_depth": 10
  }
}
```

### LLM Events

When a Gemini API call is made, the SDK tracks:

```json
{
  "event_type": "llm_request",
  "model_name": "gemini-2.0-flash",
  "prompt_length": 50,
  "response_length": 200,
  "tokens_used": 250,
  "cost": 0.001,
  "timestamp": "2024-01-01T12:00:00Z",
  "metadata": {
    "temperature": 0.7,
    "max_tokens": 1000
  }
}
```

## 🔄 Event Batching

The SDK automatically batches events for efficient transmission:

- Events are buffered in memory
- Batches are sent periodically (configurable)
- Batch size limit prevents memory issues
- Failed sends are retried (with backoff)

## 🔐 Authentication

The SDK uses JWT-based authentication:

1. On initialization, sends `client_id` and `client_secret` to server
2. Server returns JWT `access_token`
3. Token is stored and used for all subsequent API calls
4. Token is automatically refreshed if expired

## 🛠️ Advanced Usage

### Custom Server URL

```python
from aegisai import init

init(
    client_id="your-id",
    client_secret="your-secret",
    server_url="https://custom-server.com:8000"
)
```

### Late Import Detection

The SDK automatically detects late imports of sklearn or Gemini:

```python
from aegisai import init

init(client_id="id", client_secret="secret")

# Even if imported later, SDK will patch it
from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier()
model.predict(X)  # Still tracked!
```

## 🐛 Troubleshooting

### Authentication Failed

- Verify `client_id` and `client_secret` are correct
- Check server is running and accessible
- Verify network connectivity

### Events Not Sending

- Check server URL is correct
- Verify authentication token is valid
- Check network/firewall settings
- Look for error messages in console

### Models Not Being Tracked

- Ensure SDK is initialized before importing models
- Check that models are scikit-learn compatible
- Verify patching succeeded (look for "[AegisAI] sklearn instrumentation enabled")

## 📝 Dependencies

- `requests`: HTTP communication with server
- `google-generativeai`: For Gemini API (if using LLM)
- `scikit-learn`: For ML models (if using ML)

## 🔒 Security

- Credentials are stored in memory only
- JWT tokens are securely transmitted
- No sensitive data is logged
- All communication should use HTTPS in production

## 🚀 Performance

- **Non-blocking**: Event sending happens in background
- **Batched**: Events are batched for efficiency
- **Lightweight**: Minimal overhead on your application
- **Async**: Background worker handles transmission

## 📄 License

[Add your license here]

## 🤝 Contributing

[Add contribution guidelines here]

## 📧 Support

[Add support contact information]
