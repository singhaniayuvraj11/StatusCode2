"use client"

import { useState, useEffect } from "react"
import { ResumeForm } from "@/components/resume-form"
import { ResumePreview } from "@/components/resume-preview"
import { ResumeHistory } from "@/components/resume-history"
import { Button } from "@/components/ui/button"
import { Download, RotateCcw, Save, CheckCircle, History, X } from "lucide-react"
import { generateHTMLToDOCX } from "@/lib/html-to-docx-generator"
import { Document, Packer } from "docx"
import { Paragraph, TextRun } from "docx"
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
  // history: HistoryEntry[]
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
  // history: [],
}

const STORAGE_KEY = "halfbaked-resume-data" // Updated storage key to match new branding
const AUTO_SAVE_DELAY = 2000 // 2 seconds

export default function ResumePage() {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background border-b border-border px-4 md:px-6 py-3 md:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between max-w-7xl mx-auto gap-3 sm:gap-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <span className="text-background font-bold text-xs">RB</span>
            </div>
            <a
              href="https://scholarai-edu.vercel.app/"
              target="_blank"
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

      <div className="max-w-7xl mx-auto p-3 md:p-6">
        <div className="grid gap-4 md:gap-6 min-h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] grid-cols-1 md:grid-cols-[1fr_2fr]">
          {/* Auto-saving UI removed */}
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
              </div>
            </div>
          </div>

          {/* History panel removed */}
        </div>
      </div>
    </div>
  )
}
