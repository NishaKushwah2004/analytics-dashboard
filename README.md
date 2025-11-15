# 🚀 Analytics Dashboard with AI-Powered Chat

A production-grade full-stack analytics dashboard featuring AI-powered natural language queries, built with Next.js, PostgreSQL, Prisma, and Groq LLM.

## 🏗️ Architecture

<div align="center">

**[📊 View Interactive Architecture Diagram](./architecture.html)**

*Click to see the live, interactive system architecture*

</div>

## 📊 Platform Comparison

<div align="center">

**[📊 View Platform Comparision ->](./comparision.html)**

*Click to see the live, interactive system architecture*

</div>

### System Overview

Our platform uses a modern microservices architecture:

- **Frontend (Vercel)**: Next.js 14 + React 18 with TypeScript
- **AI Layer (Render)**: Vanna AI for Text-to-SQL conversion
- **Database (Neon)**: Serverless PostgreSQL with Prisma ORM
- **Development**: Docker Compose for local environment

[Learn more about the architecture →](./docs/architecture.html)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Setup Guide](#setup-guide)
- [Chat with Data Workflow](#chat-with-data-workflow)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### 📊 Analytics Dashboard
- **Overview Cards**: Total Spend (YTD), Total Invoices, Documents Uploaded, Average Invoice Value
- **Interactive Charts**:
  - Invoice Volume + Value Trend (Line Chart)
  - Spend by Vendor (Top 10 Horizontal Bar Chart)
  - Spend by Category (Pie Chart)
  - Cash Outflow Forecast (Bar Chart)
- **Invoice Table**: Searchable, sortable, paginated with real-time data

### 💬 AI-Powered Chat Interface
- Natural language queries to SQL conversion
- Real-time SQL generation using Groq LLM
- Instant results display with tables and charts
- Example queries:
  - "What's the total spend in the last 90 days?"
  - "List top 5 vendors by spend"
  - "Show overdue invoices"

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **State Management**: React Hooks

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Validation**: Zod

### AI Layer
- **Framework**: FastAPI (Python)
- **LLM Provider**: Groq (llama-3.3-70b-versatile)
- **SQL Generation**: Custom prompt engineering
- **Database Connection**: psycopg2

### DevOps
- **Containerization**: Docker & Docker Compose
- **Package Management**: npm
- **Monorepo**: Turborepo
- **Version Control**: Git

---

## 🏗 Architecture
```
┌─────────────┐
│   Browser   │
└──────┬──────┘
│ HTTP/HTTPS
▼
┌─────────────────────────────┐
│     Next.js Frontend        │
│  - Dashboard UI             │
│  - Chat Interface           │
│  - API Client               │
└──────┬──────────────────────┘
│
▼
┌─────────────────────────────┐
│   Next.js API Routes        │
│  - /api/stats               │
│  - /api/invoices            │
│  - /api/chat-with-data      │
└──────┬───────┬──────────────┘
│       │
│       └────────────────┐
│                        │
▼                        ▼
┌──────────────┐      ┌────────────────┐
│  PostgreSQL  │      │  Vanna AI      │
│   Database   │◄─────│  (FastAPI)     │
│              │      │  + Groq LLM    │
└──────────────┘      └────────────────┘
```

---

## 📊 Database Schema

### Entity Relationship Diagram
```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Document   │       │   Invoice    │       │    Vendor    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │───1:1─│ documentId   │───M:1─│ id (PK)      │
│ name         │       │ id (PK)      │       │ name         │
│ filePath     │       │ invoiceNum   │       │ address      │
│ fileSize     │       │ invoiceDate  │       │ taxId        │
│ status       │       │ status       │       └──────────────┘
│ ...          │       │ vendorId (FK)│
└──────────────┘       │ customerId   │       ┌──────────────┐
└──────┬───────┘       │   Customer   │
│               ├──────────────┤
│           ┌───│ id (PK)      │
│           │   │ name         │
│           │   │ address      │
│           │   └──────────────┘
│           │
│           └─M:1
│
┌─────────────────┼─────────────────┐
│                 │                 │
│ 1:M             │ 1:1             │ 1:1
▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   LineItem   │  │   Payment    │  │   Summary    │
├──────────────┤  ├──────────────┤  ├──────────────┤
│ id (PK)      │  │ id (PK)      │  │ id (PK)      │
│ invoiceId    │  │ invoiceId    │  │ invoiceId    │
│ description  │  │ dueDate      │  │ subTotal     │
│ quantity     │  │ bankAccount  │  │ totalTax     │
│ totalPrice   │  │ netDays      │  │ invoiceTotal │
│ category     │  └──────────────┘  └──────────────┘
└──────────────┘
```

### Table Descriptions

#### Document
Stores uploaded invoice document metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | String | Original filename |
| filePath | String | Storage path/URL |
| fileSize | BigInt | File size in bytes |
| fileType | String | MIME type |
| status | String | Processing status |
| organizationId | String | Organization reference |
| departmentId | String | Department reference |
| metadata | JSON | Additional metadata |

#### Invoice
Main invoice records with relationships.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| documentId | UUID | Foreign key to Document |
| invoiceNumber | String | Invoice identifier |
| invoiceDate | DateTime | Invoice date |
| status | String | Invoice status |
| vendorId | UUID | Foreign key to Vendor |
| customerId | UUID | Foreign key to Customer |

#### Vendor
Vendor/supplier information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | String | Vendor name |
| address | String | Vendor address |
| taxId | String | Tax identification |

#### Summary
Invoice financial summary.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| invoiceId | UUID | Foreign key to Invoice |
| subTotal | Float | Subtotal amount |
| totalTax | Float | Tax amount |
| invoiceTotal | Float | Total amount |

---

## 🔌 API Documentation

### Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-app.vercel.app/api`

### Endpoints

#### 1. Get Overview Statistics
```http
GET /api/stats
```

**Response:**
```json
{
  "totalSpend": 12679.25,
  "totalInvoices": 64,
  "documentsUploaded": 17,
  "avgInvoiceValue": 198.11
}
```

#### 2. Get Invoice Trends
```http
GET /api/invoice-trends
```

**Response:**
```json
[
  {
    "month": "Jan 2025",
    "count": 15,
    "value": 3250.50
  },
  {
    "month": "Feb 2025",
    "count": 18,
    "value": 4100.75
  }
]
```

#### 3. Get Top 10 Vendors
```http
GET /api/vendors/top10
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Musterfirma Müller",
    "totalSpend": 8879.25,
    "invoiceCount": 25
  }
]
```

#### 4. Get Category Spend
```http
GET /api/category-spend
```

**Response:**
```json
[
  {
    "category": "Services",
    "spend": 5000.00
  },
  {
    "category": "Products",
    "spend": 3500.00
  }
]
```

#### 5. Get Cash Outflow Forecast
```http
GET /api/cash-outflow
```

**Response:**
```json
[
  {
    "month": "Dec 2025",
    "outflow": 2500.00
  }
]
```

#### 6. Get Invoices (Paginated)
```http
GET /api/invoices?page=1&limit=10&search=vendor
```

**Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term

**Response:**
```json
{
  "invoices": [
    {
      "id": "uuid",
      "vendor": "Vendor Name",
      "date": "2025-01-15T00:00:00.000Z",
      "invoiceNumber": "INV-001",
      "amount": 1500.00,
      "status": "processed"
    }
  ],
  "total": 64,
  "page": 1,
  "totalPages": 7
}
```

#### 7. Chat with Data (AI Query)
```http
POST /api/chat-with-data
Content-Type: application/json

{
  "query": "What is the total spend?"
}
```

**Response:**
```json
{
  "question": "What is the total spend?",
  "sql": "SELECT SUM(ABS(\"invoiceTotal\")) as total_spend FROM \"Summary\"",
  "results": [
    {
      "total_spend": 12679.25
    }
  ],
  "text": "Found 1 result"
}
```

---

## 🚀 Setup Guide

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- Python 3.11+ ([Download](https://www.python.org/))
- Docker Desktop ([Download](https://www.docker.com/))
- Git ([Download](https://git-scm.com/))
- Groq API Key ([Get Free Key](https://console.groq.com/keys))

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/analytics-dashboard.git
cd analytics-dashboard
```

### Step 2: Install Dependencies
```bash
# Install root dependencies
npm install

# Install Next.js dependencies
cd apps/web
npm install
cd ../..
```

### Step 3: Setup PostgreSQL Database
```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d

# Wait for database to be ready (10 seconds)
timeout /t 10  # Windows
# sleep 10     # Mac/Linux

# Verify it's running
docker ps
```

### Step 4: Configure Environment Variables

**File: `apps/web/.env.local`**
```bash
DATABASE_URL="postgresql://analytics_user:analytics_pass@localhost:5432/analytics_db"
VANNA_API_BASE_URL="http://localhost:8000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**File: `services/vanna/.env`**
```bash
DATABASE_URL=postgresql://analytics_user:analytics_pass@localhost:5432/analytics_db
GROQ_API_KEY=gsk_your_actual_groq_key_here
PORT=8000
```

### Step 5: Setup Database Schema
```bash
cd apps/web

# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database with data
npx prisma db seed

# (Optional) View data in Prisma Studio
npx prisma studio
```

### Step 6: Setup Vanna AI Service
```bash
cd ../../services/vanna

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate  # Windows
# source venn/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

### Step 7: Start All Services

**Terminal 1 - Vanna AI:**
```bash
cd services/vanna
.\venn\Scripts\activate  # Windows
python main.py
```

**Terminal 2 - Next.js:**
```bash
cd apps/web
npm run dev
```

### Step 8: Access Application

- **Dashboard**: http://localhost:3000/dashboard
- **Chat Interface**: http://localhost:3000/chat
- **Vanna AI API**: http://localhost:8000/docs
- **Prisma Studio**: http://localhost:5555 (run `npx prisma studio`)

---

## 💬 Chat with Data Workflow

### Complete Flow Diagram
```
┌──────────────┐
│  User Types  │
│   Question   │
└───────┬──────┘
│
▼
┌─────────────────────────┐
│  Frontend (React)       │
│  - Captures input       │
│  - Displays loading     │
└───────┬─────────────────┘
│ POST /api/chat-with-data
│ { query: "What is total spend?" }
▼
┌─────────────────────────┐
│  Next.js API Route      │
│  - Validates request    │
│  - Forwards to Vanna    │
└───────┬─────────────────┘
│ POST /query
│ { question: "What is total spend?" }
▼
┌─────────────────────────┐
│  Vanna AI (FastAPI)     │
│  1. Receives question   │
│  2. Loads DB schema     │
│  3. Creates prompt      │
└───────┬─────────────────┘
│
▼
┌─────────────────────────┐
│  Groq LLM API           │
│  - Model: llama-3.3-70b │
│  - Generates SQL        │
└───────┬─────────────────┘
│ Returns SQL
│ "SELECT SUM(ABS("invoiceTotal")) FROM "Summary""
▼
┌─────────────────────────┐
│  Vanna AI               │
│  - Executes SQL         │
│  - on PostgreSQL        │
└───────┬─────────────────┘
│
▼
┌─────────────────────────┐
│  PostgreSQL Database    │
│  - Runs query           │
│  - Returns results      │
└───────┬─────────────────┘
│ [{ "total": 12679.25 }]
▼
┌─────────────────────────┐
│  Vanna AI               │
│  - Formats response     │
│  - Returns JSON         │
└───────┬─────────────────┘
│ { sql, results, text }
▼
┌─────────────────────────┐
│  Next.js API Route      │
│  - Validates response   │
│  - Returns to frontend  │
└───────┬─────────────────┘
│
▼
┌─────────────────────────┐
│  Frontend (React)       │
│  1. Displays SQL        │
│  2. Shows results table │
│  3. Renders chart       │
└─────────────────────────┘
```
### Example Session

**User Input:**
**Generated SQL:**
```sql
SELECT v.name, SUM(ABS(s."invoiceTotal")) as total
FROM "Vendor" v
JOIN "Invoice" i ON v.id = i."vendorId"
JOIN "Summary" s ON i.id = s."invoiceId"
GROUP BY v.name
ORDER BY total DESC
LIMIT 5
```

**Results:**
```json
[
  { "name": "Musterfirma Müller", "total": 8879.25 },
  { "name": "Global Supply", "total": 3800.00 },
  { "name": "Tech Solutions", "total": 2500.50 }
]
```

**Frontend Display:**
- ✅ SQL code block (syntax highlighted)
- ✅ Results table (formatted)
- ✅ Optional bar chart visualization

---

## 🚢 Deployment

### Deploy to Vercel (Frontend + API)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from web app directory
cd apps/web
vercel --prod
```

**Environment Variables in Vercel:**
DATABASE_URL=postgresql://user:pass@your-db-host/dbname
VANNA_API_BASE_URL=https://your-vanna.onrender.com
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

### Deploy Vanna AI to Render

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - **Root Directory**: `services/vanna`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python main.py`
   - **Environment Variables**:
     - `DATABASE_URL`
     - `GROQ_API_KEY`
     - `PORT=8000`

### Deploy PostgreSQL

**Option 1: Neon (Recommended)**
- https://neon.tech
- Free tier available
- Serverless PostgreSQL

**Option 2: Railway**
- https://railway.app
- Easy PostgreSQL deployment
- Free tier available

---

## 🐛 Troubleshooting

### Issue: Dashboard shows no data

**Solution:**
```bash
cd apps/web
npx prisma db seed
```

### Issue: Chat returns 500 error

**Check:**
1. Is Vanna AI running? `curl http://localhost:8000/health`
2. Is Groq API key valid in `services/vanna/.env`?
3. Check Vanna terminal for error messages

**Solution:**
```bash
cd services/vanna
.\venv\Scripts\activate
python main.py
```

### Issue: SQL not displaying in chat

**Solution:** Update `apps/web/components/chat/chat-interface.tsx` with the code provided in Part 1

### Issue: Charts not updating

**Solution:** Clear Next.js cache and rebuild
```bash
cd apps/web
rm -rf .next
npm run dev
```

### Issue: Database connection refused

**Solution:**
```bash
# Restart PostgreSQL
docker-compose restart postgres

# Check it's running
docker ps
```

---

## 📁 Project Structure
```
analytics-dashboard/
├── apps/
│   └── web/                      # Next.js Application
│       ├── app/
│       │   ├── api/             # API Routes
│       │   │   ├── stats/
│       │   │   ├── invoices/
│       │   │   └── chat-with-data/
│       │   ├── dashboard/       # Dashboard Page
│       │   └── chat/            # Chat Page
│       ├── components/
│       │   ├── ui/              # shadcn/ui Components
│       │   ├── dashboard/       # Dashboard Components
│       │   └── chat/            # Chat Components
│       ├── lib/                 # Utilities
│       ├── prisma/              # Database Schema
│       └── .env.local           # Environment Variables
│
├── services/
│   └── vanna/                   # Vanna AI Service
│       ├── main.py              # FastAPI Application
│       ├── config.py            # Configuration
│       ├── requirements.txt     # Python Dependencies
│       └── .env                 # Environment Variables
│
├── data/
│   └── Analytics_Test_Data.json # Invoice Data
│
├── docker-compose.yml           # PostgreSQL Setup
└── README.md                    # This File

```
---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Next.js** - React Framework
- **Prisma** - Database ORM
- **Groq** - LLM Provider
- **shadcn/ui** - UI Components
- **Recharts** - Chart Library


**Built with ❤️ using Next.js, PostgreSQL, and AI**