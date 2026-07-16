# Architecture

## Agent roles (fill in with your real setup)

| Agent | Role | Model used | Why |
|---|---|---|---|
| Hermes | Brain — plans tasks, remembers context, runs the `status-report` skill, fires one autonomous cron update | _(e.g. Groq `openai/gpt-oss-120b`)_ | Planning benefits from a stronger, slower model. |
| OpenClaw | Hands — writes code, runs it, reports back in `#agent-coder` | _(e.g. Ollama `qwen2.5-coder` or Groq `llama-3.3-70b`)_ | Execution is high-volume; route to a cheap/local/fast model. |

## Slack channel scheme

| Channel | Purpose |
|---|---|
| `#sprint-main` | Human ↔ Hermes. Goals in, plans + status updates out. |
| `#agent-coder` | Hermes ↔ OpenClaw. Task handoff, code, "What I Did / What's Left / What Needs Your Call" reports. |
| `#agent-log` | Raw agent activity + autonomous cron output. Audit trail. |

**Loop:** human posts a goal in `#sprint-main` → Hermes posts a plan → Hermes
hands a task to OpenClaw in `#agent-coder` → OpenClaw codes, runs it, reports
back → human approves or corrects in `#sprint-main`.

## App architecture

```
frontend (React/Vite)  --HTTP-->  backend (Laravel API)  -->  SQLite
   BoardView                        BoardController
   ListColumn                       BoardListController
   CardItem / CardModal             CardController (incl. /move)
                                     TagController
                                     MemberController
```

- **Boards** have many **Lists** (ordered by `position`).
- **Lists** have many **Cards** (ordered by `position`).
- **Cards** belong to one **Member** (nullable) and belong-to-many **Tags**
  (via `card_tag` pivot).
- Moving a card between lists is a single `PATCH /cards/{id}/move` call that
  updates `board_list_id` + `position` — this is the endpoint the drag-and-drop
  UI hits.
- Overdue is computed server-side as an Eloquent accessor (`is_overdue`) so the
  frontend never has to duplicate date logic.

## What to replace before submitting

- This file's agent/model table (currently placeholders)
- `agent-log.md` with your real, unedited chat exchanges
- `slack-export/` or screenshots of the real loop + Slack round-trip test
- `evidence/walkthrough.mp4` showing your agents actually building this
