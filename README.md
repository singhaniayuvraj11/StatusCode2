# Firebase Studio
# ScholarAI

Status Code 2 | Organized by IIIT Kalyani

## Team Members
- Aryan Bhargava
- Jatin Kabra
- Yuvraj
- Arundhati
- Asmit

---

## Overview
ScholarAI is an AI-powered education and productivity platform for students, built with Next.js and Firebase. It offers tools for resume building, note generation, document summarization, and quiz creation—all in one place.

## Features
- **Resume Builder**: Create professional resumes with live preview and templates.
- **AI Note Generator**: Generate concise notes from text or audio using AI.
- **Document Summarizer**: Quickly summarize long documents and articles.
- **AI Quiz Creator**: Create custom quizzes from your study materials.

## Getting Started

### Prerequisites
- Node.js (v18 or above recommended)
- npm

### Installation
1. Clone the repository:
	```sh
	git clone <repo-url>
	cd studio-main
	```
2. Install dependencies:
	```sh
	npm install
	```

### Running Locally
Start the development server:
```sh
npx next dev -p 9004
```
Visit [http://localhost:9004](http://localhost:9004) in your browser.

### Build for Production
```sh
npm run build
npm start
```

## Project Structure
- `src/app/` - Main application pages and layouts
- `src/components/` - Reusable UI components
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility libraries (e.g., Firebase)
- `docs/` - Project documentation

## Authentication
Google authentication is enabled via Firebase. Click "Login with Google" on the landing page to sign in.

## License
This project is for educational purposes and was developed as part of Status Code 2, organized by IIIT Kalyani.

---

For any queries, contact the team members listed above.
This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.
