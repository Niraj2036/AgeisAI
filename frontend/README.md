# Frontend - AI Observability Dashboard

A modern, real-time dashboard built with Next.js 14 and React for monitoring AI/ML systems in banking applications. Provides comprehensive visualization of ML model performance, LLM usage, risk analytics, and audit logs.

## 🎯 Overview

The frontend is a Next.js 14 application featuring:
- **Real-time Dashboards**: Live monitoring of ML and LLM systems
- **ML Model Monitoring**: Track model performance, predictions, and accuracy
- **LLM Monitoring**: Monitor token usage, costs, and response quality
- **Risk Engine**: Visualize risk analytics and fraud detection metrics
- **Audit Logs**: Comprehensive logging and compliance tracking
- **Alerts & Notifications**: Real-time alerts for anomalies
- **Settings**: Configuration and user management

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Next.js 14 App                 │
│  ┌───────────────────────────────────┐  │
│  │  App Router (app/)                │  │
│  │  • Server Components              │  │
│  │  • Route Handlers                 │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Components (components/)         │  │
│  │  • Reusable UI components        │  │
│  │  • Feature-specific components    │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  State Management                 │  │
│  │  • Zustand stores                 │  │
│  │  • React hooks                    │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Services (services/)             │  │
│  │  • API clients                    │  │
│  │  • Data fetching                  │  │
│  └───────────────────────────────────┘  │
└───────────────┬─────────────────────────┘
                │
                │ REST API / WebSocket
                │
                ▼
┌─────────────────────────────────────────┐
│      AegisAI Server (FastAPI)           │
│      • Dashboard Data API               │
│      • Real-time Events                 │
└─────────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- AegisAI Server running (for API data)

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (redirects to overview)
│   ├── globals.css              # Global styles
│   ├── overview/                # Overview dashboard
│   │   └── page.tsx
│   ├── ml-monitoring/           # ML model monitoring
│   │   └── page.tsx
│   ├── llm-monitoring/          # LLM usage monitoring
│   │   └── page.tsx
│   ├── risk-engine/             # Risk analytics
│   │   └── page.tsx
│   ├── audit-logs/              # Audit logs
│   │   └── page.tsx
│   ├── alerts/                  # Alerts & notifications
│   │   └── page.tsx
│   └── settings/                # Settings
│       └── page.tsx
├── components/                   # React components
│   ├── layout/                  # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── ...
│   ├── overview/                # Overview components
│   ├── ml/                      # ML monitoring components
│   ├── llm/                     # LLM monitoring components
│   ├── risk/                    # Risk engine components
│   ├── audit/                   # Audit log components
│   ├── alerts/                  # Alert components
│   └── settings/                # Settings components
├── ui/                          # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   └── ...
├── hooks/                       # Custom React hooks
│   ├── use-dashboard-store.ts   # Zustand store
│   └── use-alerts-panel-store.ts
├── services/                    # API services
│   └── mockApi.ts               # Mock API client
├── types/                       # TypeScript types
│   └── dashboard.ts
├── utils/                       # Utility functions
│   └── cn.ts                    # Class name utility
├── package.json
├── tsconfig.json
├── tailwind.config.cjs          # Tailwind CSS config
└── next.config.mjs              # Next.js config
```

## 🎨 Features

### 1. Overview Dashboard
- **Real-time Metrics**: Key performance indicators
- **Quick Stats**: ML predictions, LLM usage, risk alerts
- **Recent Activity**: Latest events and predictions
- **Charts**: Visual representation of system health

### 2. ML Monitoring
- **Model Performance**: Accuracy, precision, recall metrics
- **Prediction Trends**: Historical prediction data
- **Model Comparison**: Compare multiple models
- **Feature Importance**: Analyze model features
- **Drift Detection**: Monitor data/model drift

### 3. LLM Monitoring
- **Token Usage**: Track token consumption over time
- **Cost Analysis**: Monitor LLM API costs
- **Response Quality**: Analyze response metrics
- **Usage Patterns**: Identify usage trends
- **Model Performance**: Compare different LLM models

### 4. Risk Engine
- **Risk Scores**: Real-time risk assessment
- **Fraud Detection**: Fraud detection metrics
- **Anomaly Detection**: Identify unusual patterns
- **Risk Trends**: Historical risk analysis
- **Alert Management**: Risk-based alerts

### 5. Audit Logs
- **Event Logging**: Comprehensive event tracking
- **User Actions**: Track user activities
- **System Events**: Monitor system changes
- **Compliance**: Regulatory compliance tracking
- **Search & Filter**: Advanced log filtering

### 6. Alerts & Notifications
- **Real-time Alerts**: Instant notifications
- **Alert Rules**: Configurable alert thresholds
- **Alert History**: Historical alert data
- **Notification Channels**: Multiple notification methods

### 7. Settings
- **User Management**: User accounts and permissions
- **API Configuration**: Server and API settings
- **Notification Settings**: Alert preferences
- **Theme**: Light/dark mode (if implemented)

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Type Safety**: TypeScript
- **Build Tool**: Next.js (Turbopack)

## 📡 API Integration

The frontend communicates with the AegisAI Server API:

### API Endpoints Used

```typescript
// Dashboard data
GET /dashboard/overview
GET /dashboard/ml-metrics
GET /dashboard/llm-metrics
GET /dashboard/risk-metrics

