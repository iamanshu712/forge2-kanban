# OpenClaw, Hermes & Slack Integration Guide

This guide details the integration of **OpenClaw (AI Agent)**, **Hermes (Orchestrator)**, and **Slack Commands** into the existing **Forge Kanban Board** application.

---

## 1. Project Architecture Overview

```
                        [ Slack User Commands ]
                                   │
                                   ▼ (POST /slack/commands)
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. Hermes Orchestrator (Express Node.js Service)                             │
│    - Validates Slack payloads & headers                                     │
│    - Manages conversation context & session routing                         │
│    - Formats Markdown block responses for Slack                             │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼ (Process Command)
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. OpenClaw AI Agent (Intent Parser & Execution Engine)                    │
│    - Parses natural language intent (create, list, move, assign)            │
│    - Maps parameters to structured tools                                    │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼ (REST API Call + Sanctum Bearer Token)
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. Laravel 11 REST API Backend                                              │
│    - Controllers: TaskController, AgentController, BoardController          │
│    - Middleware: auth:sanctum                                               │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼ (Eloquent SQL Operations)
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. SQLite Database (`database/database.sqlite`)                             │
│    - Tables: users, boards, columns, tasks (with assigned_to foreign key)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Integration Responsibilities

- **Slack**: Serves as the user interface where team members issue commands (`create task`, `list tasks`, `move task`, `assign task`).
- **Hermes**: Receives incoming webhook events from Slack, verifies authorization, manages session state, forwards commands to OpenClaw, and formats rich Slack responses.
- **OpenClaw**: The AI Agent that receives raw command strings, parses intent, and invokes structured tool actions against the Laravel API.
- **Laravel Backend**: Stores and updates tasks, columns, and user assignments in SQLite database.

---

## 3. Environment Variables (.env)

### Backend (`backend/.env`):
```env
APP_NAME=ForgeKanban
APP_ENV=local
APP_KEY=base64:PYrEeQtLRkqU3A8pJuD5vlV9sZnXWkMb6OHFNhqG1Tc=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
```

### Integrations (`integrations/.env`):
```env
HERMES_PORT=3001
LARAVEL_API_URL=http://127.0.0.1:8000
AGENT_API_TOKEN=4|rkG3s6M11iACXNzrgUsDHkpwExfedSukr9hjVplX29c218cf
SLACK_SIGNING_SECRET=your_slack_signing_secret_here
```

---

## 4. Installation & Local Execution Commands

### 1. Install All Dependencies:
```bash
npm run setup
```

### 2. Run All Services Concurrently (Single Command):
```bash
npm run start:services
```
This launches:
- **Backend API**: `http://127.0.0.1:8000`
- **Frontend App**: `http://localhost:5173`
- **Hermes & OpenClaw**: `http://127.0.0.1:3001`

---

## 5. Slack Commands & Examples

| Command | Action | Example |
| :--- | :--- | :--- |
| `create task` | Creates a new task | `/kanban create task "Release v2.0" in "In Progress" priority high` |
| `list tasks` | Lists all board tasks | `/kanban list tasks` |
| `move task` | Moves task between columns | `/kanban move task 1 to "Done"` |
| `assign task` | Assigns task to user | `/kanban assign task 1 to demo@forgekanban.com` |

---

## 6. Local Testing via Curl / PowerShell

You can test Hermes & OpenClaw locally without setting up a live Slack app:

```bash
# Test 1: List Tasks
curl -X POST http://127.0.0.1:3001/slack/commands -d "text=list tasks"

# Test 2: Create Task
curl -X POST http://127.0.0.1:3001/slack/commands -d "text=create task \"Build Feature X\" in \"Backlog\" priority high"

# Test 3: Move Task
curl -X POST http://127.0.0.1:3001/slack/commands -d "text=move task 1 to Done"

# Test 4: Assign Task
curl -X POST http://127.0.0.1:3001/slack/commands -d "text=assign task 1 to demo@forgekanban.com"
```
