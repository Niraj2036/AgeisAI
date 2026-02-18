# AegisAI Backend

A **FastAPI** backend for the AegisAI AI observability platform. It ingests ML and LLM telemetry, monitors model drift and system health, classifies event risk, raises alerts, and exposes dashboard analytics—all with async-first design and JWT-secured APIs.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database](#database)
- [Authentication](#authentication)
- [API Reference](#api-reference)
- [Ingestion Pipeline](#ingestion-pipeline)
- [Risk Classification Layer](#risk-classification-layer)
- [Drift & Health](#drift--health)
- [Alerts](#alerts)
- [Dashboard](#dashboard)
- [Running the Application](#running-the-application)
- [Development Notes](#development-notes)

---

## Overview

AegisAI Backend is the server component of an AI observability stack. It:

- **Ingests** batch telemetry for ML predictions and LLM interactions.
- **Stores** events in MongoDB with optional risk classification fields.
- **Computes** drift (ML latency vs baseline) and overall health (drift + LLM latency).
- **Classifies** every event by risk: `normal`, `suspicious`, or `risky`.
- **Raises** alerts for high drift, low health, and risky events.
- **Exposes** dashboard APIs for health, alerts, models, and risk distribution.

All ingestion and dashboard endpoints (except `/auth/token` and `/health`) require a valid JWT obtained via `POST /auth/token` using API key credentials.

---

## Features

| Feature | Description |
|--------|-------------|
| **ML telemetry** | Batch ingestion of ML events (model, prediction, input_data, latency). |
| **LLM telemetry** | Batch ingestion of LLM events (prompt, response, latency, token estimate). |
| **Drift detection** | Compares current ML latency to baseline in `model_profiles`; stores drift metrics. |
| **Health score** | 0–100 score from recent drift and LLM latency; stored per organization. |
| **Risk classification** | Every ML and LLM event gets `riskScore` (0–1) and `riskLabel` (normal/suspicious/risky). |
| **ML risk** | Confidence, drift, and outlier (z-score) signals combined into one score. |
| **LLM risk** | Sensitive content, jailbreak patterns, and prompt length combined into one score. |
| **Alerts** | Drift, health, and risk alerts stored in `alerts`; dashboard can list them. |
| **Dashboard** | Health, alerts, model summaries, and risk distribution by label. |

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Framework** | FastAPI (async) |
| **Database** | MongoDB (async driver: Motor) |
| **Validation & settings** | Pydantic v2, pydantic-settings |
| **Auth** | JWT (python-jose), HTTP Bearer; API keys hashed with passlib/bcrypt |
| **Server** | Uvicorn (ASGI) |
| **Env** | python-dotenv, `.env` for config |

---

## Project Structure

The following tree reflects the **actual repository layout** (source and config only; `venv/` and `__pycache__/` are omitted).

```
ageisai-server/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── logging_middleware.py
│   │   └── risk.py
│   ├── db/
│   │   └── mongo.py
│   ├── models/
│   │   ├── common.py
│   │   └── domain.py
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── dashboard.py
│   │   └── ingest.py
│   ├── api/
│   │   └── routes/
│   │       ├── auth.py
│   │       ├── dashboard.py
│   │       └── ingest.py
│   ├── auth/
│   │   ├── dependencies.py
│   │   └── jwt_utils.py
│   └── services/
│       ├── alert_service.py
│       ├── drift_detector.py
│       ├── health_service.py
│       ├── llm_risk_classifier.py
│       └── ml_risk_classifier.py
├── requirements.txt
└── README.md
```

**Note:** `main.py` imports `app.workers.background` (`start_periodic_tasks`, `stop_periodic_tasks`). The **`app/workers/`** package is **not present** in the repo. The app will fail at startup until you add that module or remove the import. To run as-is, create `app/workers/background.py` with async no-op implementations of those two functions.

### File roles (summary)

| Path | Role |
|------|------|
| **app/main.py** | FastAPI app, lifespan (Mongo connect, periodic task start/stop, disconnect), CORS and logging middleware, router registration (`/auth`, `/ingest`, `/dashboard`), `GET /health`. |
| **app/core/config.py** | Pydantic Settings: Mongo URI/DB name, JWT secret/algorithm/expiry, drift and health thresholds; loaded from env/`.env`. |
| **app/core/logging_middleware.py** | Logs each request: method, path, status code, duration (ms). |
| **app/core/risk.py** | `RiskLabel` enum (normal/suspicious/risky), `classify_risk(score)` for ML/LLM risk labels. |
| **app/db/mongo.py** | Motor client and DB singleton; `connect_to_mongo()` / `close_mongo_connection()`; `get_db()`; ensures risk indexes on `ml_events` and `llm_events`. |
| **app/models/common.py** | `PyObjectId`, `MongoModel` base for domain models. |
| **app/models/domain.py** | Domain models: Organization, APIKey, MLEvent, LLMEvent, ModelProfile, DriftMetric, Alert, HealthScore. |
| **app/schemas/auth.py** | TokenRequest, TokenResponse, ClientCredentialsResponse. |
| **app/schemas/ingest.py** | MLEventIn, LLMEventIn, MLEventBatch, LLMEventBatch. |
| **app/schemas/dashboard.py** | HealthScoreOut, AlertOut, ModelSummary, ModelsResponse, RiskDistributionOut. |
| **app/api/routes/auth.py** | POST `/auth/token`, GET `/auth/credentials`, POST `/auth/credentials/refresh`. |
| **app/api/routes/ingest.py** | POST `/ingest/ml`, POST `/ingest/llm`; background tasks for drift, ML risk, LLM risk, health. |
| **app/api/routes/dashboard.py** | GET `/dashboard/health`, `/alerts`, `/models`, `/risk-distribution`. |
| **app/auth/dependencies.py** | `get_current_org_id`, `get_current_api_key` (JWT validation, DB lookup for API key). |
| **app/auth/jwt_utils.py** | `create_access_token`, `decode_token` (JWT encode/decode). |
| **app/services/drift_detector.py** | `compute_mean_latency`, `compute_drift_score` (vs `model_profiles` baseline). |
| **app/services/health_service.py** | `compute_health_score` (drift + LLM latency penalties). |
| **app/services/alert_service.py** | `create_drift_alert_if_needed`, `create_health_alert_if_needed`, `create_risk_alert_if_needed`. |
| **app/services/ml_risk_classifier.py** | `compute_ml_risk` (confidence, drift, outlier → riskScore/riskLabel/factors). |
| **app/services/llm_risk_classifier.py** | `compute_llm_risk` (sensitive, jailbreak, length → riskScore/riskLabel/flags). |

---

## Prerequisites

- **Python** 3.10+ (or 3.9+ with compatible type hints)
- **MongoDB** running and reachable (e.g. `mongodb://localhost:27017`)
- **API keys** stored in MongoDB `api_keys` with `client_id`, `client_secret_hash` (bcrypt), `organization_id`, `is_active: true`

---

## Installation

1. **Clone and enter the project**

   ```bash
   cd ageisai-server
   ```

2. **Create and activate a virtual environment**

   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # Linux/macOS
   source venv/bin/activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment** (see [Configuration](#configuration))

5. **Ensure MongoDB is running** and that the database has an `api_keys` collection with at least one active key for your organization.

---

## Configuration

Configuration is via **environment variables** or a **`.env`** file in the project root. Pydantic-settings loads from `env` and `.env`.

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGO_DB_NAME` | Database name | `aegisai` |
| `JWT_SECRET_KEY` | Secret for signing/verifying JWTs | `CHANGE_ME` (must override in production) |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `JWT_ACCESS_TOKEN_EXPIRES_MINUTES` | Token expiry in minutes | `60` |
| `DRIFT_LATENCY_THRESHOLD_MS` | Used in drift alert threshold mapping | `2000.0` |
| `HEALTH_MIN_SCORE` | Minimum health score cap | `0.0` |
| `HEALTH_MAX_SCORE` | Maximum health score cap | `100.0` |
| `APP_NAME` | Application title | `AegisAI Backend` |
| `ENVIRONMENT` | e.g. development/production | `development` |
| `DEBUG` | Debug mode | `True` |

Example `.env`:

```bash
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=aegisai
JWT_SECRET_KEY=your-secret-key-here
```

---

## Database

### MongoDB database

- **Single database** (name from `MONGO_DB_NAME`).
- **Motor** (async) driver; one global client and database instance.

### Collections

| Collection | Purpose |
|------------|---------|
| **api_keys** | API key credentials: `organization_id`, `client_id`, `client_secret_hash`, `is_active`, `created_at`. |
| **ml_events** | ML prediction events: `organization_id`, `model_name`, `prediction`, `input_data`, `latency_ms`, `timestamp`. After risk run: `riskScore`, `riskLabel`. |
| **llm_events** | LLM events: `organization_id`, `model_name`, `prompt`, `response`, `latency_ms`, `token_count`, `timestamp`. After risk run: `riskScore`, `riskLabel`, `flags`. |
| **model_profiles** | Per-model baseline: `organization_id`, `model_name`, `baseline_latency_ms`, `created_at`. Optional: `feature_stats` for ML outlier risk. |
| **drift_metrics** | Drift snapshots: `organization_id`, `model_name`, `window_start`, `window_end`, `mean_latency_ms`, `drift_score`, `created_at`. |
| **health_scores** | One document per org: `organization_id`, `score`, `details`, `created_at`, `updated_at`. |
| **alerts** | All alerts: `organization_id`, `model_name` (optional), `type` (`drift` \| `health` \| `risk`), `message`, `severity`, `created_at`, `resolved`. |

### Indexes (created on startup)

- **ml_events**: `(riskLabel, timestamp)`, `(organization_id, riskLabel)`.
- **llm_events**: `(riskLabel, timestamp)`, `(organization_id, riskLabel)`.

Index creation runs inside `connect_to_mongo()` in `app/db/mongo.py`.

---

## Authentication

### Flow

1. Client has a **clientId** and **clientSecret** (from initial setup or credential refresh).
2. **POST /auth/token** with JSON body `{"clientId": "...", "clientSecret": "..."}`.
3. Server looks up `api_keys` by `client_id` and `is_active: true`, verifies secret against `client_secret_hash` (bcrypt).
4. On success, returns a **JWT** with `sub` = client_id and custom claim **orgId** = organization’s ObjectId string.
5. Client sends **Authorization: Bearer &lt;token&gt;** on all protected routes (ingest and dashboard).

### Protected routes

- Ingest: `POST /ingest/ml`, `POST /ingest/llm`.
- Dashboard: `GET /dashboard/health`, `GET /dashboard/alerts`, `GET /dashboard/models`, `GET /dashboard/risk-distribution`.

Dependencies in `app/auth/dependencies.py`:

- **get_current_org_id**: Validates Bearer token and returns `org_id` (ObjectId) for use in queries.
- **get_current_api_key**: Validates Bearer token and returns the current `APIKey` document (used for credential refresh).

### Credential refresh

- **POST /auth/credentials/refresh** (requires valid Bearer token): Generates a new `clientSecret`, hashes it, updates `api_keys`, and returns the new **clientId** and **clientSecret** in plaintext. Old secret is invalidated.

---

## API Reference

### System

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Returns `{"status": "ok"}`. |

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/token` | No | Exchange `clientId` + `clientSecret` for JWT. Body: `TokenRequest`. Response: `TokenResponse`. |
| GET | `/auth/credentials` | Bearer | Placeholder; returns 400 (secrets are hashed). |
| POST | `/auth/credentials/refresh` | Bearer | Issue new clientSecret; response: `ClientCredentialsResponse`. |

**TokenRequest**: `clientId: str`, `clientSecret: str`  
**TokenResponse**: `access_token: str`, `token_type: str = "bearer"`  
**ClientCredentialsResponse**: `clientId: str`, `clientSecret: str`

### Ingest (all require Bearer JWT)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/ingest/ml` | Batch ML events. Body: `MLEventBatch`. Response: `{"ingested": N}`. |
| POST | `/ingest/llm` | Batch LLM events. Body: `LLMEventBatch`. Response: `{"ingested": N}`. |

**MLEventBatch**: `events: List[MLEventIn]`  
**MLEventIn**: `model_name`, `prediction`, `input_data` (dict), `latency_ms`, `timestamp` (optional, default now)

**LLMEventBatch**: `events: List[LLMEventIn]`  
**LLMEventIn**: `model_name`, `prompt`, `response`, `latency_ms`, `timestamp` (optional)

### Dashboard (all require Bearer JWT)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard/health` | Current health score for org. Response: `HealthScoreOut`. |
| GET | `/dashboard/alerts` | Latest 100 alerts for org. Response: `List[AlertOut]`. |
| GET | `/dashboard/models` | ML model list with mean latency and latest drift. Response: `ModelsResponse`. |
| GET | `/dashboard/risk-distribution` | Counts of events by risk label (normal/suspicious/risky). Response: `RiskDistributionOut`. |

**HealthScoreOut**: `score`, `details`, `updated_at`  
**AlertOut**: `id`, `model_name`, `type`, `message`, `severity`, `created_at`, `resolved`  
**ModelsResponse**: `models: List[ModelSummary]`  
**ModelSummary**: `model_name`, `mean_latency_ms`, `drift_score`  
**RiskDistributionOut**: `normalCount`, `suspiciousCount`, `riskyCount`

---

## Ingestion Pipeline

### ML ingestion (`POST /ingest/ml`)

1. Request body is validated as `MLEventBatch`.
2. For each event, a document is built: `organization_id`, `model_name`, `prediction`, `input_data`, `latency_ms`, `timestamp`.
3. Documents are **inserted** into `ml_events` in one `insert_many`.
4. **Background tasks** are queued (response returns immediately with `{"ingested": N}`):
   - **Drift task**: For each distinct `model_name`, compute drift (see [Drift & Health](#drift--health)), insert into `drift_metrics`, and optionally create a **drift alert**.
   - **ML risk task**: For each inserted document, load latest drift and optional `feature_stats` from `model_profiles`, run **ML risk classifier**, then `update_one` to set `riskScore` and `riskLabel`. If label is **risky**, **create_risk_alert_if_needed** is called.

### LLM ingestion (`POST /ingest/llm`)

1. Request body is validated as `LLMEventBatch`.
2. For each event, `token_count` is approximated (e.g. `len(prompt+response)/4`), and a document is built with `organization_id`, `model_name`, `prompt`, `response`, `latency_ms`, `token_count`, `timestamp`.
3. Documents are **inserted** into `llm_events`.
4. **Background tasks** are queued:
   - **LLM risk task**: For each document, run **LLM risk classifier** on prompt+response, then `update_one` to set `riskScore`, `riskLabel`, and `flags`. If label is **risky**, **create_risk_alert_if_needed** is called.
   - **Health task**: Recompute org health score, upsert `health_scores`, and optionally create a **health alert**.

All heavy work (drift, health, risk classification, alerts) runs in **BackgroundTasks** so ingestion latency stays low.

---

## Risk Classification Layer

Every ML and LLM event is classified with:

- **riskScore**: float in `[0, 1]`
- **riskLabel**: `"normal"` \| `"suspicious"` \| `"risky"` from shared thresholds.

Thresholds (in `app/core/risk.py`):

- `score >= 0.75` → **risky**
- `score >= 0.4` → **suspicious**
- else → **normal**

### ML risk (`app/services/ml_risk_classifier.py`)

- **Inputs**: prediction, optional probabilities, drift_score, optional feature_stats, optional features.
- **Signals**:
  - **Confidence risk**: `1 - max(probabilities)` (0 if no probabilities).
  - **Drift risk**: `drift_score` normalized to 0–1 (assume 0–100).
  - **Outlier risk**: max z-score of features vs `feature_stats`, capped (e.g. 3σ → 1).
- **Formula**: `risk_score = 0.4 * confidence + 0.3 * drift + 0.3 * outlier`.
- **Return**: `riskScore`, `riskLabel`, `factors` (confidence_risk, drift_risk, outlier_risk). Only `riskScore` and `riskLabel` are stored on the document.

Probabilities and features can come from `input_data` (e.g. `input_data["probabilities"]`, `input_data["features"]` or full `input_data`). Drift is taken from the latest `drift_metrics` for the model; `feature_stats` from `model_profiles` if present.

### LLM risk (`app/services/llm_risk_classifier.py`)

- **Inputs**: prompt, response (combined for pattern matching).
- **Signals**:
  - **Sensitive**: regex patterns (e.g. password, api key, secret, database access, private data, credentials).
  - **Jailbreak**: regex patterns (e.g. ignore previous instructions, act as system, bypass safety, developer mode).
  - **Length**: `min(len(prompt)/2000, 1)`.
- **Formula**: `risk_score = 0.5 * sensitive + 0.3 * jailbreak + 0.2 * length_risk`.
- **Return**: `riskScore`, `riskLabel`, `flags` (e.g. `sensitive_content`, `jailbreak_pattern`, `long_prompt`). All three are stored on the document.

### Alert hook

- **Risky**: When `riskLabel == "risky"`, the ingest background task calls **create_risk_alert_if_needed** (type `risk`, severity `critical`).
- **Suspicious**: Stored only; no alert.

---

## Drift & Health

### Drift (`app/services/drift_detector.py`)

- **compute_mean_latency**: Aggregates mean `latency_ms` over recent ML events (e.g. 5-minute window) for an org and model.
- **compute_drift_score**: Loads baseline `baseline_latency_ms` from `model_profiles` for that org/model. If no baseline or no recent events, returns `None`. Otherwise: ratio = current_mean / baseline; drift_score = max(0, (ratio - 1) * 100), capped at 100.
- Drift is computed in the **ML ingest background task** after new events are written; results are stored in `drift_metrics` and may trigger a drift alert.

### Health (`app/services/health_service.py`)

- **compute_health_score**: Starts at `health_max_score` (100). Subtracts penalties:
  - Recent drift (average of latest drift metrics, capped penalty).
  - High LLM mean latency in last 15 minutes (penalty above 1000 ms, capped).
- Final score is clamped to `[health_min_score, health_max_score]`.
- Updated on every **LLM ingest** in the health background task; result is upserted into `health_scores` and may trigger a health alert.

---

## Alerts

Alerts are stored in the **alerts** collection. Types:

| Type | When | Severity |
|------|------|----------|
| **drift** | Drift score above threshold (from config mapping) | warning or critical by score |
| **health** | Health score below 60 | warning (≥40) or critical (&lt;40) |
| **risk** | Event classified as **risky** (ML or LLM) | critical |

- **create_drift_alert_if_needed**: Called from ML ingest background task when drift is high.
- **create_health_alert_if_needed**: Called from LLM health background task when health &lt; 60.
- **create_risk_alert_if_needed**: Called from ML/LLM risk background tasks when `riskLabel == "risky"`.

Dashboard **GET /dashboard/alerts** returns the latest 100 alerts for the org.

---

## Dashboard

- **GET /dashboard/health**: One health score document per org; default 100 if missing.
- **GET /dashboard/alerts**: Sorted by `created_at` descending, limit 100.
- **GET /dashboard/models**: Aggregates ML events for mean latency; joins with latest drift from `drift_metrics` per model.
- **GET /dashboard/risk-distribution**: Mongo aggregation on `ml_events` and `llm_events` (with `riskLabel` in `["normal","suspicious","risky"]`), sums counts per label and returns `normalCount`, `suspiciousCount`, `riskyCount`.

All dashboard routes use **get_current_org_id** and scope data by `organization_id`.

---

## Running the Application

From the project root with the virtual environment activated:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or:

```bash
python -m app.main
```

- **OpenAPI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **Health**: `GET http://localhost:8000/health`

**Note:** The repo does not include `app/workers/`; `main.py` imports `start_periodic_tasks` and `stop_periodic_tasks` from `app.workers.background`. Add that module with async no-op implementations (or remove the import and lifespan task) or the app will not start.

---

## Development Notes

- **Async**: Use async endpoints and Motor for MongoDB; avoid blocking calls in request path.
- **BackgroundTasks**: Use for post-insert work (drift, health, risk, alerts) to keep ingest response time low.
- **JWT**: Set a strong `JWT_SECRET_KEY` in production and use HTTPS.
- **API keys**: Store only bcrypt hashes; use `/auth/credentials/refresh` to rotate secrets.
- **Indexes**: Risk indexes are created in `connect_to_mongo()`; add further indexes if you add new query patterns.
- **Risk tuning**: Adjust thresholds in `app/core/risk.py` and weights in ML/LLM classifiers as needed for your use case.

---

This README reflects the full project as implemented: config, auth, ingest (ML/LLM), risk classification, drift, health, alerts, and dashboard APIs.
