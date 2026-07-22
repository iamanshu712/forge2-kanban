# Agent Loop & Slack Socket Mode Setup Guide

This document explains how to run the **OpenClaw Agent Loop** with **Hermes Orchestration** and **Slack Socket Mode API**.

---

## 1. Environment Configuration (.env)

Make sure your root `.env` file contains your Slack Tokens and channel configurations:

```env
# --- Slack (create app at api.slack.com/apps, see ARCHITECTURE.md) ---
SLACK_APP_TOKEN=xapp-your-app-level-token    # scope: connections:write
SLACK_BOT_TOKEN=xoxb-your-bot-token         # scopes: chat:write, channels:read, app_mentions:read

# --- Free model providers (pick at least one) ---
GROQ_API_KEY=your-groq-key                  # console.groq.com
GEMINI_API_KEY=your-gemini-key              # aistudio.google.com

# --- Frontend -> backend wiring ---
VITE_API_URL=http://127.0.0.1:8000/api

# --- Slack/OpenClaw bridge -> backend wiring ---
KANBAN_API_URL=http://127.0.0.1:8000/api
SLACK_SPRINT_CHANNEL=#sprint-main
SLACK_CODER_CHANNEL=#agent-coder
SLACK_LOG_CHANNEL=#agent-log
```

---

## 2. Slack App Setup Instructions

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and click **Create New App** -> **From an app manifest**.
2. Select your workspace.
3. Enable **Socket Mode** under *Settings -> Socket Mode*.
4. Generate an **App-Level Token** with the `connections:write` scope. Paste it into `SLACK_APP_TOKEN`.
5. Under *OAuth & Permissions*, add Bot Token Scopes:
   - `chat:write`
   - `channels:read`
   - `app_mentions:read`
   - `commands`
6. Install the App to your Workspace and copy the **Bot User OAuth Token** (`xoxb-...`) into `SLACK_BOT_TOKEN`.

---

## 3. Launching the Agent Loop

Run the unified start command from the project root:

```bash
npm run start
```

Hermes and OpenClaw will automatically establish an outbound Socket Mode WebSocket connection to Slack and process all Kanban commands in real-time.
