export default function LoadingState() {
  return (
    <div className="loading-wrap">
      <div className="loading-spinner" role="status" aria-label="Loading itinerary" />
      <div>
        <p className="loading-title">Building your itinerary…</p>
        <p className="loading-sub">This usually takes 5–10 seconds</p>
      </div>
      <div className="loading-shimmer" aria-hidden="true">
        <div className="shimmer-line short" />
        <div className="shimmer-line long" />
        <div className="shimmer-line medium" />
        <div className="shimmer-line long" />
        <div className="shimmer-line short" />
        <div className="shimmer-line medium" />
      </div>
    </div>
  );
}
