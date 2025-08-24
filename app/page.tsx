"use client"

import { useState, useEffect } from "react"
import { ResumeForm } from "@/components/resume-form"
import { ResumePreview } from "@/components/resume-preview"
import { Button } from "@/components/ui/button"
import { Download, RotateCcw, Save, CheckCircle } from "lucide-react"
import { generateHTMLToDOCX } from "@/lib/html-to-docx-generator"
import { ThemeToggle } from "@/components/theme-toggle"

export interface PersonalInfo {
  name: string
  location: string
  phone: string
  email: string
  linkedin: string
  github: string
  leetcode: string
}

export interface Education {
  id: string
  institution: string
  degree: string
  duration: string
  location: string
  gradeFormat?: "CGPA" | "Percentage" | ""
  gradeValue?: string
}

export interface TechnicalSkill {
  id: string
  category: string
  skills: string
}

export interface Project {
  id: string
  title: string
  technologies: string
  description: string
  links?: string
}

export interface Experience {
  id: string
  company: string
  position: string
  duration: string
  location: string
  description: string
}

export interface Achievement {
  id: string
  title: string
  description: string
}

export interface Extracurricular {
  id: string
  organization: string
  designation: string
  duration: string
  description: string
}

export interface CustomSection {
  id: string
  title: string
  items: {
    id: string
    title: string
    subtitle?: string
    description: string
    duration?: string
    location?: string
  }[]
}

export interface HistoryEntry {
  id: string
  timestamp: number
  action: "add" | "edit" | "delete" | "reorder"
  section: string
  itemId?: string
  itemTitle?: string
  oldValue?: any
  newValue?: any
  description: string
}

export interface ResumeData {
  personalInfo: PersonalInfo
  education: Education[]
  technicalSkills: TechnicalSkill[]
  projects: Project[]
  experience: Experience[]
  achievements: Achievement[]
  extracurriculars: Extracurricular[]
  customSections: CustomSection[]
  sectionOrder: string[]
  history: HistoryEntry[]
}

const initialData: ResumeData = {
  personalInfo: {
    name: "",
    location: "",
    phone: "",
    email: "",
    linkedin: "",
    github: "",
    leetcode: "",
  },
  education: [],
  technicalSkills: [],
  projects: [],
  experience: [],
  achievements: [],
  extracurriculars: [],
  customSections: [],
  sectionOrder: ["education", "technicalSkills", "experience", "projects", "achievements", "extracurriculars"],
  history: [],
}

const STORAGE_KEY = "halfbaked-resume-data" // Updated storage key to match new branding
const AUTO_SAVE_DELAY = 2000 // 2 seconds
const GEMINI_API_KEY = "AIzaSyAS7cOgH-KH0iaucOhsRsWrOX_q3P84MuY"; // Replace with your actual key if needed
const GEMINI_MODEL = "gemini-2.5-flash";

