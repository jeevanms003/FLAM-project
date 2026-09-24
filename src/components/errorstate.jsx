const AlertCircleIcon = () => (
  <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
    <path d="M8 16H3v5"/>
  </svg>
);

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="error-wrap" role="alert">
      <div className="error-icon-wrap">
        <AlertCircleIcon />
      </div>
      <h2 className="error-title">Something went wrong</h2>
      <p className="error-message">
        {message || "The AI returned something unexpected. This happens sometimes — try again and it usually works."}
      </p>
      {onRetry && (
        <button className="retry-btn" onClick={onRetry} id="retry-btn">
          <RefreshIcon />
          Try again
        </button>
      )}
    </div>
  );
}
