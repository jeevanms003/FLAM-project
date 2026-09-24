import { useRef, useState } from "react";

const HINT_PROMPTS = [
  "3 days in Tokyo",
  "Weekend in Paris",
  "Bali honeymoon, 5 days",
  "NYC highlights, 2 days",
];

const MapPinIcon = () => (
  <svg className="prompt-label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const SparklesIcon = () => (
  <svg className="generate-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);

export default function PromptInput({ onSubmit, isLoading }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
  }

  function applyHint(hint) {
    setValue(hint);
    textareaRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="prompt-section">
      <div className="prompt-card">
        <div className="prompt-label">
          <MapPinIcon />
          Describe your trip
        </div>
        <textarea
          ref={textareaRef}
          id="trip-prompt"
          className="prompt-textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. 5 days in Japan — Tokyo, Kyoto, and a day trip to Osaka. I love food, temples, and avoiding tourist traps."
          rows={4}
          maxLength={2000}
          aria-label="Trip description"
        />
        <div className="prompt-footer">
          <div className="prompt-hints">
            {HINT_PROMPTS.map((hint) => (
              <button
                key={hint}
                type="button"
                className="hint-chip"
                onClick={() => applyHint(hint)}
                tabIndex={0}
              >
                {hint}
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="generate-btn"
            disabled={isLoading || value.trim().length === 0}
            id="generate-btn"
          >
            <SparklesIcon />
            {isLoading ? "Planning…" : "Plan my trip"}
          </button>
        </div>
      </div>
    </form>
  );
}