// Audit logs
GET /dashboard/audit-logs
GET /dashboard/audit-logs/search

// Alerts
GET /dashboard/alerts
POST /dashboard/alerts/acknowledge
```

### API Service

The frontend uses a service layer for API calls:

```typescript
// services/mockApi.ts
export const fetchOverview = async () => {
  const response = await fetch(`${API_URL}/dashboard/overview`);
  return response.json();
};
```

## 🎨 Styling

The project uses **Tailwind CSS** for styling:

- **Utility-first**: Rapid UI development
- **Responsive**: Mobile-first design
- **Custom Theme**: Configured in `tailwind.config.cjs`
- **Dark Mode**: Support for dark theme (if implemented)

### Custom Components

Reusable UI components in `ui/` directory:
- Button
- Card
- Input
- Select
- Modal
- Table
- etc.

## 🔄 State Management

### Zustand Stores

```typescript
// hooks/use-dashboard-store.ts
import { create } from 'zustand';

interface DashboardStore {
  data: DashboardData;
  loading: boolean;
  fetchData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  data: null,
  loading: false,
  fetchData: async () => {
    set({ loading: true });
    const data = await fetchOverview();
    set({ data, loading: false });
  },
}));
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Environment Variables

Set these in your deployment environment:

```env
NEXT_PUBLIC_API_URL=https://your-api-server.com
```

## 🧪 Development

### Development Server

```bash
npm run dev
```

### Linting

```bash
npm run lint
```

### Type Checking

TypeScript is configured for strict type checking. Run:

```bash
npx tsc --noEmit
```

## 📱 Responsive Design

The dashboard is fully responsive:
- **Mobile**: Optimized for mobile devices
- **Tablet**: Tablet-friendly layouts
- **Desktop**: Full-featured desktop experience

## 🔒 Security

- **API Authentication**: JWT tokens for API calls
- **CORS**: Configured CORS settings
- **Environment Variables**: Sensitive data in env vars
- **XSS Protection**: React's built-in XSS protection

## 🐛 Troubleshooting

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check AegisAI Server is running
- Verify CORS settings on server

### Build Errors
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`

### Styling Issues
- Verify Tailwind config is correct
- Check PostCSS configuration
- Ensure CSS imports are correct

## 📝 Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Next.js ESLint configuration
- **Prettier**: Code formatting (if configured)
- **Components**: Functional components with hooks

## 🔄 Future Enhancements

- [ ] Real-time WebSocket connections
- [ ] Advanced filtering and search
- [ ] Export functionality (CSV, PDF)
- [ ] Custom dashboard widgets
- [ ] User preferences and saved views
- [ ] Dark mode support
- [ ] Internationalization (i18n)
- [ ] Performance optimizations
- [ ] Unit and integration tests

## 📄 License

[Add your license here]

## 🤝 Contributing

[Add contribution guidelines here]

## 📧 Support

[Add support contact information]
