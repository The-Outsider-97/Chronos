# R-Games

R-Games is a multi-game platform that bundles three strategy/cognitive experiences behind a single Python launcher and shared AI backend infrastructure:

- **Chronos** – a turn-based tactical strategy game.
- **Aether Shift** – a grid-control board game focused on pathing, wells, and positional pressure.
- **Project: Mindweave** – a cognitive and socio-emotional RPG simulation with optional LLM-powered dialogue.

The root server (`app.py`) handles game selection, session management, and AI request routing, so all three games can be launched from a single entry point.

---

## Table of Contents

- [Project Goals](#project-goals)
- [Architecture Overview](#architecture-overview)
- [Repository Layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [How Game Routing Works](#how-game-routing-works)
- [AI Stack](#ai-stack)
- [Mindweave LLM Key Flow](#mindweave-llm-key-flow)
- [Development Notes](#development-notes)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Project Goals

R-Games is designed as a shared launcher + AI runtime that:

1. Hosts multiple games from one backend.
2. Initializes game-specific AI only when needed.
3. Routes user-session API calls to the selected game runtime.
4. Supports both deterministic game logic and adaptive AI behavior.

---

## Architecture Overview

### Launcher and backend

- **`app.py`** starts a threaded HTTP server.
- It tracks per-session game selections with a session cookie.
- It lazy-loads AI modules for each game (`ai_chronos.py`, `ai_aether.py`, `ai_mindweave.py`).
- It exposes endpoints for:
  - listing available games,
  - selecting a game,
  - checking AI health,
  - sending game/AI actions.

### Frontend

- **Root launcher UI** is served from `index.html` and `src/`.
- Individual games are served from:
  - `chronos/`
  - `aether/`
  - `mindweave/`

### AI modules

Each game has an AI initializer and runtime class that integrates the shared `AI/` agent framework (knowledge, planning, execution, learning, language, safety, etc., depending on the game).

---

## Repository Layout

```text
R-Games/
├─ app.py                  # Main launcher/backend server
├─ index.html              # Main launcher page
├─ src/                    # Shared launcher assets (JS/CSS/audio)
├─ ai_chronos.py           # Chronos AI integration
├─ ai_aether.py            # Aether Shift AI integration
├─ ai_mindweave.py         # Mindweave AI integration
├─ AI/                     # Shared agent framework and logs/data
├─ chronos/                # Chronos game client + local Node tooling
├─ aether/                 # Aether Shift client + local Node tooling
├─ mindweave/              # Mindweave client assets and templates
├─ requirements.txt        # Python dependencies
└─ LICENSE
```

---

## Prerequisites

### Required

- **Python 3.10+** (recommended)
- **pip**

### Optional (for local game-client workflows)

- **Node.js 18+**
- **npm**

Node tooling exists in `chronos/` and `aether/` for local frontend/dev workflows, but the root launcher itself runs via Python.

---

## Quick Start

### 1) Clone and enter the repository

```bash
git clone https://github.com/The-Outsider-97/R-Games.git
cd R-Games
```

### 2) Create and activate a virtual environment

**macOS/Linux**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

**Windows (PowerShell)**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 3) Install Python dependencies

```bash
pip install -r requirements.txt
```

### 4) Run the launcher server

```bash
python app.py --host 0.0.0.0 --port 8000
```

### 5) Open the app

Visit:

- `http://localhost:8000`

From the launcher, choose Chronos, Aether Shift, or Project: Mindweave.

---

## How Game Routing Works

1. The launcher assigns/reads a session cookie (`r_games_session`).
2. You select a game card in the launcher.
3. `app.py` initializes that game's AI runtime (if not already running).
4. Your session is bound to that selected game.
5. Future AI/game API calls in that session are routed to the chosen runtime.

This design allows one backend process to serve multiple game-specific AI behaviors cleanly.

---

## AI Stack

The `AI/` directory provides reusable agent infrastructure used by the game-specific adapters:

- Knowledge retrieval
- Planning / task decomposition
- Execution / action support
- Learning updates
- Language and reasoning support
- Safety/alignment components

Game wrappers (`ai_*.py`) decide which agents are activated and how game payloads are translated into agent tasks.

---

## Mindweave LLM Key Flow

Project: Mindweave supports bring-your-own-key usage for LLM-backed interactions.

- The launcher prompts for an API key when needed.
- The key is stored in browser `localStorage` under:
  - `mindweave_llm_api_key`
- The key is intended for runtime usage and not persisted by the launcher backend as an account credential store.

Supported provider formats are referenced directly in the launcher UI.

---

## Development Notes

### Run Chronos local Node workflow

```bash
cd chronos
npm install
npm run dev
```

### Run Aether local Node workflow

```bash
cd aether
npm install
npm run dev
```

### Root Python launcher remains the integration hub

When validating end-to-end game selection + AI routing, run from repository root:

```bash
python app.py
```

---

## Troubleshooting

### Port already in use

Start on another port:

```bash
python app.py --port 8010
```

### Import errors from AI modules

- Ensure dependencies are installed from `requirements.txt`.
- Ensure you run commands from repository root (`R-Games/`) so local paths resolve correctly.

### Game initializes slowly

The launcher performs AI module checks and lazy runtime initialization. First launch of a specific game may take longer than subsequent launches.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
