import test from "node:test";
import assert from "node:assert/strict";
import { calendarConflict, calendarConflicts } from "../server/calendar.js";
const existing = [
  { id:"1", title:"bath", date:"2026-11-04", time:"16:00", endTime:"17:00" },
  { id:"2", title:"playing", date:"2026-11-04", time:"17:30", endTime:"18:30" }
];
test("detects identical start times", () => assert.match(calendarConflict({ date:"2026-11-04", time:"16:00", endTime:"17:00" }, existing), /bath/));
test("detects partial overlap", () => assert.match(calendarConflict({ date:"2026-11-04", time:"16:30", endTime:"17:30" }, existing), /bath/));
test("returns every overlapping event", () => assert.deepEqual(calendarConflicts({ date:"2026-11-04", time:"16:30", endTime:"18:00" }, existing).map(x=>x.title), ["bath","playing"]));
test("allows adjacent non-overlapping events", () => assert.equal(calendarConflict({ date:"2026-11-04", time:"17:00", endTime:"17:30" }, existing), null));
test("excludes the same event when editing", () => assert.equal(calendarConflict({ id:"1", date:"2026-11-04", time:"16:00", endTime:"17:00" }, existing), null));
test("supports 12-hour times", () => assert.match(calendarConflict({ date:"2026-11-04", time:"4:30 PM", endTime:"5:30 PM" }, existing), /bath/));
test("rejects invalid end times", () => assert.match(calendarConflict({ date:"2026-11-04", time:"16:00", endTime:"15:00" }, existing), /End time/));
test("does not report conflicts on another date", () => assert.equal(calendarConflict({ date:"2026-11-05", time:"16:00", endTime:"17:00" }, existing), null));
