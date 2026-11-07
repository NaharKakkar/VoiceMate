export default function TermsOfServicePage({ onBack }) {
  const sections = [
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
          <div className="legal-badge">Terms of Service</div>
          <h1>Terms of Service</h1>
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
