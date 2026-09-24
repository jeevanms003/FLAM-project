const VALID_TYPES = ["attraction", "food", "hotel", "transport"];

function isString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function isNumber(v) {
  return typeof v === "number" && !isNaN(v);
}

function validateStop(stop) {
  if (!stop || typeof stop !== "object") return false;
  if (!isString(stop.id)) return false;
  if (!isString(stop.name)) return false;
  if (!VALID_TYPES.includes(stop.type)) return false;
  if (!isString(stop.description)) return false;
  if (!isString(stop.duration)) return false;
  return true;
}

function validateDay(day) {
  if (!day || typeof day !== "object") return false;
  if (!isString(day.id)) return false;
  if (!isNumber(day.day)) return false;
  if (!isString(day.title)) return false;
  if (!Array.isArray(day.stops) || day.stops.length === 0) return false;
  return day.stops.every(validateStop);
}

export function validateItinerary(data) {
  if (!data || typeof data !== "object") return null;
  if (!isString(data.destination)) return null;
  if (!Array.isArray(data.days) || data.days.length === 0) return null;
  if (!data.days.every(validateDay)) return null;
  return data;
}
