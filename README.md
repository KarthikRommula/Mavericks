# TechLearn

> A multi-format e-learning platform built for BTech engineering students — combining study materials, courses, an AI-powered code playground, and voice-guided debugging in a single, dependency-free web app.

TechLearn is a fully client-side web application (plain HTML, CSS, and vanilla JavaScript) that brings together PDFs, video tutorials, an interactive coding environment, and Google Gemini AI assistance. All user data — accounts, saved code snippets, and learning progress — is stored locally in the browser via IndexedDB, so the app runs without a backend server.

## Features

- **AI-powered code playground** — Write and run code in an in-browser editor (CodeMirror) with support for JavaScript, Python, Java, C++, C#, HTML/CSS, PHP, Ruby, Go, Rust, and Swift.
- **Gemini AI assistant** — Ask questions, get concept explanations, request debugging help, and receive code-optimization suggestions powered by Google's Gemini API.
- **Voice assistance** — Voice-guided explanations and debugging using the browser's Speech Synthesis and Speech Recognition APIs.
- **Intelligent error detection** — Language-aware static checks (e.g. Python indentation analysis) enhanced with AI-driven error explanations.
- **User accounts & authentication** — Client-side sign-up, login, and session handling backed by IndexedDB.
- **Personal dashboard** — Track course progress, manage enrolled courses, and revisit saved code snippets.
- **Course catalog** — Browse engineering courses across Computer Science, Electrical Engineering, AI/ML, and more.
- **Responsive UI** — Mobile-friendly navigation and layout with a Poppins/Font Awesome design system.
- **PWA-ready** — Web manifest and full favicon/touch-icon set for installable, standalone use.

## Tech Stack

- **Languages:** HTML5, CSS3, JavaScript (ES6+, no framework)
- **Editor:** [CodeMirror 5.65.2](https://codemirror.net/) (via CDN) with the Dracula theme, bracket matching, code folding, linting, and autocomplete add-ons
- **AI:** Google Gemini API (`gemini-2.0-flash` via the Generative Language REST endpoint)
- **Storage:** Browser IndexedDB (`techLearnDB`) for users, code snippets, courses, and progress
- **Voice:** Web Speech API — `SpeechSynthesis` and `SpeechRecognition`
- **Styling/Icons:** Font Awesome 6.4.0, Google Fonts (Poppins)

There is no build step, package manager, or server-side component — the project ships as static files.

## How It Works

The app is a collection of static HTML pages that load a shared set of JavaScript modules. The modules are designed to layer cleanly on top of each other:

1. **`db.js`** initializes the IndexedDB database (`techLearnDB`) and exposes a global database/init-status interface that other modules wait on.
2. **`auth.js`** wires up login/sign-up modals and keeps the UI in sync with the current authentication state.
3. **`ai-integration.js`** sends user prompts (plus the current editor contents as context) to the Gemini API and renders the responses in a chat panel.
4. **`playground-core.js`** sets up the CodeMirror editor, language switching, and code execution UI.
5. **`error-detection.js`** runs language-specific checks and feeds findings to the AI for richer explanations.
6. **`voice-assistant.js`** adds speech synthesis (spoken answers) and speech recognition (voice input).
7. **`dashboard.js`** renders the authenticated user's progress and course management views.
8. **`script.js`** handles global site interactions (navigation, modals, shared UI behavior).

Because everything is client-side, opening the HTML files in a browser (ideally via a local static server) is enough to run the full experience.

## Project Structure

```
Mavericks/
├── index.html                 # Landing page (hero, features, course previews)
├── courses.html               # Course catalog
├── code-playground.html       # AI-powered code editor & assistant
├── dashboard.html             # User dashboard (progress & courses)
├── about.html                 # About / team / contact page
├── styles.css                 # Global site styles
├── script.js                  # Root-level shared script
├── site.webmanifest           # PWA manifest
├── favicon.ico, *.png         # Icons / touch icons
├── css/
│   ├── dashboard.css           # Dashboard-specific styles
│   └── playground-enhanced.css # Playground UI styles
└── js/
    ├── db.js                   # IndexedDB setup & data access
    ├── auth.js                 # Authentication & session UI
    ├── ai-integration.js       # Gemini AI chat integration
    ├── playground-core.js      # CodeMirror editor & execution
    ├── error-detection.js      # Language-aware error analysis
    ├── voice-assistant.js      # Web Speech API integration
    ├── dashboard.js            # Dashboard logic
    └── script.js               # Shared interactions
```

## Prerequisites

- A modern web browser (Chrome, Edge, or Firefox) with support for IndexedDB and the Web Speech API. Voice recognition relies on `webkitSpeechRecognition`, which is best supported in Chromium-based browsers.
- A Google Gemini API key to use the AI assistant features.
- (Recommended) A simple static file server to serve the pages, since the manifest/icon paths are root-relative.

## Configuration

The Gemini API integration is configured in `js/ai-integration.js`:

```js
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
const GEMINI_API_URL  = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
```

To use your own key, replace the `GEMINI_API_KEY` value with a key from [Google AI Studio](https://aistudio.google.com/).

> **Security note:** This is a front-end-only project, so the API key lives in client-side code and is visible to anyone who loads the page. Do not commit a production key. For any real deployment, proxy Gemini requests through a backend so the key is never exposed in the browser.

## Installation & Running Locally

Clone the repository:

```bash
git clone https://github.com/KarthikRommula/Mavericks.git
cd Mavericks
```

Since the app is purely static, serve the directory with any static file server. A few options:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (npx, no install)
npx serve .

# Using VS Code
# Right-click index.html → "Open with Live Server"
```

Then open `http://localhost:8000` (or the port your server reports) in your browser.

> Opening the HTML files directly via `file://` will mostly work, but a local server is recommended so that root-relative paths (icons, manifest) and browser APIs behave correctly.

## Usage

1. Open the landing page and create an account (sign-up) — data is stored locally in IndexedDB.
2. Browse courses from the **Courses** page.
3. Open the **Code Playground**, pick a language, and write code in the editor.
4. Use the AI assistant panel to ask questions, debug, or optimize your code; click the microphone for voice input and listen to spoken responses.
5. Visit the **Dashboard** to track progress and manage your courses.

## License

No license file is currently included in this repository.
