import React, { useEffect, useMemo, useRef, useState } from "react";

const today = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const money = n => new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:0 }).format(Number(n || 0));
const blank = { expenses:[], tasks:[], calendar:[], notes:[], meetings:[] };
async function api(url, options={}) {
  const r = await fetch(url, { headers:{ "Content-Type":"application/json", ...(options.headers||{}) }, ...options });
  const data = await r.json().catch(()=>({}));
  if (!r.ok) { const error = new Error(data.error || "Request failed"); error.status = r.status; error.data = data; throw error; }
  return data;
}
function speak(text) {
  if ("speechSynthesis" in window) { window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(text)); }
}

function LegalPage({ type, onBack }) {
  const isPrivacy = type === "privacy";
  const sections = isPrivacy ? [
    {
      title: "Introduction",
      content: [
        "VoiceMate is a productivity assistant designed to help users capture expenses, manage tasks, schedule calendar events, summarize meeting notes, and connect to Gmail for email workflows. This Privacy Policy explains what information VoiceMate collects, stores, processes, and shares in the current implementation of the application.",
        "This policy applies to the VoiceMate web application and its backend services. Where the codebase does not implement a feature, that feature is not described as part of our data practices."
      ]
    },
    {
      title: "Information We Collect",
      content: [
        "The application stores the user-generated data entered in the app, including expenses, tasks, calendar entries, notes, and meeting summaries. In the default implementation, this data is stored in the local JSON file at server/data/db.json. If a MongoDB connection is configured through MONGODB_URI, the same record types are stored in MongoDB instead.",
        "The record types currently handled by the app include: expense amount, category, description, and date; task title, due date, due time, priority, and completion state; calendar title, date, time, end time, and type; voice notes with title and content; and meeting data including transcript, summary, email subject, email body, and action items.",
        "VoiceMate also processes the text of user voice commands and meeting transcripts to generate task, calendar, and email actions through the Google Gemini API. These prompt inputs are sent to the Gemini API for intent parsing and summarization."
      ]
    },
    {
      title: "Google OAuth Authentication",
      content: [
        "VoiceMate supports Google OAuth for Gmail integration. When a user clicks Connect Gmail, the server redirects the browser to Google’s OAuth consent flow at /auth/google. The application requests the following Gmail scopes: https://www.googleapis.com/auth/gmail.readonly and https://www.googleapis.com/auth/gmail.send.",
        "After the user approves access, Google returns an authorization code to the callback endpoint /auth/google/callback. The server exchanges that code for tokens using the Google OAuth client. The resulting Gmail access token and refresh token are stored in memory in the server process as gmailTokens. This is a demo-only implementation and is not persisted in the app database.",
        "VoiceMate does not currently implement a separate user account system, profile database, or persistent Google profile record. The app does not request access to Google Drive, contacts, calendars beyond Gmail, or other Google data scopes beyond Gmail read/send permissions explicitly configured in the backend."
      ]
    },
    {
      title: "How We Use Your Information",
      content: [
        "VoiceMate uses the data you enter to provide core productivity features, including tracking expenses, organizing tasks, planning calendar events, creating notes, and summarizing meetings.",
        "Gmail access is used only to view recent inbox metadata when the user chooses to load messages and to send an email after explicit confirmation. The app does not automatically send emails or read messages without the user initiating that action.",
        "Voice commands and meeting transcripts are used to interpret user intent and produce summaries, action items, and draft emails.",
        "The application uses the public Google Gemini API to parse voice commands and summarize content. The code sends the user prompt text to Gemini and expects a structured JSON response for app actions."
      ]
    },
    {
      title: "Data Storage and Security",
      content: [
        "By default, VoiceMate stores app data in the local JSON file server/data/db.json. If MONGODB_URI is configured, the same data is stored in MongoDB instead. Database connections and record storage are handled by the server-side logic in server/store.js.",
        "The app does not currently implement end-to-end encryption, user-specific encryption keys, or server-side session cookies for application login. The Gmail OAuth token is kept in memory for the current server session and is not written to the local database by default. The OAuth callback also validates a random state value to reduce CSRF risk.",
        "The application is designed for a single-user or local demo workflow, and security controls are limited accordingly. Users should not store sensitive personal or financial data that they would not be comfortable keeping in a local JSON file or a configured MongoDB database."
      ]
    },
    {
      title: "Cookies and Session Management",
      content: [
        "VoiceMate does not currently set application cookies for user authentication or session management. The backend creates a temporary OAuth state map for Google callback validation, but it does not issue persistent login cookies or a user session object.",
        "The Gmail connection is managed in memory on the server during the active process. The app also uses browser-side React state to manage the current page and form entries. There are no persistent cookie-based login sessions implemented in the current codebase."
      ]
    },
    {
      title: "Third-Party Services",
      content: [
        "VoiceMate relies on the following third-party services: Google OAuth for Gmail sign-in and consent, Google Gmail API for reading message metadata and sending emails, and Google Gemini for intent parsing and summarization.",
        "These services are used strictly to deliver the features implemented in the codebase. VoiceMate does not currently include advertising networks, analytics trackers, or third-party marketing tools.",
        "When using Google services, Google’s own terms and privacy practices apply to the data exchanged with those services."
      ]
    },
    {
      title: "Data Sharing and Disclosure",
      content: [
        "VoiceMate does not currently sell or rent personal data. In the current implementation, data is primarily shared only with the services required to operate the app: Google for OAuth and Gmail access, and Gemini for prompt processing.",
        "The application stores personal productivity data in the local JSON database or MongoDB for the user’s active workflow. There is no current implementation for public sharing, admin dashboards, or access by other users.",
        "VoiceMate may disclose data if required by law, court order, or other valid legal process, or if necessary to protect the security and integrity of the service."
      ]
    },
    {
      title: "Data Retention",
      content: [
        "The application retains user-generated records until you delete them from the app, or until the local storage file is cleared. There is no automated deletion workflow in the current codebase beyond deleting records through the app’s delete actions.",
        "Gmail OAuth tokens are kept in memory during the active server lifetime and are not stored in the application’s database. If the server restarts, the Gmail connection must be re-established.",
        "Data retention is therefore dependent on the local data file, configured MongoDB instance, and the server lifecycle."
      ]
    },
    {
      title: "User Rights and Account Deletion",
      content: [
        "The current application does not implement a classic login system or dedicated user account profile. Data is stored as records associated with the app’s local or MongoDB data store, and records can be removed from the app using the delete or clear actions available in the interface.",
        "If you want to remove your stored content, you can delete individual tasks, notes, events, and expense records from the app, or clear a collection via the application’s management flow. If you disconnect Gmail, the in-memory token is removed from the server process and the app no longer has active Gmail authorization.",
        "For privacy requests or questions about stored data, contact the support email listed below."
      ]
    },
    {
      title: "Children's Privacy",
      content: [
        "VoiceMate is not directed at children under the age of 13, and the app does not intentionally collect personal data from children. The current application is a productivity tool for adult or authorized users working with their own data."
      ]
    },
    {
      title: "Changes to This Privacy Policy",
      content: [
        "VoiceMate may update this Privacy Policy from time to time to reflect functional changes, service integrations, and compliance requirements. Any material updates will be reflected in the live policy page and the effective date at the top of this document."
      ]
    },
    {
      title: "Contact Information",
      content: [
        "If you have questions, requests, or concerns about this Privacy Policy or the app’s data practices, please contact us at support@voicemate.app."
      ]
    }
  ] : [
    {
      title: "Introduction and Acceptance of Terms",
      content: [
        "These Terms of Service govern your use of VoiceMate, a productivity application that helps users manage tasks, expenses, notes, calendar events, meeting summaries, and Gmail workflows. By using the app, you agree to these terms.",
        "If you do not agree with these terms, do not access or use the VoiceMate application."
      ]
    },
    {
      title: "Eligibility",
      content: [
        "You must be at least 13 years old and able to enter into a legally binding agreement to use VoiceMate. If you are using the app on behalf of an organization or another person, you represent that you have the authority to bind that person or organization to these terms."
      ]
    },
    {
      title: "User Accounts and Authentication",
      content: [
        "The current implementation does not create a separate app-specific user account, password, or profile system. Instead, users may connect their own Google account for Gmail integration using Google OAuth. This connection is used only to read inbox metadata and send a message after explicit confirmation.",
        "You are responsible for maintaining the confidentiality of your Google account access and for using only Google accounts that you control. If your Google OAuth connection is compromised, the app may be unable to complete Gmail actions until you reconnect or revoke access through Google."
      ]
    },
    {
      title: "Acceptable Use",
      content: [
        "You agree to use VoiceMate only for lawful and legitimate productivity purposes. You may use the app to manage your own tasks, meetings, notes, and email drafts in line with your personal or business workflows.",
        "You may not use the service to store or transmit harmful, illegal, defamatory, abusive, or deceptive content. You may not attempt to break the app, bypass access restrictions, or interfere with other users’ access to the service."
      ]
    },
    {
      title: "Prohibited Activities",
      content: [
        "The following activities are prohibited: using the app for spam or mass unsolicited email campaigns, impersonating another person, infringing copyright or other intellectual property rights, accessing or attempting to access data not related to your own workflow, or misusing API credentials or Google permissions.",
        "You may not submit malicious input designed to disrupt applications, compromise data, or abuse the Gemini or Gmail integrations."
      ]
    },
    {
      title: "User Responsibilities",
      content: [
        "You are responsible for the accuracy, completeness, and legality of the information you enter into VoiceMate. You are also responsible for reviewing summaries, meeting notes, tasks, and email drafts before sending them or relying on them for decisions.",
        "If you connect Gmail, you are responsible for verifying recipients, content, and permissions before sending any message. The app prompts for confirmation before sending emails and should be treated as a helper, not a substitute for user review."
      ]
    },
    {
      title: "Intellectual Property",
      content: [
        "VoiceMate and its software, interface, branding, text, styling, and functionality are owned by the project owner or the applicable rights holder. The app remains the intellectual property of its creators unless otherwise stated.",
        "You retain ownership of the data you input into the app, such as notes, tasks, expenses, and email drafts. However, by using the service, you grant us the right to process that data as necessary to provide the features of VoiceMate, subject to this Privacy Policy and applicable laws."
      ]
    },
    {
      title: "Third-Party Services",
      content: [
        "VoiceMate depends on third-party services, including Google OAuth, the Gmail API, and the Google Gemini API. Your use of those services is subject to their respective terms, service policies, and privacy practices. We are not responsible for the actions, outages, or data handling of those providers beyond the direct service features implemented in VoiceMate."
      ]
    },
    {
      title: "Service Availability and Limitations",
      content: [
        "VoiceMate is provided on an as-is basis. We do not guarantee continuous availability, uninterrupted service, or error-free operation. Features may be unavailable due to network issues, provider outages, API limits, configuration problems, or maintenance windows.",
        "If Google OAuth or Gemini configuration is not present or active, the corresponding features may not work. The app may also behave differently depending on browser microphone access, Google account permissions, and API availability."
      ]
    },
    {
      title: "Account Suspension and Termination",
      content: [
        "We may suspend or terminate access to VoiceMate or particular features if we reasonably believe you are violating these terms, using the service in a harmful way, abusing connected third-party services, or creating security or legal risk for the application or its users.",
        "In such cases, we may disable access to Gmail features, delete or block records, or stop service availability as needed to protect the platform."
      ]
    },
    {
      title: "Disclaimer of Warranties",
      content: [
        "VoiceMate is provided without warranties of any kind, whether express, implied, or statutory. We do not warrant that the service will be accurate, timely, secure, complete, or fit for a particular purpose.",
        "Any reliance you place on task recommendations, summaries, action items, email drafts, or calendar suggestions is at your own risk."
      ]
    },
    {
      title: "Limitation of Liability",
      content: [
        "To the extent permitted by law, VoiceMate and its operators shall not be liable for indirect, incidental, consequential, punitive, or special damages arising from the use or inability to use the service, including loss of data, missed deadlines, business interruption, or third-party service failures.",
        "Our total liability arising from these terms or your use of the service shall not exceed the amount paid for the service, or zero if the service is free."
      ]
    },
    {
      title: "Changes to These Terms",
      content: [
        "We may update these Terms of Service from time to time to reflect new features, legal requirements, or changes in how the service operates. The effective date at the top of this page will reflect the latest revision. Continued use of VoiceMate after an update means you accept the revised terms."
      ]
    },
    {
      title: "Contact Information",
      content: [
        "For legal notices, product support, or questions about these Terms of Service, contact support@voicemate.app."
      ]
    }
  ];

  return (
    <div className="legal-page">
      <div className="legal-shell">
        <header className="legal-header">
          <div className="brand legal-brand">
            <div className="logo">V</div>
            <div>
              <b>VoiceMate</b>
              <small>VOICE TO ACTION</small>
            </div>
          </div>
          <div className="legal-actions">
            <button className="ghost" onClick={onBack}>Back to app</button>
          </div>
        </header>

        <div className="legal-card">
          <div className="legal-badge">{isPrivacy ? "Privacy Policy" : "Terms of Service"}</div>
          <h1>{isPrivacy ? "Privacy Policy" : "Terms of Service"}</h1>
          <p className="legal-meta">Effective date: November 7, 2026</p>

          {sections.map((section) => (
            <section className="legal-section" key={section.title}>
              <h2>{section.title}</h2>
              {section.content.map((paragraph, index) => (
                <p key={`${section.title}-${index}`}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [route, setRoute] = useState(() => (typeof window !== "undefined" ? window.location.pathname : "/"));
  const [data,setData] = useState(blank), [tab,setTab] = useState("Overview"), [status,setStatus] = useState("Loading…");
  const [command,setCommand] = useState(""), [busy,setBusy] = useState(false), [toast,setToast] = useState("");
  const [expense,setExpense] = useState({ amount:"",category:"Food",description:"",date:today() });
  const [task,setTask] = useState({ title:"",dueDate:today(),dueTime:"",priority:"Medium" });
  const [event,setEvent] = useState({ title:"",date:today(),time:"",endTime:"",type:"Meeting" });
  const [note,setNote] = useState({ title:"",content:"" });
  const [transcript,setTranscript] = useState(""), [meeting,setMeeting] = useState(null);
  const [email,setEmail] = useState({to:"",subject:"",body:""}), [messages,setMessages] = useState([]);
  const [gmail,setGmail] = useState({connected:false,configured:false}), [summary,setSummary] = useState("");
  const recognitionRef = useRef(null);
  const [listening,setListening] = useState(false);
  const [calendarConflictPrompt,setCalendarConflictPrompt] = useState(null);

  const goToRoute = (nextPath) => {
    if (typeof window === "undefined") return;
    const safePath = nextPath && nextPath.startsWith("/") ? nextPath : "/";
    if (window.location.pathname !== safePath) {
      window.history.pushState({}, "", safePath);
    }
    setRoute(safePath);
  };

  useEffect(() => {
    const onRouteChange = () => setRoute(window.location.pathname || "/");
    window.addEventListener("popstate", onRouteChange);
    return () => window.removeEventListener("popstate", onRouteChange);
  }, []);

  const refresh = async () => {
    const d = await api("/api/data"); setData({ ...blank, ...d });
  };
  useEffect(() => {
    (async()=>{ try { const h=await api("/api/health"); await refresh(); setStatus(`${h.storage} storage · ${h.geminiConfigured?"Gemini ready":"Gemini key missing"}`); const g=await api("/api/gmail/status"); setGmail(g); } catch(e){setStatus(e.message);} })();
    if (new URLSearchParams(location.search).get("gmail")==="connected") { history.replaceState({}, "", "/"); setToast("Gmail connected successfully."); }
  },[]);
  useEffect(() => {
    const due = new Set();
    const timer = setInterval(() => {
      const now = new Date();
      data.tasks.filter(t=>!t.done && t.dueDate===today() && t.dueTime).forEach(t=>{
        const d = new Date(`${t.dueDate}T${t.dueTime}`);
        const key = t.id + d.toISOString();
        if (d-now <= 60000 && d-now >= -15000 && !due.has(key)) { due.add(key); notify(`Task reminder: ${t.title}`); }
      });
      data.calendar.filter(e=>e.date===today() && e.time).forEach(e=>{
        const d = new Date(`${e.date}T${e.time}`), key=e.id+d.toISOString();
        if (d-now<=60000 && d-now>=-15000 && !due.has(key)) { due.add(key); notify(`Upcoming: ${e.title}`); }
      });
    },15000);
    return ()=>clearInterval(timer);
  },[data]);
  function notify(msg) {
    setToast(msg); speak(msg);
    if ("Notification" in window && Notification.permission==="granted") new Notification("VoiceMate", {body:msg});
  }
  async function save(collection,item,allowConflict=false) {
    const suffix = collection === "calendar" && allowConflict ? "?allowConflict=true" : "";
    const saved = await api(`/api/${collection}${suffix}`,{method:"POST",body:JSON.stringify(item)});
    await refresh(); return saved;
  }
  function openCalendarConflict(item, conflicts, origin="voice", updateId=null) {
    setCalendarConflictPrompt({ item, conflicts: conflicts || [], origin, updateId });
  }
  async function persistCalendarChoice(item, allowConflict, updateId=null) {
    if (updateId) {
      const suffix = allowConflict ? "?allowConflict=true" : "";
      const saved = await api(`/api/calendar/${encodeURIComponent(updateId)}${suffix}`, { method:"PUT", body:JSON.stringify(item) });
      await refresh(); return saved;
    }
    return save("calendar", item, allowConflict);
  }
  async function confirmCalendarChoice(choice) {
    if (!calendarConflictPrompt) return;
    const { item, origin, updateId } = calendarConflictPrompt;
    if (choice === "cancel") { setCalendarConflictPrompt(null); setToast("New calendar event cancelled. Existing events were not changed."); return; }
    if (choice === "reschedule") {
      setCalendarConflictPrompt(null);
      const nextTime = window.prompt("Choose a new start time (24-hour HH:mm, for example 19:00):", item.time || "");
      if (!nextTime) return;
      const nextEnd = item.endTime ? window.prompt("Choose a new end time (24-hour HH:mm):", item.endTime) : "";
      if (item.endTime && !nextEnd) return;
      const revised = { ...item, time: nextTime, ...(item.endTime ? { endTime: nextEnd } : {}) };
      try { await persistCalendarChoice(revised, false, updateId); setCommand(""); setToast("Calendar event saved at the new time."); }
      catch (e) { if (e.status === 409) openCalendarConflict(revised, e.data?.conflicts, origin, updateId); else setToast(e.message); }
      return;
    }
    try { await persistCalendarChoice(item, true, updateId); setCalendarConflictPrompt(null); setCommand(""); if (origin === "manual") setEvent(prev=>({...prev,title:""})); setToast("Event saved. Existing conflicting events were kept."); speak("Event saved. Existing events were kept."); }
    catch (e) { setToast(e.message); }
  }
  async function removeItem(collection,id) { await api(`/api/${collection}/${id}`,{method:"DELETE"}); await refresh(); }
  async function editItem(collection,item) {
    const fields = {
      expenses: ["description","amount","category","date"],
      tasks: ["title","priority","dueDate","dueTime"],
      calendar: ["title","date","time","endTime","type"],
      notes: ["title","content"],
      meetings: ["title","summary","emailSubject","emailBody","actionItems"]
    }[collection];
    const updated = { ...item };
    for (const field of fields) {
      const current = field === "actionItems" ? JSON.stringify(item[field] || [], null, 2) : String(item[field] ?? "");
      const value = window.prompt(`Edit ${field} (Cancel to stop):`, current);
      if (value === null) return;
      if (field === "actionItems") {
        try { updated[field] = JSON.parse(value); }
        catch { setToast("Action items must be valid JSON. No changes saved."); return; }
      } else if (field === "amount") updated[field] = Number(value);
      else updated[field] = value;
    }
    try {
      await api(`/api/${collection}/${encodeURIComponent(item.id)}`, { method:"PUT", body:JSON.stringify(updated) });
      await refresh();
      if (collection === "meetings") setMeeting(updated);
      setToast("Item updated successfully.");
    } catch (e) { setToast(e.message); }
  }
  async function updateFromVoice(collection, matchQuery, updates) {
    const rows = data[collection] || [];
    const q = String(matchQuery || "").trim().toLowerCase();
    if (!q) throw new Error("I couldn't identify which existing item to update. Mention its saved title or description.");
    const normalize = value => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
    const searchable = item => normalize([item.title,item.description,item.content,item.category,item.name].filter(Boolean).join(" "));
    const nq = normalize(q);
    let matches = rows.filter(item => searchable(item).includes(nq) || (searchable(item).length >= 3 && nq.includes(searchable(item))));
    if (!matches.length) {
      const terms = nq.split(" ").filter(x=>x.length>1);
      const scored = rows.map(item => { const hay=searchable(item); return {item, score:terms.filter(term=>hay.includes(term)).length}; }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
      if (scored.length) { const top=scored[0].score; matches=scored.filter(x=>x.score===top).map(x=>x.item); }
    }
    if (matches.length !== 1) {
      if (matches.length > 1) throw new Error(`I found ${matches.length} matching ${collection} records. Please specify a more distinctive saved title or description.`);
      throw new Error(`I couldn't find an existing ${collection.slice(0,-1)} matching "${matchQuery}". No changes were made.`);
    }
    const normalizedUpdates = { ...updates };
    if (collection === "expenses" && normalizedUpdates.amount !== undefined) normalizedUpdates.amount = Number(normalizedUpdates.amount);
    if (collection === "tasks" && normalizedUpdates.dueDate === "today") normalizedUpdates.dueDate = today();
    if (collection === "tasks" && normalizedUpdates.dueTime) normalizedUpdates.dueTime = normalizeVoiceTime(normalizedUpdates.dueTime);
    if (!Object.keys(normalizedUpdates).length) throw new Error("I couldn't identify any fields to update. No changes were made.");
    let saved;
    try { saved = await api(`/api/${collection}/${encodeURIComponent(matches[0].id)}`, { method:"PUT", body:JSON.stringify(normalizedUpdates) }); }
    catch (e) {
      if (collection === "calendar" && e.status === 409) {
        openCalendarConflict({ ...matches[0], ...normalizedUpdates }, e.data?.conflicts, "voice", matches[0].id);
        const handled = new Error("Calendar conflict detected. Choose how to continue."); handled.handledCalendarConflict = true; throw handled;
      }
      throw e;
    }
    await refresh();
    if (collection === "meetings") setMeeting(saved);
    return saved;
  }
  function normalizeVoiceTime(value) {
    const text=String(value).trim().toLowerCase();
    const m=text.match(/^(\d{1,2}):(\d{2})(?:\s*(am|pm))?$/);
    if (!m) return value;
    let h=Number(m[1]); if (m[3]) h=(h%12)+(m[3]==="pm"?12:0);
    return `${String(h).padStart(2,"0")}:${m[2]}`;
  }
  async function toggleTask(t) { await save("tasks",{...t,done:!t.done}); }
  function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setToast("Speech recognition is not supported in this browser. Try Chrome."); return; }
    const rec = new SR(); rec.lang="en-IN"; rec.interimResults=false; rec.maxAlternatives=1;
    rec.onresult=e=>{ const text=e.results[0][0].transcript; setCommand(text); runCommand(text); };
    rec.onerror=e=>setToast(`Microphone error: ${e.error}`);
    rec.onend=()=>setListening(false); recognitionRef.current=rec; setListening(true); rec.start();
  }
  async function runCommand(text=command) {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const r=await api("/api/command",{method:"POST",body:JSON.stringify({utterance:text,localDate:today()})});
      const d=r.data||{};
      switch(r.intent) {
        case "add_expense": await save("expenses",{...d,amount:Number(d.amount),date:d.date||today()}); break;
        case "add_task": await save("tasks",{...d,done:false}); break;
        case "create_calendar_event":
          try { await save("calendar",d); }
          catch (e) { if (e.status === 409) { openCalendarConflict(d,e.data?.conflicts,"voice"); throw { ...e, handledCalendarConflict:true }; } throw e; }
          break;
        case "add_note": await save("notes",{...d,createdAt:new Date().toISOString()}); break;
        case "update_expense": await updateFromVoice("expenses",d.matchQuery,d.updates||{}); break;
        case "update_task": await updateFromVoice("tasks",d.matchQuery,d.updates||{}); break;
        case "update_calendar_event": await updateFromVoice("calendar",d.matchQuery,d.updates||{}); break;
        case "update_note": await updateFromVoice("notes",d.matchQuery,d.updates||{}); break;
        case "update_meeting": await updateFromVoice("meetings",d.matchQuery,d.updates||{}); break;
        case "draft_email":
          setEmail({to:d.to||"",subject:d.subject||"",body:d.body||""});
          setTab("Gmail");
          break;
        case "list_tasks": setTab("Tasks"); break;
        case "list_expenses": setTab("Expenses"); break;
        case "daily_briefing": setTab("Overview"); break;
        case "expense_insight": setTab("Reports"); break;
        case "productivity_insight": setTab("Reports"); break;
        default: break;
      }
      const responseText = r.intent==="draft_email"
        ? (r.spokenResponse || "I've prepared your email draft. Please review it in Gmail and confirm before sending.")
        : (r.spokenResponse||"Done.");
      setCommand("");
      if (r.intent !== "unsupported") { setToast(responseText); speak(responseText); } else { setToast(responseText); speak(responseText); }
    } catch(e){
      if (e.handledCalendarConflict) { setToast("Calendar conflict detected. Choose how to continue."); }
      else { setToast(e.message); speak(e.message); }
    }
    finally {setBusy(false);}
  }
  async function addExpense(e){e.preventDefault(); await save("expenses",{...expense,amount:Number(expense.amount)}); setExpense({...expense,amount:"",description:""}); setToast("Expense saved.");}
  async function addTask(e){e.preventDefault(); await save("tasks",{...task,done:false}); setTask({...task,title:""}); setToast("Task saved.");}
  async function addEvent(e){e.preventDefault(); try { await save("calendar",event); setEvent({...event,title:""}); setToast("Calendar event saved."); } catch(err) { if (err.status===409) openCalendarConflict(event,err.data?.conflicts,"manual"); else setToast(err.message); }}
  async function addNote(e){e.preventDefault(); await save("notes",{...note,createdAt:new Date().toISOString()}); setNote({title:"",content:""}); setToast("Voice note saved.");}
  async function processMeeting() {
    setBusy(true); try { const r=await api("/api/meetings/process",{method:"POST",body:JSON.stringify({transcript})}); setMeeting({...r,id:r.meetingId}); setEmail(prev=>({...prev,subject:r.emailSubject||`Follow-up: ${r.title||"Meeting"} – Action Items`,body:r.emailBody||""})); await refresh(); setToast("Meeting processed. Review the action items and email draft."); }
    catch(e){setToast(e.message);} finally{setBusy(false);}
  }
  async function createTasksFromMeeting() {
    if (!meeting) return;
    for (const item of meeting.actionItems||[]) await save("tasks",{title:item.title,dueDate:item.dueDate||"",priority:item.priority||"Medium",done:false});
    setToast("Meeting action items added to Tasks.");
  }
  async function connectGmail(){ location.href="/auth/google"; }
  async function loadMessages(){try{const r=await api("/api/gmail/messages");setMessages(r.messages||[]);}catch(e){setToast(e.message);}}
  async function sendEmail(){if(!window.confirm(`Send this email to ${email.to}?`))return;try{await api("/api/gmail/send",{method:"POST",body:JSON.stringify({...email,confirmed:true})});setToast("Email sent.");setEmail({to:"",subject:"",body:""});}catch(e){setToast(e.message);}}
  async function summarize(text,kind="note"){try{const r=await api("/api/summarize",{method:"POST",body:JSON.stringify({text,kind})});setSummary(r.summary);}catch(e){setToast(e.message);}}
  const total = data.expenses.reduce((s,x)=>s+Number(x.amount||0),0);
  const pending = data.tasks.filter(t=>!t.done).length;
  const todayEvents = data.calendar.filter(e=>e.date===today()).length;
  const categoryTotals = useMemo(()=>data.expenses.reduce((a,x)=>{a[x.category||"Other"]=(a[x.category||"Other"]||0)+Number(x.amount||0);return a;},{}),[data.expenses]);
  const briefing = `You have ${pending} pending tasks, ${todayEvents} calendar items today, and ${money(total)} in recorded expenses overall.`;
  const tabs=["Overview","Expenses","Tasks","Meetings","Gmail","Calendar","Voice Notes","Reports"];

  if (route === "/privacy" || route === "/terms") {
    return <LegalPage type={route === "/privacy" ? "privacy" : "terms"} onBack={() => goToRoute("/")} />;
  }

  return <div className="app">
    <aside className="sidebar"><div className="brand"><div className="logo">V</div><div><b>VoiceMate</b><small>VOICE TO ACTION</small></div></div>
      <nav>{tabs.map(t=><button key={t} className={tab===t?"active":""} onClick={()=>setTab(t)}><span>{({Overview:"◫",Expenses:"₹",Tasks:"✓",Meetings:"◉",Gmail:"✉",Calendar:"▦","Voice Notes":"♫",Reports:"▤"})[t]}</span>{t}</button>)}</nav>
      <div className="legal-links">
        <button className="textlegal" onClick={()=>goToRoute("/privacy")}>Privacy Policy</button>
        <button className="textlegal" onClick={()=>goToRoute("/terms")}>Terms of Service</button>
      </div>
      <div className="sidefoot"><span className="pulse"></span>{status}</div>
    </aside>
    <main className="main">
      <header><div><div className="eyebrow">YOUR VOICE-POWERED WORKSPACE</div><h1>{tab}</h1></div><div className="header-actions"><button className="ghost" onClick={()=>{if("Notification"in window)Notification.requestPermission().then(p=>setToast(`Notifications: ${p}`));}}>Enable notifications</button><div className="avatar">VM</div></div></header>
      {toast&&<div className="toast" onClick={()=>setToast("")}>{toast}<button>×</button></div>}
      <section className="voicebar"><div className="mic">{listening?"◉":"🎙"}</div><div className="voiceinput"><b>Talk to VoiceMate</b><small>Try: “Add 250 rupees for lunch”, “Remind me to submit the report tomorrow”, or “Schedule a meeting at 3 PM”.</small><input value={command} onChange={e=>setCommand(e.target.value)} onKeyDown={e=>e.key==="Enter"&&runCommand()} placeholder="Type a supported action or use the microphone…" /></div><button className="micbtn" onClick={startVoice} disabled={listening}>{listening?"Listening…":"Start speaking"}</button><button className="primary" onClick={()=>runCommand()} disabled={busy}>{busy?"Working…":"Run command"}</button></section>

      {tab==="Overview"&&<><div className="grid stats"><Stat label="Total expenses" value={money(total)} hint="All recorded expenses"/><Stat label="Pending tasks" value={pending} hint="Tasks not completed"/><Stat label="Today's schedule" value={todayEvents} hint="Calendar entries today"/><Stat label="Voice notes" value={data.notes.length} hint="Saved notes"/></div>
        <div className="grid two"><div className="panel"><PanelTitle title="Daily briefing" sub="A quick snapshot of your day"/><p className="brief">{briefing}</p><button className="primary" onClick={()=>{speak(briefing);setToast("Playing your daily briefing.");}}>▶ Hear briefing</button></div><div className="panel"><PanelTitle title="Upcoming schedule" sub="Your next calendar items"/>{data.calendar.filter(x=>x.date>=today()).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,4).map(x=><div className="lineitem" key={x.id}><div className="datebox">{x.date?.slice(8,10)}<small>{x.date?.slice(5,7)}</small></div><div><b>{x.title}</b><small>{x.date} · {x.time||"Time not set"}</small></div></div>)}{!data.calendar.length&&<Empty text="No calendar entries yet. Add one using voice or Calendar."/>}</div></div>
        <div className="panel"><PanelTitle title="Priority tasks" sub="What needs your attention"/><Items items={data.tasks.filter(t=>!t.done).slice(0,5)} onDelete={id=>removeItem("tasks",id)} onToggle={toggleTask} onEdit={t=>editItem("tasks",t)}/></div></>}

      {tab==="Expenses"&&<div className="grid two"><div className="panel"><PanelTitle title="Add an expense" sub="Record manually or use the voice bar above"/><form onSubmit={addExpense}><Field label="Amount (₹)"><input type="number" min="1" required value={expense.amount} onChange={e=>setExpense({...expense,amount:e.target.value})}/></Field><Field label="Category"><select value={expense.category} onChange={e=>setExpense({...expense,category:e.target.value})}>{["Food","Travel","Shopping","Education","Bills","Health","Other"].map(x=><option>{x}</option>)}</select></Field><Field label="Description"><input value={expense.description} onChange={e=>setExpense({...expense,description:e.target.value})} placeholder="Lunch, cab, books…"/></Field><Field label="Date"><input type="date" value={expense.date} onChange={e=>setExpense({...expense,date:e.target.value})}/></Field><button className="primary">Save expense</button></form></div><div className="panel"><PanelTitle title="Spending overview" sub="Category-wise recorded spending"/><h2 className="bigmoney">{money(total)}</h2>{Object.entries(categoryTotals).map(([k,v])=><div className="barrow" key={k}><span>{k}</span><div className="bar"><i style={{width:`${total?Math.max(2,v/total*100):0}%`}}/></div><b>{money(v)}</b></div>)}</div><div className="panel full"><PanelTitle title="Recent expenses" sub="Your expense history"/><table><thead><tr><th>Description</th><th>Category</th><th>Date</th><th>Amount</th><th/></tr></thead><tbody>{data.expenses.map(x=><tr key={x.id}><td>{x.description||"Expense"}</td><td>{x.category}</td><td>{x.date}</td><td>{money(x.amount)}</td><td><button className="textbtn" onClick={()=>editItem("expenses",x)}>Edit</button> <button className="textbtn" onClick={()=>removeItem("expenses",x.id)}>Delete</button></td></tr>)}</tbody></table>{!data.expenses.length&&<Empty text="No expenses recorded yet."/ >}</div></div>}

      {tab==="Tasks"&&<div className="grid two"><div className="panel"><PanelTitle title="Create a task" sub="Set a due date and priority"/><form onSubmit={addTask}><Field label="Task title"><input required value={task.title} onChange={e=>setTask({...task,title:e.target.value})} placeholder="Submit assignment"/></Field><Field label="Due date"><input type="date" value={task.dueDate} onChange={e=>setTask({...task,dueDate:e.target.value})}/></Field><Field label="Due time"><input type="time" value={task.dueTime} onChange={e=>setTask({...task,dueTime:e.target.value})}/></Field><Field label="Priority"><select value={task.priority} onChange={e=>setTask({...task,priority:e.target.value})}>{["Low","Medium","High"].map(x=><option>{x}</option>)}</select></Field><button className="primary">Add task</button></form></div><div className="panel"><PanelTitle title="Task list" sub={`${pending} pending`}/><Items items={data.tasks} onDelete={id=>removeItem("tasks",id)} onToggle={toggleTask} onEdit={t=>editItem("tasks",t)}/></div></div>}

      {tab==="Meetings"&&<div className="grid two"><div className="panel"><PanelTitle title="Meeting recorder & transcript" sub="Use dictation or paste a transcript to extract actions"/><textarea rows="13" value={transcript} onChange={e=>setTranscript(e.target.value)} placeholder="Paste meeting transcript here, or use the Dictate button…"/><div className="actions"><button className="ghost" onClick={()=>dictate(setTranscript,setToast)}>🎙 Dictate transcript</button><button className="primary" disabled={busy} onClick={processMeeting}>{busy?"Processing…":"Extract action items"}</button></div></div><div className="panel"><PanelTitle title="Meeting output" sub="AI-generated summary, action items and email draft"/>{meeting?<><h3>{meeting.title}</h3><p>{meeting.summary}</p><button className="textbtn" onClick={()=>editItem("meetings",meeting)}>Edit meeting output</button><h4>Action items</h4>{(meeting.actionItems||[]).map((x,i)=><div className="meetingaction" key={i}><b>{x.title}</b><small>{x.owner} · {x.dueDate||"No due date"} · {x.priority}</small></div>)}<button className="primary" onClick={createTasksFromMeeting}>Add action items to tasks</button><hr/><h4>Email follow-up draft</h4><Field label="Subject"><input value={email.subject || meeting.emailSubject || `Follow-up: ${meeting.title} – Action Items`} onChange={e=>setEmail({...email,subject:e.target.value})}/></Field><textarea rows="5" value={email.body||meeting.emailBody} onChange={e=>setEmail({...email,body:e.target.value})}/><button className="ghost" onClick={()=>{setTab("Gmail");setEmail({...email,subject:email.subject||meeting.emailSubject||`Follow-up: ${meeting.title} – Action Items`,body:email.body||meeting.emailBody});}}>Continue in Gmail</button></>:<Empty text="Your processed meeting summary and action items will appear here."/>}</div></div>}

      {tab==="Gmail"&&<div className="grid two"><div className="panel"><PanelTitle title="Gmail connection" sub="Connect your own Google account using OAuth"/><p className="muted">VoiceMate never asks for your Google password. Google handles sign-in and consent.</p><div className="statusrow"><span className={gmail.connected?"good":"warn"}>{gmail.connected?"Connected":"Not connected"}</span><button className="primary" onClick={connectGmail} disabled={!gmail.configured}>{gmail.connected?"Reconnect Gmail":"Connect Gmail"}</button></div>{!gmail.configured&&<p className="hint">To enable this feature, add Google OAuth Client ID and Client Secret to the server .env file. See README.</p>}<button className="ghost" onClick={loadMessages} disabled={!gmail.connected}>Load recent inbox messages</button>{messages.map(m=><div className="mailitem" key={m.id}><b>{m.subject}</b><small>{m.from} · {m.date}</small><p>{m.snippet}</p></div>)}</div><div className="panel"><PanelTitle title="Compose email" sub="Review the message and confirm before sending"/><form onSubmit={e=>{e.preventDefault();sendEmail();}}><Field label="To"><input type="email" required value={email.to} onChange={e=>setEmail({...email,to:e.target.value})}/></Field><Field label="Subject"><input required value={email.subject} onChange={e=>setEmail({...email,subject:e.target.value})}/></Field><Field label="Message"><textarea rows="9" required value={email.body} onChange={e=>setEmail({...email,body:e.target.value})}/></Field><button className="primary" disabled={!gmail.connected}>Review & send</button></form></div></div>}

      {tab==="Calendar"&&<div className="grid two"><div className="panel"><PanelTitle title="Add calendar entry" sub="Meetings, personal events and reminders"/><form onSubmit={addEvent}><Field label="Title"><input required value={event.title} onChange={e=>setEvent({...event,title:e.target.value})}/></Field><Field label="Date"><input type="date" value={event.date} onChange={e=>setEvent({...event,date:e.target.value})}/></Field><Field label="Start time"><input type="time" value={event.time} onChange={e=>setEvent({...event,time:e.target.value})}/></Field><Field label="End time"><input type="time" value={event.endTime} onChange={e=>setEvent({...event,endTime:e.target.value})}/></Field><Field label="Type"><select value={event.type} onChange={e=>setEvent({...event,type:e.target.value})}>{["Meeting","Personal","Other"].map(x=><option>{x}</option>)}</select></Field><button className="primary">Save calendar entry</button></form></div><div className="panel"><PanelTitle title="Schedule" sub="Upcoming calendar entries"/>{data.calendar.slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).map(x=><div className="lineitem" key={x.id}><div className="datebox">{x.date?.slice(8,10)}<small>{x.date?.slice(5,7)}</small></div><div className="grow"><b>{x.title}</b><small>{x.date} · {x.time||"No time"} {x.endTime?`– ${x.endTime}`:""} · {x.type}</small></div><button className="textbtn" onClick={()=>editItem("calendar",x)}>Edit</button><button className="textbtn" onClick={()=>removeItem("calendar",x.id)}>Delete</button></div>)}{!data.calendar.length&&<Empty text="No calendar entries yet."/>}</div></div>}

      {tab==="Voice Notes"&&<div className="grid two"><div className="panel"><PanelTitle title="Save a voice note" sub="Dictate a thought or type it manually"/><form onSubmit={addNote}><Field label="Title"><input value={note.title} onChange={e=>setNote({...note,title:e.target.value})} required/></Field><Field label="Note"><textarea rows="9" value={note.content} onChange={e=>setNote({...note,content:e.target.value})} required/></Field><div className="actions"><button type="button" className="ghost" onClick={()=>dictate(v=>setNote({...note,content:v}),setToast)}>🎙 Dictate</button><button className="primary">Save note</button></div></form></div><div className="panel"><PanelTitle title="Saved notes" sub="Your searchable notes"/>{data.notes.map(n=><div className="noteitem" key={n.id}><b>{n.title}</b><p>{n.content}</p><div className="actions"><button className="ghost" onClick={()=>summarize(n.content)}>Summarize</button><button className="textbtn" onClick={()=>editItem("notes",n)}>Edit</button><button className="textbtn" onClick={()=>removeItem("notes",n.id)}>Delete</button></div></div>)}{summary&&<div className="summary"><b>AI summary</b><p>{summary}</p></div>}{!data.notes.length&&<Empty text="No notes saved yet."/>}</div></div>}

      {tab==="Reports"&&<div className="grid two"><div className="panel"><PanelTitle title="Expense insights" sub="Category totals from your recorded data"/><h2 className="bigmoney">{money(total)}</h2>{Object.entries(categoryTotals).sort((a,b)=>b[1]-a[1]).map(([k,v])=><div className="barrow" key={k}><span>{k}</span><div className="bar"><i style={{width:`${total?Math.max(2,v/total*100):0}%`}}/></div><b>{money(v)}</b></div>)}<button className="ghost" onClick={()=>summarize(Object.entries(categoryTotals).map(([k,v])=>`${k}: ${v}`).join("\n"),"productivity")}>Generate AI spending insight</button></div><div className="panel"><PanelTitle title="Productivity report" sub="Tasks and calendar activity"/><div className="reportmetric"><b>{data.tasks.length}</b><span>Total tasks</span></div><div className="reportmetric"><b>{data.tasks.filter(t=>t.done).length}</b><span>Completed tasks</span></div><div className="reportmetric"><b>{data.calendar.length}</b><span>Calendar entries</span></div><div className="reportmetric"><b>{data.meetings.length}</b><span>Processed meetings</span></div><button className="ghost" onClick={()=>summarize(`Tasks: ${data.tasks.length}; completed: ${data.tasks.filter(t=>t.done).length}; pending: ${pending}; calendar entries: ${data.calendar.length}; meetings: ${data.meetings.length}. Expense totals: ${JSON.stringify(categoryTotals)}`,"productivity")}>Generate productivity insight</button>{summary&&<div className="summary"><p>{summary}</p></div>}</div></div>}
      {calendarConflictPrompt && <div className="modalbackdrop" role="dialog" aria-modal="true" aria-labelledby="conflict-title"><div className="conflictmodal"><div className="conflictheading"><span className="warningicon">!</span><div><h2 id="conflict-title">Calendar time conflict</h2><p>This event overlaps with {calendarConflictPrompt.conflicts.length} existing {calendarConflictPrompt.conflicts.length===1?"event":"events"}. Nothing has been changed yet.</p></div></div><div className="conflictnew"><b>New event: {calendarConflictPrompt.item.title || "Untitled event"}</b><small>{calendarConflictPrompt.item.date} · {calendarConflictPrompt.item.time || "Time not set"}{calendarConflictPrompt.item.endTime?`–${calendarConflictPrompt.item.endTime}`:""}</small></div><div className="conflictlist">{calendarConflictPrompt.conflicts.map((x,i)=><div className="conflictitem" key={x.id||i}><b>{x.title}</b><small>{x.date} · {x.time}{x.endTime?`–${x.endTime}`:""}</small></div>)}</div><p className="conflictnote">Existing events will never be deleted or changed automatically.</p><div className="conflictchoices"><button className="primary" onClick={()=>confirmCalendarChoice("keep")}>Add anyway</button><button className="ghost" onClick={()=>confirmCalendarChoice("reschedule")}>Choose another time</button><button className="textbtn" onClick={()=>confirmCalendarChoice("cancel")}>Cancel new event</button></div></div></div>}
    </main>
  </div>;
}
function dictate(onText,onError){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){onError("Speech recognition requires a supported browser such as Chrome.");return;}const r=new SR();r.lang="en-IN";r.onresult=e=>onText(e.results[0][0].transcript);r.onerror=e=>onError(e.error);r.start();}
function Stat({label,value,hint}){return <div className="panel stat"><small>{label}</small><strong>{value}</strong><span>{hint}</span></div>}
function PanelTitle({title,sub}){return <div className="paneltitle"><div><h2>{title}</h2><small>{sub}</small></div></div>}
function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}
function Empty({text}){return <div className="empty">{text}</div>}
function Items({items,onDelete,onToggle,onEdit}){return <div className="items">{items.map(t=><div className={`taskitem ${t.done?"done":""}`} key={t.id}><input type="checkbox" checked={!!t.done} onChange={()=>onToggle(t)}/><div className="grow"><b>{t.title}</b><small>{t.dueDate||"No due date"} {t.dueTime||""}</small></div><span className={`priority ${(t.priority||"Medium").toLowerCase()}`}>{t.priority||"Medium"}</span>{onEdit&&<button className="textbtn" onClick={()=>onEdit(t)}>Edit</button>}<button className="textbtn" onClick={()=>onDelete(t.id)}>Delete</button></div>)}{!items.length&&<Empty text="Nothing here yet."/>}</div>}
export default App;
