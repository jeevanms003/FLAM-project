import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const STOP_ICONS = {
  attraction: "🏛️",
  food: "🍜",
  hotel: "🛏️",
  transport: "🚆",
};

const ChevronDownIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const GripIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/>
    <circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

const LightbulbIcon = () => (
  <svg className="stop-tip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
    <path d="M9 18h6"/><path d="M10 22h4"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="M12 5v14"/>
  </svg>
);

const RotateCcwIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
);

function StopCard({ stop, onRemove }) {
  return (
    <div className="stop-card">
      <div className={`stop-icon ${stop.type}`}>
        {STOP_ICONS[stop.type] || "📍"}
      </div>
      <div className="stop-body">
        <div className="stop-top">
          <div>
            <div className="stop-name">{stop.name}</div>
            <span className={`type-badge ${stop.type}`}>{stop.type}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
            <span className="stop-duration">{stop.duration}</span>
            <button
              className="remove-stop-btn"
              onClick={() => onRemove(stop.id)}
              aria-label={`Remove ${stop.name}`}
              title="Remove stop"
            >
              <XIcon />
            </button>
          </div>
        </div>
        <p className="stop-description">{stop.description}</p>
        {stop.tips && (
          <div className="stop-tip">
            <LightbulbIcon />
            <span>{stop.tips}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SortableDayCard({ day, onRemoveDay, onRemoveStop }) {
  const [expanded, setExpanded] = useState(true);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: day.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`day-card ${expanded ? "expanded" : ""} ${isDragging ? "dragging" : ""}`}
    >
      <div className="day-header" onClick={() => setExpanded((v) => !v)}>
        <div className="day-number">
          <span className="day-number-text">{day.day}</span>
        </div>
        <div className="day-info">
          <div className="day-title">{day.title}</div>
          {day.theme && <div className="day-theme">{day.theme}</div>}
        </div>
        <div className="day-header-right">
          <span className="stop-count">
            {day.stops.length} {day.stops.length === 1 ? "stop" : "stops"}
          </span>
          <div className="day-controls" onClick={(e) => e.stopPropagation()}>
            <button
              className="day-control-btn drag-handle"
              {...attributes}
              {...listeners}
              aria-label="Drag to reorder day"
              title="Drag to reorder"
            >
              <GripIcon />
            </button>
            <button
              className="day-control-btn"
              onClick={() => onRemoveDay(day.id)}
              aria-label={`Remove day ${day.day}`}
              title="Remove day"
            >
              <TrashIcon />
            </button>
          </div>
          <ChevronDownIcon className={`chevron ${expanded ? "open" : ""}`} />
        </div>
      </div>
      {expanded && (
        <div className="day-body">
          {day.stops.length === 0 ? (
            <div className="empty-day">No stops left in this day</div>
          ) : (
            <div className="stops-list">
              {day.stops.map((stop) => (
                <StopCard
                  key={stop.id}
                  stop={stop}
                  onRemove={(stopId) => onRemoveStop(day.id, stopId)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ItineraryView({ itinerary, onReset }) {
  const [days, setDays] = useState(itinerary.days);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setDays((prev) => {
      const oldIndex = prev.findIndex((d) => d.id === active.id);
      const newIndex = prev.findIndex((d) => d.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function removeDay(dayId) {
    setDays((prev) => prev.filter((d) => d.id !== dayId));
  }

  function removeStop(dayId, stopId) {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, stops: d.stops.filter((s) => s.id !== stopId) }
          : d
      )
    );
  }

  const totalStops = days.reduce((sum, d) => sum + d.stops.length, 0);

  return (
    <div className="main-content">
      <div className="itinerary-header">
        <div className="itinerary-meta">
          <div className="itinerary-eyebrow">AI-generated itinerary</div>
          <h1 className="itinerary-destination">{itinerary.destination}</h1>
          {itinerary.summary && (
            <p className="itinerary-summary">{itinerary.summary}</p>
          )}
        </div>
        <div className="itinerary-actions">
          <button className="new-trip-btn" onClick={onReset} id="new-trip-btn">
            <RotateCcwIcon />
            Plan new trip
          </button>
        </div>
      </div>

      {days.length === 0 ? (
        <div className="days-empty-banner">
          You removed all the days.{" "}
          <button
            style={{ color: "var(--accent-light)", background: "none", cursor: "pointer", fontSize: "inherit" }}
            onClick={onReset}
          >
            Start over?
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={days.map((d) => d.id)} strategy={verticalListSortingStrategy}>
            <div className="days-list">
              {days.map((day) => (
                <SortableDayCard
                  key={day.id}
                  day={day}
                  onRemoveDay={removeDay}
                  onRemoveStop={removeStop}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {days.length > 0 && (
        <div className="itinerary-footer">
          <div className="footer-stat">
            <span className="footer-stat-label">Days</span>
            <span className="footer-stat-value">{days.length}</span>
          </div>
          <div className="footer-divider" />
          <div className="footer-stat">
            <span className="footer-stat-label">Total stops</span>
            <span className="footer-stat-value">{totalStops}</span>
          </div>
          <div className="footer-divider" />
          <div className="footer-stat">
            <span className="footer-stat-label">Destination</span>
            <span className="footer-stat-value" style={{ fontSize: "16px" }}>{itinerary.destination}</span>
          </div>
        </div>
      )}
    </div>
  );
}
