<div align="center">

<img src="https://img.shields.io/badge/version-2.0.0-00e5ff?style=for-the-badge&labelColor=080b10" />
<img src="https://img.shields.io/badge/license-MIT-7c3aed?style=for-the-badge&labelColor=080b10" />
<img src="https://img.shields.io/badge/python-3.10+-00ffa3?style=for-the-badge&labelColor=080b10" />
<img src="https://img.shields.io/badge/react-18-00e5ff?style=for-the-badge&labelColor=080b10" />
<img src="https://img.shields.io/badge/AI-Claude%20Sonnet-7c3aed?style=for-the-badge&labelColor=080b10" />
<img src="https://img.shields.io/badge/deployed-live-00ffa3?style=for-the-badge&labelColor=080b10" />

<br /><br />

```
  ██╗  ██╗██╗██████╗ ███████╗██████╗ ██╗ ██████╗ ██╗  ██╗████████╗
  ██║  ██║██║██╔══██╗██╔════╝██╔══██╗██║██╔════╝ ██║  ██║╚══██╔══╝
  ███████║██║██████╔╝█████╗  ██████╔╝██║██║  ███╗███████║   ██║   
  ██╔══██║██║██╔══██╗██╔══╝  ██╔══██╗██║██║   ██║██╔══██║   ██║   
  ██║  ██║██║██║  ██║███████╗██║  ██║██║╚██████╔╝██║  ██║   ██║   
  ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   
```

### ⚡ AI-Powered Task Allocation Engine for Startups & Teams

*Stop guessing who should do what. Let AI decide — with TF-IDF intelligence, confidence scoring, and plain-English reasoning.*

<br />

