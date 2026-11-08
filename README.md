# VoiceMate – AI-Powered Voice Assistant

VoiceMate is an AI-powered personal productivity assistant that allows users to manage their daily activities using voice commands.

It combines speech recognition, AI-based intent understanding, and real-world actions to make everyday tasks easier.

## Features

- **Voice Commands:** Interact with the application using natural language.
- **Expense Tracker:** Add and manage daily expenses.
- **Task Manager:** Create, manage, and track tasks and reminders.
- **Smart Calendar:** Schedule events and detect time conflicts.
- **Meeting Assistant:** Generate meeting summaries, action items, and follow-up emails.
- **Gmail Integration:** Connect Gmail to manage emails.
- **Voice Notes:** Create and manage notes using voice commands.
- **Daily Briefing:** Get an overview of tasks and scheduled events.
- **Reports & Insights:** View expense and productivity information.

## Tech Stack

- Frontend: React.js, CSS
- Backend: Node.js, Express.js
- AI: Google Gemini API
- Speech Recognition: Web Speech API
- Speech Output: SpeechSynthesis API
- Database: JSON File Storage
- Email Integration: Gmail API, Google OAuth 2.0

## Installation and Setup

1. Clone the repository.

   `git clone YOUR_REPOSITORY_URL`

2. Navigate to the project directory.

   `cd VoiceMate`

3. Install dependencies.

   `npm install`

4. Create a `.env` file and configure the required API credentials using `.env.example`.

5. Start the application.

   `npm run dev`

6. Open `http://localhost:5173` in your browser.

Legal pages are available at `http://localhost:5173/privacy` and `http://localhost:5173/terms`.

## Environment Variables

Configure the following credentials in your `.env` file:

- `GEMINI_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `FRONTEND_URL` (optional; defaults to the current frontend origin)
- `PUBLIC_BASE_URL` / `APP_URL` (optional; used when the app is deployed behind Render, Vercel, or another reverse proxy)

For Gmail OAuth, the `GOOGLE_REDIRECT_URI` must exactly match the callback URL registered in your Google Cloud OAuth client. In production, use your deployed HTTPS callback such as:

`https://your-app.onrender.com/auth/google/callback`

For local development, the app will fall back to the current request host and default to `http://localhost:3000/auth/google/callback` when no deployment URL is configured.

The server also validates the OAuth `state` value during the callback to prevent CSRF / callback tampering.

## Note

Microphone access is required for voice commands. Gmail functionality requires Google OAuth configuration.

## Author

Developed as a Voice AI Hackathon project.
