import { useRef, useState } from "react";
import PromptInput from "./components/promptinput.jsx";
import ItineraryView from "./components/itineraryview.jsx";
import LoadingState from "./components/loadingstate.jsx";
import ErrorState from "./components/errorstate.jsx";
import { generateItinerary } from "./lib/api.js";
import { validateItinerary } from "./lib/validateresult.js";

const STATES = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

export default function App() {
  const [uiState, setUiState] = useState(STATES.IDLE);
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState(null);
  const [lastPrompt, setLastPrompt] = useState("");
  const requestIdRef = useRef(0);
  const abortRef = useRef(null);

  async function handleSubmit(prompt) {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const id = ++requestIdRef.current;

    setLastPrompt(prompt);
    setUiState(STATES.LOADING);
    setError(null);
    setItinerary(null);

    try {
      const raw = await generateItinerary(prompt, controller.signal);

      if (id !== requestIdRef.current) return;

      const validated = validateItinerary(raw);

      if (!validated) {
        setError("The AI returned data in an unexpected shape. Try rephrasing your trip description.");
        setUiState(STATES.ERROR);
        return;
      }

      setItinerary(validated);
      setUiState(STATES.SUCCESS);
    } catch (err) {
      if (id !== requestIdRef.current) return;
      if (err.name === "AbortError") return;

      setError(err.message || "Something went wrong. Please try again.");
      setUiState(STATES.ERROR);
    }
  }

  function handleReset() {
    if (abortRef.current) abortRef.current.abort();
    setUiState(STATES.IDLE);
    setItinerary(null);
    setError(null);
  }

  function handleRetry() {
    if (lastPrompt) handleSubmit(lastPrompt);
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-badge">
          <span />
          Powered by Groq + Llama
        </div>
        <h1 className="hero-title">Your trip, planned by AI</h1>
        <p className="hero-sub">
          Describe your trip in plain English — destinations, vibe, how many days.
          Get back a full interactive itinerary you can reorder and customize.
        </p>
        <PromptInput onSubmit={handleSubmit} isLoading={uiState === STATES.LOADING} />
      </header>

      {uiState === STATES.LOADING && <LoadingState />}

      {uiState === STATES.ERROR && (
        <div className="main-content">
          <ErrorState message={error} onRetry={handleRetry} />
        </div>
      )}

      {uiState === STATES.SUCCESS && itinerary && (
        <ItineraryView itinerary={itinerary} onReset={handleReset} />
      )}

      <footer className="app-footer">
        Built for the{" "}
        <a href="https://forms.gle/3V2sjQDgXUD8RbHb6" target="_blank" rel="noreferrer">
          Flam Frontend Assignment
        </a>{" "}
        — AI Trip Planner
      </footer>
    </div>
  );
}