[🚀 Live Demo](https://hirerightfronntend.netlify.app) · [📖 API Docs](https://hireright-backend.onrender.com/docs) · [🐛 Report Bug](https://github.com/RudraPyt/HireRight/issues) · [💡 Request Feature](https://github.com/RudraPyt/HireRight/issues)

</div>

---

## 📌 Table of Contents

- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [How It Works](#-how-it-works)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔥 The Problem

Startups fail not from bad ideas — they fail from **bad resource allocation**.

Every week, managers across thousands of small teams face the same problem:

> *"Who should build this feature? Who has time? Who actually has the right skills?"*

They guess. They overload their best performers. They underutilize people with niche skills. Tasks fail — not because the team was incapable, but because the **wrong person was assigned**.

No existing tool solves this for small teams:

| Tool | What it does | What it misses |
|---|---|---|
| Jira | Tracks tasks | Can't match tasks to skills |
| Notion | Documents everything | No allocation intelligence |
| Asana | Manages projects | Rule-based, not semantic |
| Monday.com | Visualizes work | Designed for enterprise, not startups |

**HireRight fills this gap** — a lightweight, AI-native task allocation engine built specifically for 2–50 person teams.

---

## 💡 The Solution

HireRight takes your **team's skills** and your **task list**, and uses AI to match them — automatically, intelligently, and with full explainability.

```
You provide:                    HireRight delivers:
─────────────                   ──────────────────
Team members + skills     →     Smart assignments
Tasks + requirements      →     Confidence scores  
Project deadlines         →     AI reasoning
Budget/hour estimates     →     Workload balance
                          →     Risk warnings
```

Every assignment comes with a **confidence score** and a **plain-English explanation** of why that person was chosen — so managers can trust, verify, or override the AI's decision.

---

## ⚙️ How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                        HIRERIGHT ENGINE                             │
│                                                                     │
│  INPUT                                                              │
│  ┌──────────────┐    ┌──────────────────────────────────────────┐  │
│  │  Task List   │    │           Team Profiles                  │  │
│  │              │    │                                          │  │
│  │ • Title      │    │  Name: Priya Sharma                      │  │
│  │ • Description│    │  Skills: Python, ML, FastAPI             │  │
│  │ • Req Skills │    │  Hours: 40/week                          │  │
│  │ • Est. Hours │    │  Load: 12h allocated                     │  │
│  │ • Priority   │    │                                          │  │
│  └──────┬───────┘    └───────────────────┬──────────────────────┘  │
│         │                                │                          │
│         └──────────────┬─────────────────┘                         │
│                        ▼                                            │
│         ┌──────────────────────────────┐                           │
│         │   TF-IDF Vectorization       │                           │
│         │   scikit-learn               │                           │
│         │                              │                           │
│         │  Convert text → TF-IDF       │                           │
│         │  weighted term vectors       │                           │
│         └──────────────┬───────────────┘                           │
│                        ▼                                            │
│         ┌──────────────────────────────┐                           │
│         │   Cosine Similarity Matrix   │                           │
│         │                              │                           │
│         │  task_vec · member_vec       │                           │
│         │  ─────────────────────────   │                           │
│         │  |task_vec| × |member_vec|   │                           │
│         └──────────────┬───────────────┘                           │
│                        ▼                                            │
│         ┌──────────────────────────────┐                           │
│         │   Availability Filter        │                           │
│         │                              │                           │
│         │  Skip if:                    │                           │
│         │  workload + task_hrs         │                           │
│         │  > weekly_hours_available    │                           │
│         └──────────────┬───────────────┘                           │
│                        ▼                                            │
│         ┌──────────────────────────────┐                           │
│         │   Claude Sonnet API          │                           │
│         │                              │                           │
│         │  Generates plain-English     │                           │
│         │  reasoning for each match    │                           │
│         │  + team health summary       │                           │
│         └──────────────┬───────────────┘                           │
│                        ▼                                            │
│  OUTPUT                                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Task              │ Assigned To   │ Score │ AI Reasoning   │   │
│  │  ────────────────  │ ───────────── │ ───── │ ─────────────  │   │
│  │  Build ML Model    │ Priya Sharma  │ 94.2% │ Priya's Python │   │
│  │  Design UI         │ Arjun Mehta   │ 91.7% │ Arjun leads... │   │
│  │  Setup CI/CD       │ Rahul Verma   │ 88.4% │ Rahul's DevOps │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Why TF-IDF + Cosine Similarity

```
Task requires:  "build REST API backend"
Member skills:  "FastAPI, Python, REST APIs, server-side"

Keyword match (naive):  partial
TF-IDF + Cosine:   ✅  High similarity score → CORRECTLY MATCHED

Task requires:  "data visualization dashboard"
Member skills:  "Tableau, SQL, analytics, charts"

Keyword match (naive):  partial  
TF-IDF + Cosine:   ✅  High similarity score → CORRECTLY MATCHED
```

---

## ✨ Key Features

### 🔐 Authentication System
- Secure user registration and login
- JWT-based session management (7-day tokens)
- bcrypt password hashing
- Protected routes — your data is only yours

### 📁 Multi-Project Workspace
- Create unlimited projects per account
- Each project has isolated team, tasks, and assignments
- Project-level demo data seeding
- One-click project reset for clean re-runs

### 🧠 AI-Powered Matching
- **TF-IDF vectorization** via scikit-learn — lightweight and fast
- **Availability-aware** — never overloads a team member
- **Confidence scoring** — 0–100% match quality
- **Greedy optimization** — tasks assigned in priority order

### 📊 Assignment Dashboard
- Real-time workload distribution chart
- Color-coded confidence levels (green/yellow/red)
- Claude-generated team health summary
- Per-assignment AI reasoning

### ⚡ One-Click Auto-Assign
- Runs full allocation in 5–15 seconds
- Handles unassigned tasks gracefully
- Fully resetable and re-runnable

---

## 🛠 Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│                                                         │
│  React 18        Vite 5         Recharts               │
│  Lucide Icons    Google Fonts   CSS Variables           │
│  Syne Font       JetBrains Mono                         │
│                                                         │
│  Deployed on: Netlify                                   │
│  https://hirerightfronntend.netlify.app                 │
└─────────────────────────────────────────────────────────┘
                          │
                    REST API (JSON)
                    JWT Auth Headers
                          │
┌─────────────────────────────────────────────────────────┐
│                      BACKEND                            │
│                                                         │
│  FastAPI         SQLAlchemy     SQLite                  │
│  Uvicorn         Pydantic       python-jose (JWT)       │
│  passlib         bcrypt         python-multipart        │
│                                                         │
│  Deployed on: Render                                    │
│  https://hireright-backend.onrender.com                 │
└─────────────────────────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
┌─────────────────────┐  ┌────────────────────────┐
│     ML LAYER        │  │      AI LAYER          │
│                     │  │                        │
│  scikit-learn       │  │  Anthropic Claude      │
│  TF-IDF Vectorizer  │  │  claude-sonnet-4       │
│  cosine_similarity  │  │                        │
│                     │  │  • Assignment reasoning│
│  Lightweight —      │  │  • Team health summary │
│  no model download  │  │                        │
└─────────────────────┘  └────────────────────────┘
```

---

## 🏗 Architecture

### System Flow

```
Browser (React)
     │
     │  HTTP Requests + JWT Token
     │  Base URL: https://hireright-backend.onrender.com
     ▼
FastAPI Backend
     │
     ├──► SQLite DB (Users, Projects, Members, Tasks, Assignments)
     │
     ├──► matcher.py
     │         │
     │         ├──► TF-IDF Vectorizer → term frequency vectors
     │         └──► cosine_similarity → match scores
     │
     └──► claude_service.py
               │
               └──► Anthropic API → reasoning text
```

### Database Schema

```
users
├── id (PK)
├── username (unique)
├── email (unique)
├── hashed_password
└── created_at
      │
      │ 1:many
      ▼
projects
├── id (PK)
├── name
├── description
├── owner_id (FK → users.id)
└── created_at
      │
      ├──────────────────────┬─────────────────────────┐
      │ 1:many               │ 1:many                  │ 1:many
      ▼                      ▼                         ▼
team_members              tasks                   assignments
├── id (PK)               ├── id (PK)              ├── id (PK)
├── project_id (FK)       ├── project_id (FK)      ├── project_id (FK)
├── name                  ├── title                ├── task_id
├── skills                ├── description          ├── member_id
├── weekly_hours_         ├── required_skills      ├── task_title
│   available             ├── estimated_hours      ├── member_name
├── current_workload_     ├── deadline             ├── confidence_score
│   hours                 ├── priority             ├── ai_reasoning
└── created_at            ├── status               └── assigned_at
                          └── created_at
```

---

## 📁 Project Structure

```
HireRight/
│
├── 📄 .gitignore
├── 📄 README.md
│
├── 🐍 backend/
│   │
│   ├── 📄 main.py              ← FastAPI app, all API endpoints
│   ├── 📄 database.py          ← SQLAlchemy models & DB connection
│   ├── 📄 auth.py              ← JWT auth, password hashing
│   ├── 📄 matcher.py           ← TF-IDF vectorization + matching
│   ├── 📄 claude_service.py    ← Anthropic Claude API integration
│   ├── 📄 requirements.txt     ← Python dependencies
│   └── 📄 .env                 ← Secret keys (never commit this!)
│
└── ⚛️  frontend/
    │
    ├── 📄 index.html
    ├── 📄 package.json
    ├── 📄 vite.config.js
    │
    └── src/
        │
        ├── 📄 main.jsx          ← React entry point
        ├── 📄 App.jsx           ← Root component + routing logic
        ├── 📄 api.js            ← API service layer (all fetch calls)
        ├── 📄 index.css         ← Global styles + design tokens
        │
        ├── pages/
        │   ├── 📄 AuthPage.jsx       ← Login + Register screen
        │   └── 📄 ProjectsPage.jsx   ← Projects dashboard
        │
        └── components/
            ├── 📄 TeamPanel.jsx           ← Add/view team members
            ├── 📄 TaskPanel.jsx           ← Add/view tasks
            └── 📄 AssignmentDashboard.jsx ← Results + charts
```

---

## 🚀 Getting Started

### Prerequisites

```
✅ Python 3.10 or higher
✅ Node.js 18 or higher
✅ An Anthropic API key → console.anthropic.com
```

### 1. Clone the Repository

```bash
git clone https://github.com/RudraPyt/HireRight.git
cd HireRight
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create environment file (Windows)
echo ANTHROPIC_API_KEY=your_key_here > .env
echo SECRET_KEY=your_random_secret_here >> .env

# Start the server
uvicorn main:app --reload --port 8000
```

✅ Backend running at: `http://localhost:8000`  
✅ API docs at: `http://localhost:8000/docs`

### 3. Frontend Setup

Open a second terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

✅ Frontend running at: `http://localhost:5173`

### 4. First Run

```
1. Open http://localhost:5173
2. Click "Create Account" → register
3. Click "New Project" → create your first project
4. Go to Team tab → add members with skills
5. Go to Tasks tab → add tasks with requirements
6. Click "Auto-Assign" → watch the AI work
```

> 💡 **Quick Demo:** Click "Load Demo Data" to instantly populate 5 team members and 6 realistic tasks, then hit Auto-Assign.

---

## 📡 API Reference

Base URL (Production): `https://hireright-backend.onrender.com`  
Base URL (Local): `http://localhost:8000`  
Interactive Docs: `https://hireright-backend.onrender.com/docs`

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login, receive JWT token |
| `GET` | `/auth/me` | Get current user info |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/projects` | List all user's projects |
| `POST` | `/projects` | Create new project |
| `GET` | `/projects/{id}` | Get project details |
| `DELETE` | `/projects/{id}` | Delete project + all data |

### Team Members

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/projects/{id}/members` | List project members |
| `POST` | `/projects/{id}/members` | Add team member |
| `DELETE` | `/projects/{id}/members/{mid}` | Remove member |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/projects/{id}/tasks` | List project tasks |
| `POST` | `/projects/{id}/tasks` | Add task |
| `DELETE` | `/projects/{id}/tasks/{tid}` | Remove task |

### AI Allocation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/projects/{id}/assign` | Run AI matching |
| `GET` | `/projects/{id}/assignments` | View assignments |
| `GET` | `/projects/{id}/workload` | Workload per member |
| `POST` | `/projects/{id}/reset` | Clear all assignments |
| `GET` | `/projects/{id}/seed-demo` | Load demo data |

### Example Request

```bash
# Login
curl -X POST https://hireright-backend.onrender.com/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=rudra&password=mypassword"

# Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "username": "rudra"
}

# Run Auto-Assign (with token)
curl -X POST https://hireright-backend.onrender.com/projects/1/assign \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🌐 Deployment

### Live URLs

| Service | URL |
|---|---|
| **Frontend** | https://hirerightfronntend.netlify.app |
| **Backend API** | https://hireright-backend.onrender.com |
| **API Docs** | https://hireright-backend.onrender.com/docs |
| **GitHub Repo** | https://github.com/RudraPyt/HireRight |

### Backend → Render

```
Platform  : render.com
Service   : Web Service
Repo      : RudraPyt/HireRight
Branch    : main
Root Dir  : backend
Runtime   : Python 3
Build Cmd : pip install -r requirements.txt
Start Cmd : uvicorn main:app --host 0.0.0.0 --port 10000

Environment Variables:
  ANTHROPIC_API_KEY = sk-ant-...
  SECRET_KEY        = your-random-secret
```

### Frontend → Netlify

```
Platform    : netlify.com
Repo        : RudraPyt/HireRight
Branch      : main
Base Dir    : frontend
Build Cmd   : npm run build
Publish Dir : frontend/dist

Environment Variables:
  VITE_API_URL = https://hireright-backend.onrender.com
```

### ⚠️ Render Free Tier Note

Render's free tier spins down after 15 minutes of inactivity. The first request after sleep takes 30–60 seconds. Before any demo, warm up the backend by visiting:
```
https://hireright-backend.onrender.com/docs
```

---

## 🗺 Roadmap

```
v2.0 (Current — Live) ───────────────────────────────────────────────┐
│                                                                     │
│  ✅ User authentication (JWT)                                       │
│  ✅ Multi-project workspace                                         │
│  ✅ TF-IDF skill matching (scikit-learn)                           │
│  ✅ Claude AI reasoning + team summary                              │
│  ✅ Workload distribution chart                                     │
│  ✅ Availability-aware assignment                                   │
│  ✅ Demo data seeding                                               │
│  ✅ Deployed on Render + Netlify                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

v2.1 (Next) ─────────────────────────────────────────────────────────┐
│                                                                     │
│  🔲 GitHub integration (auto-detect skills from commit history)    │
│  🔲 Slack bot (/assign command)                                     │
│  🔲 Task dependency graphs                                         │
│  🔲 Email notifications for assignments                            │
│  🔲 PostgreSQL migration for production scale                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

v3.0 (Future) ───────────────────────────────────────────────────────┐
│                                                                     │
│  🔲 Performance feedback loop (was this assignment good?)          │
│  🔲 Toggl / Clockify integration (real hours tracking)             │
│  🔲 Budget burn rate tracking                                      │
│  🔲 Team analytics and insights dashboard                          │
│  🔲 Mobile app (React Native)                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🤝 Contributing

Contributions are welcome. Here's how:

```bash
# 1. Fork the repo on GitHub
# 2. Create your feature branch
git checkout -b feature/amazing-feature

# 3. Commit your changes
git commit -m "Add: amazing feature"

# 4. Push to the branch
git push origin feature/amazing-feature

# 5. Open a Pull Request at:
# https://github.com/RudraPyt/HireRight/pulls
```

Please make sure to:
- Follow the existing code style
- Test your changes locally before submitting
- Write clear commit messages

---

## 🐛 Known Issues

| Issue | Status | Workaround |
|---|---|---|
| Render free tier cold starts (~50s) | Render limitation | Visit `/docs` before demo to warm up |
| SQLite not suitable for production scale | Dev limitation | Migrate to PostgreSQL for v2.1 |
| Auto-Assign slow on first run | Claude API latency | Normal — subsequent runs are faster |

---

## 📄 License

```
MIT License

Copyright (c) 2024 Rudra (RudraPyt)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 👤 Author

**Rudra** · [@RudraPyt](https://github.com/RudraPyt)

Built with ⚡ FastAPI, React, and Claude AI by Anthropic.

---

<div align="center">

**If this project helped you, give it a ⭐ on [GitHub](https://github.com/RudraPyt/HireRight)**

[🚀 Live App](https://hirerightfronntend.netlify.app) · [📖 API Docs](https://hireright-backend.onrender.com/docs) · [💻 Source Code](https://github.com/RudraPyt/HireRight)

*HireRight — Stop guessing. Start allocating.*

</div>
