export function normalizeDate(value) {
  if (!value) return "";
  const text = String(value).trim();
  const iso = text.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? text : `${parsed.getFullYear()}-${String(parsed.getMonth()+1).padStart(2,"0")}-${String(parsed.getDate()).padStart(2,"0")}`;
}
export function timeToMinutes(value) {
  if (!value) return null;
  const text = String(value).trim().toLowerCase();
  const m = text.match(/^(\d{1,2}):(\d{2})(?:\s*(am|pm))?$/);
  if (!m) return null;
  let h = Number(m[1]); const minute = Number(m[2]);
  if (minute > 59 || h > 23) return null;
  if (m[3]) { if (h < 1 || h > 12) return null; h = (h % 12) + (m[3] === "pm" ? 12 : 0); }
  return h * 60 + minute;
}
export function calendarConflicts(candidate, existing) {
  const date = normalizeDate(candidate.date);
  const start = timeToMinutes(candidate.time);
  if (!date || start === null) return [];
  const end = candidate.endTime ? timeToMinutes(candidate.endTime) : start + 60;
  if (end === null || end <= start) return [];
  return existing.filter(item => {
    if (candidate.id && String(item.id) === String(candidate.id)) return false;
    if (normalizeDate(item.date) !== date || !item.time) return false;
    const otherStart = timeToMinutes(item.time);
    if (otherStart === null) return false;
    const otherEnd = item.endTime ? timeToMinutes(item.endTime) : otherStart + 60;
    return otherEnd !== null && otherEnd > otherStart && start < otherEnd && otherStart < end;
  }).map(item => ({ id:item.id, title:item.title || "Untitled event", date:normalizeDate(item.date), time:item.time, endTime:item.endTime || "" }));
}
export function calendarConflict(candidate, existing) {
  const start = timeToMinutes(candidate.time);
  const end = candidate.endTime ? timeToMinutes(candidate.endTime) : (start === null ? null : start + 60);
  if (start !== null && end !== null && end <= start) return "End time must be later than start time.";
  const conflicts = calendarConflicts(candidate, existing);
  return conflicts.length ? `Time conflict with ${conflicts.map(x=>`"${x.title}" (${x.time}${x.endTime?`–${x.endTime}`:""})`).join(", ")}.` : null;
}
