# ScholarAI  

**Status Code 2 | Organized by IIIT Kalyani**  

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/Kotlin-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white" />
  <img src="https://img.shields.io/badge/Jetpack%20Compose-4285F4?style=for-the-badge&logo=android&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini%20API-4285F4?style=for-the-badge&logo=google&logoColor=white" />
</p>  

---

## 👥 Team Members  
- Aryan Bhargava  
- Jatin Kabra  
- Yuvraj Singhania  
- Asmit Saha  
- Arundhati Behera  

---

## 📖 Overview  
**ScholarAI** is an AI-powered academic and career support platform built with **Next.js** and **Firebase**. It integrates multiple tools into a single ecosystem, enabling students and professionals to:  

- Build resumes with AI assistance  
- Generate structured notes from study material  
- Summarize lengthy documents  
- Create customized quizzes for self-assessment  

The platform supports both **web** and **mobile** interfaces, ensuring accessibility and flexibility. Hosting is managed seamlessly on **Vercel**.  

---

## 🚀 Features  

### 📝 Resume Builder  
- AI chatbot assists in resume creation  
- Real-time feedback and improvement suggestions  
- AI-driven review (Note: single-template system, focused on content quality)  

### 📚 AI Note Generator  
- Converts raw study material into concise, structured notes  
- Highlights key points and organizes content intelligently  
- Interactive Q&A for deeper understanding  

### 📄 Document Summarizer  
- Extracts core information from long documents  
- Provides concise bullet-point summaries  
- Supports interactive queries on summarized content  

### 🎯 AI Quiz Creator  
- Generates customized quizzes from text or PDF inputs  
- Supports **MCQs** and **True/False** formats  
- Adjustable difficulty levels  
- Instant feedback on answers  

---

## 📱 Mobile Application  

A **mobile app** replicates the core functionality of the web version, giving users flexibility in accessing features.  

<p align="center">
  <img src="scholarAI App SS/notes.jpeg" width="15%">
  &nbsp;
  <img src="scholarAI App SS/quiz.jpeg" width="15%">
  &nbsp;
  <img src="scholarAI App SS/quiz2.jpeg" width="15%">
  &nbsp;
  <img src="scholarAI App SS/quiz3.jpeg" width="15%">
  &nbsp;
  <img src="scholarAI App SS/quiz4.jpeg" width="15%">
  &nbsp;
 <img src="scholarAI App SS/resume.jpeg" width="15%">
</p>  

**Mobile Tech Stack**  
- **Kotlin** + **Jetpack Compose**  
- **Gemini API** for AI integration  
- **Koin** for dependency injection  

---

## 🛠️ Tech Stack  

**Web Application**  
- Frontend: Next.js, React, Tailwind CSS  
- Backend: Firebase (authentication & services)  
- Deployment: Vercel  

**Mobile Application**  
- Kotlin, Jetpack Compose, Gemini API, Koin  

---

## 📂 Project Structure  

src/
* ├── ai/
* │ ├── dev.js, genkit.js # AI logic and integrations
* │ └── flows/
* │ ├── create-quiz.js # Quiz generation
* │ ├── generate-notes.js # Note generation
* │ └── summarize-document.js # Summarization
* │
* ├── app/
* │ ├── favicon.ico, globals.css, layout.jsx, page.jsx
* │ ├── (app)/
* │ │ ├── layout.jsx
* │ │ ├── document-summarizer/page.jsx
* │ │ ├── note-generator/page.jsx
* │ │ ├── quiz-creator/page.jsx
* │ │ └── resume-builder/page.jsx
* │ └── (auth)/
* │ ├── layout.jsx
* │ ├── login/page.jsx
* │ └── signup/page.jsx
* │
* ├── components/
* │ ├── app-sidebar.jsx
* │ └── ui/ (accordion, button, card, form, input, etc.)
* │
* ├── hooks/
* │ ├── use-auth.js
* │ ├── use-mobile.jsx
* │ └── use-toast.js
* │
* ├── lib/
* │ ├── firebase.js
* │ └── utils.js
* │
* docs/
* └── blueprint.md

yaml
Copy
Edit

Additional configuration:  
`apphosting.yaml`, `components.json`, `jsconfig.json`, `next.config.js`, `package.json`, `postcss.config.mjs`, `tailwind.config.js`, `README.md`  

---

## 🔐 Authentication  
- Google authentication enabled through Firebase.  
- Sign in by selecting **"Login with Google"** on the landing page.  

---

## ⚙️ Setup Instructions  


## 1. Clone the repository

```bash
git clone <repository-url>
cd StatusCode2
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure Firebase

- Create a Firebase project  
- Enable authentication  
- Add Firebase credentials to environment variables  

## 4. Run locally

```bash
npx next dev -p 9004
```
Open: [http://localhost:9004](http://localhost:9004)

## 5. Build for production

```bash
npm run build
npm start
```

## 6. Deploy to Vercel

- Connect GitHub repository to Vercel  
- Deploy via Vercel dashboard or CLI  

---

### 📖 Development Context
ScholarAI was developed during Status Code 2, an event organized by IIIT Kalyani, highlighting team collaboration and innovation in AI-driven education tools.

### 🤝 Contributing
Contributions are welcome. Fork the repository, open issues, or create pull requests to improve the project.

### 📜 License
This project was created for educational purposes as part of Status Code 2.  
[Insert License Here: e.g., MIT]

### 🙌 Acknowledgements
Special thanks to the IIIT Kalyani community and participants of Status Code 2 for guidance and support.