export default function ResumePage() {
  const [aiFeedback, setAIFeedback] = useState<string>("")
  const [isReviewing, setIsReviewing] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([]);

  async function handleAIResumeReview() {
    setIsReviewing(true)
    setAIFeedback("")
    try {
      const response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=AIzaSyAS7cOgH-KH0iaucOhsRsWrOX_q3P84MuY", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this resume and give personalized feedback, tips, improvements, and suggest better wording, formatting, or missing sections.\nResume Data: ${JSON.stringify(resumeData)}`
            }]
          }]
        })
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`AI review failed: ${response.status} ${errorText}`)
      }
      const data = await response.json()
      let feedback = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No feedback returned."
      // Remove markdown formatting (basic)
      feedback = feedback.replace(/\*\*(.*?)\*\*/g, '$1') // bold
      feedback = feedback.replace(/\*(.*?)\*/g, '$1') // italics
      feedback = feedback.replace(/`([^`]*)`/g, '$1') // inline code
      feedback = feedback.replace(/^#+\s*/gm, '') // headings (#, ##, ###)
      feedback = feedback.replace(/^- /gm, '') // bullet points
      feedback = feedback.replace(/\n{2,}/g, '\n') // collapse extra newlines
      setAIFeedback(feedback)
    } catch (err) {
      setAIFeedback("Error getting feedback: " + (err instanceof Error ? err.message : "Unknown error"))
    }
    setIsReviewing(false)
  }
  // PDF feature removed
  const [resumeData, setResumeData] = useState<ResumeData>(initialData)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  // Remove history UI and state

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        if (!parsed.sectionOrder) {
          parsed.sectionOrder = [
            "education",
            "technicalSkills",
            "experience",
            "projects",
            "achievements",
            "extracurriculars",
          ]
        }
        if (!parsed.customSections) {
          parsed.customSections = []
        }
        // Remove history restoration
        setResumeData(parsed)
        setLastSaved(new Date(parsed.lastSaved || Date.now()))
      } catch (error) {
        console.error("Error loading saved data:", error)
      }
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()

    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Auto-saving removed

  const handleDownloadHTMLDOCX = async () => {
    await generateHTMLToDOCX(resumeData)
  }

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all data? This action cannot be undone.")) {
      setResumeData(initialData)
      localStorage.removeItem(STORAGE_KEY)
      setLastSaved(null)
    }
  }

  const handleManualSave = () => {
    const dataToSave = {
      ...resumeData,
      lastSaved: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    setLastSaved(new Date())
  }

  async function fetchGeminiChatResponse(message: string) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const body = {
      contents: [
        {
          parts: [
            { text: message }
          ]
        }
      ]
    };
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
    } catch (err) {
      return "Error connecting to AI service.";
    }
  }

  function handleSendChat() {
    if (chatInput.trim()) {
      setChatMessages(prev => [
        ...prev,
        { sender: "user", text: chatInput }
      ]);
      const userMessage = chatInput;
      setChatInput("");
      // Send to Gemini API and append response
      fetchGeminiChatResponse(userMessage).then(aiText => {
        setChatMessages(prev => [
          ...prev,
          { sender: "ai", text: aiText }
        ]);
      });
    }
  }

  function formatAIResponse(text: string) {
    // Split by line breaks or numbered/bullet points, then clean markdown
    const lines = text
      .split(/\n|\r|•|\d+\./)
      .map(line => line.replace(/^([#*>\-\s]+)+/, "").trim())
      .filter(line => line.length > 0);
    return lines;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border px-4 md:px-6 py-3 md:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between max-w-7xl mx-auto gap-3 sm:gap-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <span className="text-background font-bold text-xs">RB</span>
            </div>
            <a
              href="https://scholarai-edu.vercel.app/"
              rel="noopener noreferrer"
              className="ml-2 px-3 py-1 rounded-md bg-accent text-accent-foreground text-xs md:text-sm font-semibold hover:bg-accent/80 transition"
              style={{ display: 'flex', alignItems: 'center', height: '2rem' }}
            >
              Dashboard
            </a>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">Resume Builder</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Created by <span className="text-muted-foreground">half baked brain</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              {lastSaved ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </>
              ) : (
                <span>Not saved</span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* History button removed */}

              <Button
                onClick={handleManualSave}
                variant="outline"
                size="sm"
                className="border-border text-foreground hover:bg-accent bg-transparent text-xs md:text-sm"
              >
                <Save className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Save Now</span>
                <span className="sm:hidden">Save</span>
              </Button>

              <Button
                onClick={handleAIResumeReview}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm"
                disabled={isReviewing}
              >
                {isReviewing ? "Reviewing..." : "Review AI"}
              </Button>

              <Button
                onClick={() => setIsChatOpen(true)}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs md:text-sm"
                style={{ marginLeft: '4px' }}
              >
                AI Assistant
              </Button>

              <ThemeToggle />

              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="border-border text-foreground hover:bg-accent bg-transparent text-xs md:text-sm"
              >
                <RotateCcw className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Reset</span>
                <span className="sm:hidden">Reset</span>
              </Button>

              <Button
                onClick={handleDownloadHTMLDOCX}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm"
              >
                <Download className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Download Word</span>
                <span className="sm:hidden">Download</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Resume Form & Live Preview */}
      <div className="max-w-7xl mx-auto p-3 md:p-6">
        <div className="grid gap-4 md:gap-6 min-h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] grid-cols-1 md:grid-cols-[1fr_2fr]">
          <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
            <ResumeForm resumeData={resumeData} setResumeData={setResumeData} />
          </div>
          <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="bg-muted px-4 md:px-6 py-3 md:py-4 border-b border-border">
                <h2 className="text-base md:text-lg font-semibold text-foreground">Live Preview</h2>
              </div>
              <div className="flex-1 p-2 md:p-4 overflow-y-auto">
                <div
                  className="w-full max-w-[210mm] mx-auto shadow-lg"
                  style={{
                    transform: isMobile ? "scale(0.6)" : "scale(0.9)",
                    transformOrigin: "top center",
                    minHeight: "297mm",
                  }}
                >
                  <ResumePreview resumeData={resumeData} />
                </div>
                {/* AI Resume Feedback section below button */}
                {aiFeedback && (
                  <div className="my-8 p-4 bg-green-50 border border-green-300 rounded text-green-900 text-sm whitespace-pre-line max-w-7xl mx-auto">
                    <strong>AI Resume Review & Suggestions:</strong>
                    <div>{aiFeedback}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Improved modal for AI Chat Assistant */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full border border-gray-200 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl font-bold"
              onClick={() => setIsChatOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-2 text-center text-purple-700">AI Chat Assistant</h2>
            <p className="text-sm mb-4 text-center text-gray-600">Ask resume-related questions, get guidance, or job search tips.</p>
            <div className="mb-4 max-h-48 overflow-y-auto border rounded p-2 bg-gray-50">
              {chatMessages.length === 0 && (
                <div className="text-gray-400 text-sm text-center">No messages yet.</div>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={msg.sender === "user" ? "text-right" : "text-left"}>
                  {msg.sender === "ai" ? (
                    <ul className="bg-gray-200 text-gray-800 px-2 py-1 rounded inline-block mb-1 list-disc ml-4">
                      {formatAIResponse(msg.text).map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="bg-blue-100 text-blue-900 px-2 py-1 rounded inline-block mb-1">{msg.text}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Type your question..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSendChat(); }}
              />
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-semibold"
                onClick={handleSendChat}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
