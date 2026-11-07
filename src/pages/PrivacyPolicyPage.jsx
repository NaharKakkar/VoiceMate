export default function PrivacyPolicyPage({ onBack }) {
  const sections = [
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
          <div className="legal-badge">Privacy Policy</div>
          <h1>Privacy Policy</h1>
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
