# Wandr — AI Trip Planner

A React app built for the Flam Frontend Internship Assignment. Type in a trip description, get back a structured day-by-day itinerary you can reorder, expand, and trim down.

## What it does

You describe a trip — destination, duration, vibe — and the app sends that to a Groq-hosted Llama model through a small Express backend. The model returns structured JSON (never raw text), which gets validated before it touches the UI. The result is a drag-and-drop itinerary with expandable days and removable stops.

## Tech

- React 18 + Vite (frontend)
- Express (backend proxy — keeps the API key out of the browser)
- Groq API with `llama-3.3-70b-versatile`
- `@dnd-kit` for drag-and-drop reorder
- Vanilla CSS — no UI frameworks

## Setup

Get a free API key at [console.groq.com](https://console.groq.com).

```bash
git clone <repo>
cd flam-trip-planner
npm install
cp .env.example .env
# paste your Groq key into .env
npm start
```

Open [http://localhost:5173](http://localhost:5173).

The `npm start` script runs both the Express server (port 3001) and the Vite dev server (port 5173) at once via `concurrently`. Vite proxies `/api` calls to the backend, so the browser never sees the API key.

## Project structure

```
src/
  components/
    promptinput.jsx     — text input + example prompts
    itineraryview.jsx   — drag-and-drop days, expandable stops
    errorstate.jsx      — shared error UI with retry
    loadingstate.jsx    — spinner + shimmer placeholders
  lib/
    api.js              — only place frontend talks to the backend
    validateresult.js   — shape-checks the model response before render
  app.jsx               — state machine, stale-response guard
  index.css             — full design system

server/
  generate.js           — Express server, holds the API key, calls Groq
```

## Failure handling

Every realistic failure mode has a named UI state:

| Failure | Handling |
|---|---|
| Malformed JSON | Caught server-side before response is sent |
| Wrong shape | `validateresult.js` returns null → error state |
| Empty response | Treated as failure, not empty-but-valid |
| Slow request | Spinner shown immediately, no silent hangs |
| Failed request | Error state with retry button |
| Stale response | `requestIdRef` guard — newer request wins, older is discarded |
| Aborted request | `AbortController` cancels in-flight fetch on new submit |

## AI usage note

I used Claude to help write and review parts of the validation logic and some CSS. All architecture decisions, data shape design, state machine structure, and component breakdown were done by me. I understand every line — happy to walk through any of it.

## Known limitations

- No session persistence — refresh loses the itinerary
- The model occasionally mis-types a stop's `type` field (e.g. "restaurant" instead of "food"); the validator catches this and shows an error with a retry
- Local models via Ollama tend to be less consistent at structured output, so validation matters more there

## Time spent

~7.5 hours total. I'd use the remaining time to add streaming output and local session save/load.

## Submission

[Assignment submission form](https://forms.gle/3V2sjQDgXUD8RbHb6)
