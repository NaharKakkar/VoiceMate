import "dotenv/config";
import express from "express";
import cors from "cors";
import { google } from "googleapis";
import { initStore, all, save, remove, clear, storageMode } from "./store.js";
import { calendarConflict, calendarConflicts } from "./calendar.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "8mb" }));
const PORT = process.env.PORT || 3000;

const allowedCollections = new Set(["expenses", "tasks", "calendar", "notes", "meetings"]);
const oauthConfigured = () => !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const oauthClient = () => new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `http://localhost:${PORT}/auth/google/callback`
);
let gmailTokens = null; // Demo-only in-memory token storage. Use encrypted per-user storage for production.

async function gemini(prompt) {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is missing. Add it to .env and restart the server.");
  const model = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || `Gemini request failed (${response.status})`);
  return data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
}
function extractJson(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("{"), end = clean.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("AI returned an unreadable response. Please try again.");
  return JSON.parse(clean.slice(start, end + 1));
}

app.get("/api/health", (req, res) => res.json({ ok: true, storage: storageMode(), geminiConfigured: !!process.env.GEMINI_API_KEY, gmailConfigured: oauthConfigured() }));
app.get("/api/data", async (req, res) => {
  try {
    const result = {};
    for (const name of allowedCollections) result[name] = await all(name);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post("/api/:collection(expenses|tasks|calendar|notes|meetings)", async (req, res) => {
  const { collection } = req.params;
  try {
    if (collection === "calendar") {
      const conflicts = calendarConflicts(req.body, await all("calendar"));
      if (conflicts.length && req.query.allowConflict !== "true") {
        return res.status(409).json({ error: "This event overlaps with existing calendar entries.", conflicts });
      }
      const invalid = calendarConflict(req.body, []);
      if (invalid) return res.status(400).json({ error: invalid });
    }
    res.json(await save(collection, req.body));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put("/api/:collection(expenses|tasks|calendar|notes|meetings)/:id", async (req, res) => {
  const { collection, id } = req.params;
  try {
    const rows = await all(collection);
    const current = rows.find(item => String(item.id) === String(id));
    if (!current) return res.status(404).json({ error: `The selected ${collection.slice(0,-1)} no longer exists. Refresh and try again.` });
    const updated = { ...current, ...req.body, id: current.id };
    if (collection === "expenses" && updated.amount !== undefined) {
      updated.amount = Number(updated.amount);
      if (!Number.isFinite(updated.amount) || updated.amount < 0) return res.status(400).json({ error: "Expense amount must be a valid non-negative number." });
    }
    if (collection === "calendar") {
      const conflicts = calendarConflicts(updated, rows);
      if (conflicts.length && req.query.allowConflict !== "true") {
        return res.status(409).json({ error: "This event overlaps with existing calendar entries.", conflicts });
      }
      const invalid = calendarConflict(updated, []);
      if (invalid) return res.status(400).json({ error: invalid });
    }
    res.json(await save(collection, updated));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete("/api/:collection/:id", async (req, res) => {
  const { collection, id } = req.params;
  if (!allowedCollections.has(collection)) return res.status(404).json({ error: "Unknown collection" });
  try { await remove(collection, id); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete("/api/:collection", async (req, res) => {
  const { collection } = req.params;
  if (!allowedCollections.has(collection)) return res.status(404).json({ error: "Unknown collection" });
  try { await clear(collection); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Voice command router: only the supported action intents are allowed; this is not general chat.
app.post("/api/command", async (req, res) => {
  try {
    const utterance = String(req.body.utterance || "").slice(0, 2000);
    if (!utterance.trim()) return res.status(400).json({ error: "Please provide a voice command." });
    const localDate = /^\d{4}-\d{2}-\d{2}$/.test(String(req.body.localDate || "")) ? req.body.localDate : new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const prompt = `You are the intent parser for VoiceMate, a voice-to-action productivity app. Do NOT act as a general chatbot.
Understand only these intents: add_expense, add_task, list_tasks, list_expenses, create_calendar_event, add_note, draft_email, update_expense, update_task, update_calendar_event, update_note, update_meeting, daily_briefing, expense_insight, productivity_insight, unsupported.
Return ONLY valid JSON: {"intent":"...","data":{},"spokenResponse":"short confirmation or helpful clarification"}.
For add_expense data: {"amount":number,"category":string,"description":string,"date":"YYYY-MM-DD"}.
For add_task: {"title":string,"dueDate":"YYYY-MM-DD or empty","dueTime":"HH:mm or empty","priority":"Low|Medium|High"}.
For create_calendar_event: {"title":string,"date":"YYYY-MM-DD","time":"HH:mm or empty","endTime":"HH:mm or empty","type":"Meeting|Personal|Other"}.
For add_note: {"title":string,"content":string}. For update intents return {"matchQuery":string,"updates":{...}}; matchQuery MUST be a distinctive literal phrase from the existing item's saved title or description, not a new phrase invented from the user's command. updates contains only fields to change. For an expense amount change, return numeric amount. For task scheduling, return dueDate as YYYY-MM-DD and dueTime as 24-hour HH:mm. If the user says today, use today's date ${localDate}. Supported update fields: expense amount/category/description/date; task title/dueDate/dueTime/priority/done; calendar title/date/time/endTime/type; note title/content; meeting title/summary/emailSubject/emailBody/actionItems. Use update_* whenever the user asks to change, update, edit, move, reschedule, or set a field on an already-existing item; do not create a duplicate item in that case. For matchQuery, return the shortest distinctive phrase actually present in the saved item title or description. Use add_* or create_* only when the user clearly requests a new item.
For list/briefing/insights data may be {}. If not one of the supported actions, use unsupported and say which action types are supported. Never invent amounts or dates. If missing required data, ask a short clarification in spokenResponse and return intent unsupported.
Today's date is ${localDate}.
User command: ${utterance}`;
    const parsed = extractJson(await gemini(prompt));
    res.json(parsed);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.post("/api/meetings/process", async (req, res) => {
  try {
    const transcript = String(req.body.transcript || "").slice(0, 20000);
    if (transcript.trim().length < 20) return res.status(400).json({ error: "Add a longer meeting transcript before processing." });
    const prompt = `Extract meeting information for a productivity app. Return ONLY JSON:
{"title":"short meeting title","summary":"concise summary","actionItems":[{"title":"specific task","owner":"person or Unassigned","dueDate":"YYYY-MM-DD or empty","priority":"Low|Medium|High"}],"emailSubject":"...","emailBody":"professional follow-up email"}
Do not invent decisions, owners or deadlines. If unknown, use Unassigned or empty.
Meeting transcript:\n${transcript}`;
    const result = extractJson(await gemini(prompt));
    if (!result.emailSubject || !String(result.emailSubject).trim()) result.emailSubject = `Follow-up: ${result.title || "Meeting"} – Action Items`;
    const meeting = await save("meetings", { ...result, transcript, createdAt: new Date().toISOString() });
    res.json({ ...result, meetingId: meeting.id });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.post("/api/summarize", async (req, res) => {
  try {
    const kind = req.body.kind === "note" ? "voice note" : "productivity";
    const prompt = `Summarize this ${kind} information in concise bullet points. Do not add facts:\n${String(req.body.text || "").slice(0,12000)}`;
    res.json({ summary: await gemini(prompt) });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Gmail OAuth and API. Tokens are held in memory for this single-user hackathon demo only.
app.get("/auth/google", (req, res) => {
  if (!oauthConfigured()) return res.status(400).send("Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env first.");
  const authUrl = oauthClient().generateAuthUrl({
    access_type: "offline", prompt: "consent",
    scope: ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.send"]
  });
  res.redirect(authUrl);
});
app.get("/auth/google/callback", async (req, res) => {
  try {
    const { tokens } = await oauthClient().getToken(req.query.code);
    gmailTokens = tokens;
    res.redirect("http://localhost:5173/?gmail=connected");
  } catch (e) { res.status(400).send(`Gmail connection failed: ${e.message}`); }
});
function gmailApi() {
  if (!gmailTokens) throw new Error("Connect Gmail first.");
  const auth = oauthClient(); auth.setCredentials(gmailTokens);
  return google.gmail({ version: "v1", auth });
}
app.get("/api/gmail/status", (req, res) => res.json({ connected: !!gmailTokens, configured: oauthConfigured() }));
app.get("/api/gmail/messages", async (req, res) => {
  try {
    const gmail = gmailApi();
    const list = await gmail.users.messages.list({ userId: "me", maxResults: 10, q: req.query.q || "in:inbox" });
    const messages = await Promise.all((list.data.messages || []).slice(0,10).map(async m => {
      const detail = await gmail.users.messages.get({ userId: "me", id: m.id, format: "metadata", metadataHeaders: ["Subject","From","Date"] });
      const headers = detail.data.payload?.headers || [];
      const get = n => headers.find(h => h.name.toLowerCase() === n.toLowerCase())?.value || "";
      return { id: m.id, subject: get("Subject") || "(No subject)", from: get("From"), date: get("Date"), snippet: detail.data.snippet || "" };
    }));
    res.json({ messages });
  } catch (e) { res.status(400).json({ error: e.message }); }
});
app.post("/api/gmail/send", async (req, res) => {
  try {
    const { to, subject, body, confirmed } = req.body;
    if (!confirmed) return res.status(400).json({ error: "Explicit confirmation is required before sending." });
    if (!to || !subject || !body) return res.status(400).json({ error: "Recipient, subject and message are required." });
    const raw = Buffer.from(`To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${body}`).toString("base64url");
    const result = await gmailApi().users.messages.send({ userId: "me", requestBody: { raw } });
    res.json({ ok: true, id: result.data.id });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

await initStore();
app.listen(PORT, () => console.log(`VoiceMate API running at http://localhost:${PORT}`));
