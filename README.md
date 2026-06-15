🏦 Distributed Banking Platform

A full-stack, cloud-deployable banking system that enables users to securely manage accounts, perform peer-to-peer money transfers, and analyze transaction activity. The system integrates an AI-powered financial assistant using Groq LLMs to provide natural language insights over transactional data.

This project demonstrates full-stack system design, secure backend architecture, and AI-enhanced product thinking.

🚀 Key Features
👤 Identity & Authentication
Secure user registration and authentication
JWT-based session management
Protected API routes with role-based access control (RBAC-ready design)
💰 Core Banking Operations
Account creation and balance management
Atomic peer-to-peer money transfers
Transaction consistency with database-level integrity constraints
📊 Transaction System
Immutable transaction ledger
Historical transaction querying
Structured audit-friendly data model
🤖 AI Financial Assistant (Groq Integration)
Natural language interface over user transactions
Query examples:
“Summarize my spending last month”
“How much did I send to John?”
“Show my largest transactions”
Context-aware responses powered by Groq LLM API
🧠 System Architecture
Client (React + TypeScript)
        ↓
REST API Layer (Node.js + Express)
        ↓
Business Logic Layer (Services)
        ↓
PostgreSQL Database (Prisma ORM)
        ↓
External AI Service (Groq API)
Design Principles
Separation of concerns (controllers / services / data access layers)
Stateless backend architecture
Scalable API-first design
Database-driven source of truth
🛠️ Tech Stack
Frontend
React
TypeScript
Axios
React Router
Backend
Node.js
Express.js
TypeScript
JWT Authentication
Database
PostgreSQL
Prisma ORM (type-safe database access layer)
AI Layer
Groq API (LLM-based natural language querying)
🧾 Data Model Overview
User
Authentication credentials
Account metadata
Account
Balance tracking
Ownership mapping
Transaction
Sender / receiver relations
Amount
Timestamped immutable records
🔐 Security Considerations
Password hashing using secure cryptographic hashing
JWT-based authentication with signed tokens
Input validation and request sanitization
Transaction integrity enforced at database level
Separation of sensitive environment configuration via .env
⚙️ Local Development Setup
1. Clone Repository
git clone https://github.com/your-username/bank-project.git
cd bank-project
2. Install Dependencies
pnpm install
3. Configure Environment Variables

Backend .env:

DATABASE_URL=your_postgres_url
DIRECT_URL=your_direct_db_url
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
4. Run Database Migrations
npx prisma migrate dev

or production-safe:

npx prisma migrate deploy
5. Start Development Servers

Backend:

pnpm --filter cashio-backend dev

Frontend:

pnpm --filter frontend dev
🧩 Architectural Highlights
Designed as a modular full-stack system
Backend structured using layered architecture (controller → service → repository pattern)
Prisma used as a type-safe abstraction over relational data
AI integration decoupled from core banking logic for maintainability
Ready for horizontal scaling via stateless API design
🤖 AI Capability Layer (Groq)

The system includes an AI abstraction layer that translates natural language queries into structured financial insights.

This enables:

Contextual transaction summarization
Spending analysis
User-specific financial queries

This layer is designed to be pluggable, allowing future replacement or extension of the LLM provider.

📈 Future Improvements
Event-driven architecture using message queues (Kafka / RabbitMQ)
Real-time transaction updates via WebSockets
Fraud detection heuristics layer
Multi-currency and FX conversion support
Microservices decomposition (Auth / Payments / AI layer separation)
Observability stack (logging, tracing, metrics)
👩‍💻 Author

Built by Bella V
