
# ScholarAI

Status Code 2 | Organized by IIIT Kalyani

## Team Members
- Aryan Bhargava
- Jatin Kabra
- Yuvraj Singhania
- Asmit Saha
- Arundhati behera

---

## Overview
ScholarAI is an all-in-one platform for academic and career success, powered by cutting-edge AI. Built with Next.js and Firebase, it offers tools for resume building, note generation, document summarization, and quiz creation—all in one place. The site uses Firebase for user authentication and is deployed on Vercel for seamless hosting.


## Features
- **Resume Builder**: Craft professional resumes with intuitive templates and live preview.
- **AI Note Generator**: Generate structured, concise notes from text 
- **Document Summarizer**: Quickly summarize long documents and articles.
- **AI Quiz Creator**: Create customized quizzes from study materials to test knowledge.

---

## Mobile App
We also built a mobile app with similar functionality, so users can choose between the web or app version depending on their usability and preference.

**Tech Stack:**
- Kotlin
- Jetpack Compose
- Gemini API
- Koin (for dependency injection)

Both the web and mobile app provide the same core features for academic and career success.

## Technologies Used
- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Firebase (for login authentication)
- **Deployment**: Vercel

## Project Structure

### Folder & File Breakdown

- **src/**
	- **ai/**
		- `dev.js`, `genkit.js`: AI logic and integrations.
		- **flows/**
			- `create-quiz.js`: Logic for generating quizzes from study material.
			- `generate-notes.js`: AI-powered note generation.
			- `summarize-document.js`: Document summarization logic.
	- **app/**
		- `favicon.ico`, `globals.css`, `layout.jsx`, `page.jsx`: Global app assets and layout.
		- **(app)/**
			- `layout.jsx`: Layout for main app features.
			- **document-summarizer/**
				- `page.jsx`: Document summarizer feature page.
			- **note-generator/**
				- `page.jsx`: Note generator feature page.
			- **quiz-creator/**
				- `page.jsx`: Quiz creator feature page.
			- **resume-builder/**
				- `page.jsx`: Resume builder feature page.
		- **(auth)/**
			- `layout.jsx`: Layout for authentication pages.
			- **login/**
				- `page.jsx`: Login page.
			- **signup/**
				- `page.jsx`: Signup page.
	- **components/**
		- `app-sidebar.jsx`: Sidebar navigation for the app.
		- **ui/**: Reusable UI components (accordion, alert, button, card, dialog, form, input, label, menubar, popover, progress, radio-group, select, sidebar, skeleton, slider, switch, table, tabs, textarea, toast, toaster, tooltip, etc.).
	- **hooks/**
		- `use-auth.js`: Custom hook for authentication logic.
		- `use-mobile.jsx`: Hook for mobile responsiveness.
		- `use-toast.js`: Hook for toast notifications.
	- **lib/**
		- `firebase.js`: Firebase integration and configuration.
		- `utils.js`: General utility functions.

- **docs/**
	- `blueprint.md`: Project documentation and planning.

- **Configuration & Meta Files**
	- `apphosting.yaml`, `components.json`, `jsconfig.json`, `next.config.js`, `package.json`, `postcss.config.mjs`, `tailwind.config.js`, `README.md`

## Authentication
Google authentication is enabled via Firebase. Click "Login with Google" on the landing page to sign in.

## Setup Instructions
1. Clone the repository:
	```sh
	git clone <repository-url>
	cd StatusCode2
	```
2. Install dependencies:
	```sh
	npm install
	```
3. Set up Firebase:
	- Create a Firebase project and enable authentication.
	- Add your Firebase configuration to the project environment variables.
4. Running Locally:
	```sh
	npx next dev -p 9004
	```
	Visit [http://localhost:9004](http://localhost:9004) in your browser.
5. Build for Production:
	```sh
	npm run build
	npm start
	```
6. Deploy to Vercel:
	- Connect your GitHub repository to Vercel.
	- Deploy the project using Vercel's dashboard or CLI.

## Development Context
This project was developed during **Status Code 2**, an event organized by IIIT Kalyani. It showcases the collaborative efforts of the team to build an AI-powered educational tool.

## Contributing
Feel free to fork this repository, submit issues, or create pull requests to contribute to the project.

## License
This project is for educational purposes and was developed as part of Status Code 2, organized by IIIT Kalyani.
[Specify license, e.g., MIT, if applicable]

## Acknowledgements
Special thanks to the IIIT Kalyani community and participants of Status Code 2 for the inspiration and support.

---

For any queries, contact the team members listed above.
