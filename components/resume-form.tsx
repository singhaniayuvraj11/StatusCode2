"use client"

import type React from "react"
import { useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { PlusCircle, MinusCircle } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CharacterCounter } from "@/components/character-counter"
import { CustomSectionForm } from "@/components/custom-section-form"
import { ResumeStrengthBar } from "@/components/resume-strength-bar"

import type {
  ResumeData,
  PersonalInfo,
  Education,
  TechnicalSkill,
  Project,
  Experience,
  Achievement,
  Extracurricular,
  CustomSection,
  HistoryEntry,
} from "@/app/page"

interface ResumeFormProps {
  resumeData: ResumeData
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>
}

export function ResumeForm({ resumeData, setResumeData }: ResumeFormProps) {
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})

  const addHistoryEntry = (
    action: "add" | "edit" | "delete" | "reorder",
    section: string,
    description: string,
    itemId?: string,
    itemTitle?: string,
    oldValue?: any,
    newValue?: any,
  ) => {
    const historyEntry: HistoryEntry = {
      id: uuidv4(),
      timestamp: Date.now(),
      action,
      section,
      itemId,
      itemTitle,
      oldValue,
      newValue,
      description,
    }

    setResumeData((prev) => ({
      ...prev,
      history: [historyEntry, ...prev.history.slice(0, 49)], // Keep only last 50 entries
    }))
  }

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId]
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      // Add a subtle highlight effect
      element.style.backgroundColor = "rgba(59, 130, 246, 0.1)"
      setTimeout(() => {
        element.style.backgroundColor = ""
      }, 2000)
    }
  }

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    const oldValue = resumeData.personalInfo[field]
    if (oldValue !== value && oldValue !== "") {
      addHistoryEntry(
        "edit",
        "Personal Information",
        `Updated ${field} from "${oldValue}" to "${value}"`,
        undefined,
        field,
        oldValue,
        value,
      )
    }
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }))
  }

  const addEducation = () => {
    const newId = uuidv4()
    addHistoryEntry("add", "Education", "Added new education entry", newId, "New Education")
    setResumeData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: newId,
          institution: "",
          degree: "",
          duration: "",
          location: "",
          gradeFormat: "",
          gradeValue: "",
        },
      ],
    }))
  }

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    const currentItem = resumeData.education.find((edu) => edu.id === id)
    const oldValue = currentItem?.[field]
    if (oldValue !== value && oldValue !== "") {
      addHistoryEntry(
        "edit",
        "Education",
        `Updated ${field} in "${currentItem?.institution || "education entry"}"`,
        id,
        currentItem?.institution || "Education Entry",
        oldValue,
        value,
      )
    }
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    }))
  }

  const removeEducation = (id: string) => {
    const itemToRemove = resumeData.education.find((edu) => edu.id === id)
    addHistoryEntry(
      "delete",
      "Education",
      `Deleted education entry: ${itemToRemove?.institution || "Unknown"}`,
      id,
      itemToRemove?.institution || "Education Entry",
      itemToRemove,
    )
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }))
  }

  const addTechnicalSkill = () => {
    const newId = uuidv4()
    addHistoryEntry("add", "Technical Skills", "Added new technical skill category", newId, "New Skill Category")
    setResumeData((prev) => ({
      ...prev,
      technicalSkills: [...prev.technicalSkills, { id: newId, category: "", skills: "" }],
    }))
  }

  const updateTechnicalSkill = (id: string, field: keyof TechnicalSkill, value: string) => {
    const currentItem = resumeData.technicalSkills.find((skill) => skill.id === id)
    const oldValue = currentItem?.[field]
    if (oldValue !== value && oldValue !== "") {
      addHistoryEntry(
        "edit",
        "Technical Skills",
        `Updated ${field} in "${currentItem?.category || "skill category"}"`,
        id,
        currentItem?.category || "Skill Category",
        oldValue,
        value,
      )
    }
    setResumeData((prev) => ({
      ...prev,
      technicalSkills: prev.technicalSkills.map((skill) => (skill.id === id ? { ...skill, [field]: value } : skill)),
    }))
  }

  const removeTechnicalSkill = (id: string) => {
    const itemToRemove = resumeData.technicalSkills.find((skill) => skill.id === id)
    addHistoryEntry(
      "delete",
      "Technical Skills",
      `Deleted skill category: ${itemToRemove?.category || "Unknown"}`,
      id,
      itemToRemove?.category || "Skill Category",
      itemToRemove,
    )
    setResumeData((prev) => ({
      ...prev,
      technicalSkills: prev.technicalSkills.filter((skill) => skill.id !== id),
    }))
  }

  const addProject = () => {
    const newId = uuidv4()
    addHistoryEntry("add", "Projects", "Added new project", newId, "New Project")
    setResumeData((prev) => ({
      ...prev,
      projects: [...prev.projects, { id: newId, title: "", technologies: "", description: "", links: "" }],
    }))
  }

  const updateProject = (id: string, field: keyof Project, value: string) => {
    const currentItem = resumeData.projects.find((project) => project.id === id)
    const oldValue = currentItem?.[field]
    if (oldValue !== value && oldValue !== "") {
      addHistoryEntry(
        "edit",
        "Projects",
        `Updated ${field} in "${currentItem?.title || "project"}"`,
        id,
        currentItem?.title || "Project",
        oldValue,
        value,
      )
    }
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((project) => (project.id === id ? { ...project, [field]: value } : project)),
    }))
  }

  const removeProject = (id: string) => {
    const itemToRemove = resumeData.projects.find((project) => project.id === id)
    addHistoryEntry(
      "delete",
      "Projects",
      `Deleted project: ${itemToRemove?.title || "Unknown"}`,
      id,
      itemToRemove?.title || "Project",
      itemToRemove,
    )
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((project) => project.id !== id),
    }))
  }

  const addExperience = () => {
    const newId = uuidv4()
    addHistoryEntry("add", "Experience", "Added new work experience", newId, "New Experience")
    setResumeData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: newId,
          company: "",
          position: "",
          duration: "",
          location: "",
          description: "",
        },
      ],
    }))
  }

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    const currentItem = resumeData.experience.find((exp) => exp.id === id)
    const oldValue = currentItem?.[field]
    if (oldValue !== value && oldValue !== "") {
      addHistoryEntry(
        "edit",
        "Experience",
        `Updated ${field} in "${currentItem?.company || "experience"}"`,
        id,
        currentItem?.company || "Experience",
        oldValue,
        value,
      )
    }
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    }))
  }

  const removeExperience = (id: string) => {
    const itemToRemove = resumeData.experience.find((exp) => exp.id === id)
    addHistoryEntry(
      "delete",
      "Experience",
      `Deleted experience: ${itemToRemove?.company || "Unknown"}`,
      id,
      itemToRemove?.company || "Experience",
      itemToRemove,
    )
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }))
  }

  const addAchievement = () => {
    const newId = uuidv4()
    addHistoryEntry("add", "Achievements", "Added new achievement", newId, "New Achievement")
    setResumeData((prev) => ({
      ...prev,
      achievements: [...prev.achievements, { id: newId, title: "", description: "" }],
    }))
  }

  const updateAchievement = (id: string, field: keyof Achievement, value: string) => {
    const currentItem = resumeData.achievements.find((ach) => ach.id === id)
    const oldValue = currentItem?.[field]
    if (oldValue !== value && oldValue !== "") {
      addHistoryEntry(
        "edit",
        "Achievements",
        `Updated ${field} in "${currentItem?.title || "achievement"}"`,
        id,
        currentItem?.title || "Achievement",
        oldValue,
        value,
      )
    }
    setResumeData((prev) => ({
      ...prev,
      achievements: prev.achievements.map((ach) => (ach.id === id ? { ...ach, [field]: value } : ach)),
    }))
  }

  const removeAchievement = (id: string) => {
    const itemToRemove = resumeData.achievements.find((ach) => ach.id === id)
    addHistoryEntry(
      "delete",
      "Achievements",
      `Deleted achievement: ${itemToRemove?.title || "Unknown"}`,
      id,
      itemToRemove?.title || "Achievement",
      itemToRemove,
    )
    setResumeData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((ach) => ach.id !== id),
    }))
  }

  const addExtracurricular = () => {
    const newId = uuidv4()
    addHistoryEntry("add", "Extracurriculars", "Added new extracurricular activity", newId, "New Activity")
    setResumeData((prev) => ({
      ...prev,
      extracurriculars: [
        ...prev.extracurriculars,
        { id: newId, organization: "", designation: "", duration: "", description: "" },
      ],
    }))
  }

  const updateExtracurricular = (id: string, field: keyof Extracurricular, value: string) => {
    const currentItem = resumeData.extracurriculars.find((extra) => extra.id === id)
    const oldValue = currentItem?.[field]
    if (oldValue !== value && oldValue !== "") {
      addHistoryEntry(
        "edit",
        "Extracurriculars",
        `Updated ${field} in "${currentItem?.organization || "activity"}"`,
        id,
        currentItem?.organization || "Activity",
        oldValue,
        value,
      )
    }
    setResumeData((prev) => ({
      ...prev,
      extracurriculars: prev.extracurriculars.map((extra) => (extra.id === id ? { ...extra, [field]: value } : extra)),
    }))
  }

  const removeExtracurricular = (id: string) => {
    const itemToRemove = resumeData.extracurriculars.find((extra) => extra.id === id)
    addHistoryEntry(
      "delete",
      "Extracurriculars",
      `Deleted activity: ${itemToRemove?.organization || "Unknown"}`,
      id,
      itemToRemove?.organization || "Activity",
      itemToRemove,
    )
    setResumeData((prev) => ({
      ...prev,
      extracurriculars: prev.extracurriculars.filter((extra) => extra.id !== id),
    }))
  }

  // Custom sections management
  const addCustomSection = () => {
    const newSection: CustomSection = {
      id: uuidv4(),
      title: "",
      items: [],
    }
    addHistoryEntry("add", "Custom Sections", "Added new custom section", newSection.id, "New Custom Section")
    setResumeData((prev) => ({
      ...prev,
      customSections: [...prev.customSections, newSection],
      sectionOrder: [...prev.sectionOrder, `custom-${newSection.id}`],
    }))
  }

  const updateCustomSection = (sectionId: string, updatedSection: CustomSection) => {
    const currentSection = resumeData.customSections.find((section) => section.id === sectionId)
    if (currentSection && JSON.stringify(currentSection) !== JSON.stringify(updatedSection)) {
      addHistoryEntry(
        "edit",
        "Custom Sections",
        `Updated custom section: ${updatedSection.title || "Untitled"}`,
        sectionId,
        updatedSection.title || "Custom Section",
        currentSection,
        updatedSection,
      )
    }
    setResumeData((prev) => ({
      ...prev,
      customSections: prev.customSections.map((section) => (section.id === sectionId ? updatedSection : section)),
    }))
  }

  const removeCustomSection = (sectionId: string) => {
    const itemToRemove = resumeData.customSections.find((section) => section.id === sectionId)
    addHistoryEntry(
      "delete",
      "Custom Sections",
      `Deleted custom section: ${itemToRemove?.title || "Unknown"}`,
      sectionId,
      itemToRemove?.title || "Custom Section",
      itemToRemove,
    )
    setResumeData((prev) => ({
      ...prev,
      customSections: prev.customSections.filter((section) => section.id !== sectionId),
      sectionOrder: prev.sectionOrder.filter((order) => order !== `custom-${sectionId}`),
    }))
  }

  // Section reordering
  const reorderSections = (startIndex: number, endIndex: number) => {
    const oldOrder = [...resumeData.sectionOrder]
    addHistoryEntry(
      "reorder",
      "Section Order",
      `Reordered sections from position ${startIndex} to ${endIndex}`,
      undefined,
      "Section Order",
      oldOrder,
    )
    setResumeData((prev) => {
      const newOrder = Array.from(prev.sectionOrder)
      const [removed] = newOrder.splice(startIndex, 1)
      newOrder.splice(endIndex, 0, removed)
      return { ...prev, sectionOrder: newOrder }
    })
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Resume Strength Bar */}
      <ResumeStrengthBar resumeData={resumeData} onScrollToSection={scrollToSection} />

      {/* Personal Information */}
      <section className="space-y-4" ref={(el) => (sectionRefs.current["personal-info"] = el)} id="personal-info">
        <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={resumeData.personalInfo.name}
              onChange={(e) => updatePersonalInfo("name", e.target.value)}
              placeholder="Your Name"
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={resumeData.personalInfo.location}
              onChange={(e) => updatePersonalInfo("location", e.target.value)}
              placeholder="City, State, Country"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={resumeData.personalInfo.phone}
              onChange={(e) => updatePersonalInfo("phone", e.target.value)}
              placeholder="+91-1234567890"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={resumeData.personalInfo.email}
              onChange={(e) => updatePersonalInfo("email", e.target.value)}
              placeholder="name@gmail.com"
            />
          </div>
          <div>
            <Label htmlFor="linkedin">LinkedIn Username</Label>
            <Input
              id="linkedin"
              value={resumeData.personalInfo.linkedin}
              onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
              placeholder="your username"
            />
          </div>
          <div>
            <Label htmlFor="github">GitHub Username</Label>
            <Input
              id="github"
              value={resumeData.personalInfo.github}
              onChange={(e) => updatePersonalInfo("github", e.target.value)}
              placeholder="your username"
            />
          </div>
          <div>
            <Label htmlFor="leetcode">LeetCode Username</Label>
            <Input
              id="leetcode"
              value={resumeData.personalInfo.leetcode}
              onChange={(e) => updatePersonalInfo("leetcode", e.target.value)}
              placeholder="your username"
            />
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="space-y-4" ref={(el) => (sectionRefs.current["education"] = el)} id="education">
        <h2 className="text-xl font-semibold text-foreground">Education</h2>
        {resumeData.education.map((edu) => (
          <div key={edu.id} className="border border-border p-4 rounded-md space-y-3 relative">
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => removeEducation(edu.id)}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
            <div>
              <Label htmlFor={`institution-${edu.id}`}>Institution</Label>
              <Input
                id={`institution-${edu.id}`}
                value={edu.institution}
                onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                placeholder="University Name"
              />
            </div>
            <div>
              <Label htmlFor={`degree-${edu.id}`}>Degree/Field of Study</Label>
              <Input
                id={`degree-${edu.id}`}
                value={edu.degree}
                onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                placeholder="Bachelor of Science in Computer Science"
              />
            </div>
            <div>
              <Label htmlFor={`duration-${edu.id}`}>Duration</Label>
              <Input
                id={`duration-${edu.id}`}
                value={edu.duration}
                onChange={(e) => updateEducation(edu.id, "duration", e.target.value)}
                placeholder="2020 - 2024"
              />
            </div>
            <div>
              <Label htmlFor={`location-edu-${edu.id}`}>Location</Label>
              <Input
                id={`location-edu-${edu.id}`}
                value={edu.location}
                onChange={(e) => updateEducation(edu.id, "location", e.target.value)}
                placeholder="City, State"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`grade-format-${edu.id}`}>Grade Format</Label>
                <Select
                  value={edu.gradeFormat}
                  onValueChange={(value: "CGPA" | "Percentage" | "") => updateEducation(edu.id, "gradeFormat", value)}
                >
                  <SelectTrigger id={`grade-format-${edu.id}`}>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CGPA">CGPA</SelectItem>
                    <SelectItem value="Percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {edu.gradeFormat && (
                <div>
                  <Label htmlFor={`grade-value-${edu.id}`}>
                    {edu.gradeFormat === "CGPA" ? "CGPA Value" : "Percentage Value"}
                  </Label>
                  <Input
                    id={`grade-value-${edu.id}`}
                    value={edu.gradeValue}
                    onChange={(e) => updateEducation(edu.id, "gradeValue", e.target.value)}
                    placeholder={edu.gradeFormat === "CGPA" ? "3.8/4.0" : "90%"}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full bg-transparent" onClick={addEducation}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      </section>

      {/* Technical Skills */}
      <section className="space-y-4" ref={(el) => (sectionRefs.current["technical-skills"] = el)} id="technical-skills">
        <h2 className="text-xl font-semibold text-foreground">Technical Skills</h2>
        {resumeData.technicalSkills.map((skill) => (
          <div key={skill.id} className="border border-border p-4 rounded-md space-y-3 relative">
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => removeTechnicalSkill(skill.id)}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
            <div>
              <Label htmlFor={`category-${skill.id}`}>Category</Label>
              <Input
                id={`category-${skill.id}`}
                value={skill.category}
                onChange={(e) => updateTechnicalSkill(skill.id, "category", e.target.value)}
                placeholder="Programming Languages"
              />
            </div>
            <div>
              <Label htmlFor={`skills-${skill.id}`}>Skills</Label>
              <Textarea
                id={`skills-${skill.id}`}
                value={skill.skills}
                onChange={(e) => updateTechnicalSkill(skill.id, "skills", e.target.value)}
                placeholder="Python, Java, JavaScript, C++"
              />
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full bg-transparent" onClick={addTechnicalSkill}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Technical Skill
        </Button>
      </section>

      {/* Projects */}
      <section className="space-y-4" ref={(el) => (sectionRefs.current["projects"] = el)} id="projects">
        <h2 className="text-xl font-semibold text-foreground">Projects</h2>
        {resumeData.projects.map((project) => (
          <div key={project.id} className="border border-border p-4 rounded-md space-y-3 relative">
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => removeProject(project.id)}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
            <div>
              <Label htmlFor={`project-title-${project.id}`}>Title</Label>
              <Input
                id={`project-title-${project.id}`}
                value={project.title}
                onChange={(e) => updateProject(project.id, "title", e.target.value)}
                placeholder="My Awesome Project"
              />
            </div>
            <div>
              <Label htmlFor={`project-technologies-${project.id}`}>Technologies Used</Label>
              <Input
                id={`project-technologies-${project.id}`}
                value={project.technologies}
                onChange={(e) => updateProject(project.id, "technologies", e.target.value)}
                placeholder="React, Node.js, MongoDB"
              />
            </div>
            <div>
              <Label htmlFor={`project-description-${project.id}`}>
                Description (use bullet points for multiple lines)
              </Label>
              <Textarea
                id={`project-description-${project.id}`}
                value={project.description}
                onChange={(e) => updateProject(project.id, "description", e.target.value)}
                placeholder="• Developed a responsive UI\n• Implemented RESTful APIs"
                maxLength={500}
              />
              <CharacterCounter current={project.description.length} max={500} className="mt-1" />
            </div>
            <div>
              <Label htmlFor={`project-links-${project.id}`}>Links (e.g., GitHub, Live Demo - separate with |)</Label>
              <Input
                id={`project-links-${project.id}`}
                value={project.links}
                onChange={(e) => updateProject(project.id, "links", e.target.value)}
                placeholder="github.com/user/repo | live-demo.com"
              />
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full bg-transparent" onClick={addProject}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </section>

      {/* Professional Experience */}
      <section className="space-y-4" ref={(el) => (sectionRefs.current["experience"] = el)} id="experience">
        <h2 className="text-xl font-semibold text-foreground">Professional Experience</h2>
        {resumeData.experience.map((exp) => (
          <div key={exp.id} className="border border-border p-4 rounded-md space-y-3 relative">
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => removeExperience(exp.id)}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
            <div>
              <Label htmlFor={`company-${exp.id}`}>Company</Label>
              <Input
                id={`company-${exp.id}`}
                value={exp.company}
                onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                placeholder="Tech Solutions Inc."
              />
            </div>
            <div>
              <Label htmlFor={`position-${exp.id}`}>Position</Label>
              <Input
                id={`position-${exp.id}`}
                value={exp.position}
                onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <Label htmlFor={`duration-exp-${exp.id}`}>Duration</Label>
              <Input
                id={`duration-exp-${exp.id}`}
                value={exp.duration}
                onChange={(e) => updateExperience(exp.id, "duration", e.target.value)}
                placeholder="Jan 2022 - Present"
              />
            </div>
            <div>
              <Label htmlFor={`location-exp-${exp.id}`}>Location</Label>
              <Input
                id={`location-exp-${exp.id}`}
                value={exp.location}
                onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                placeholder="San Francisco, CA"
              />
            </div>
            <div>
              <Label htmlFor={`description-exp-${exp.id}`}>Description (use bullet points for multiple lines)</Label>
              <Textarea
                id={`description-exp-${exp.id}`}
                value={exp.description}
                onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                placeholder="• Developed and maintained web applications\n• Collaborated with cross-functional teams"
                maxLength={500}
              />
              <CharacterCounter current={exp.description.length} max={500} className="mt-1" />
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full bg-transparent" onClick={addExperience}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Experience
        </Button>
      </section>

      {/* Achievements */}
      <section className="space-y-4" ref={(el) => (sectionRefs.current["achievements"] = el)} id="achievements">
        <h2 className="text-xl font-semibold text-foreground">Achievements</h2>
        {resumeData.achievements.map((ach) => (
          <div key={ach.id} className="border border-border p-4 rounded-md space-y-3 relative">
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => removeAchievement(ach.id)}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
            <div>
              <Label htmlFor={`achievement-title-${ach.id}`}>Title</Label>
              <Input
                id={`achievement-title-${ach.id}`}
                value={ach.title}
                onChange={(e) => updateAchievement(ach.id, "title", e.target.value)}
                placeholder="Award Name / Recognition"
              />
            </div>
            <div>
              <Label htmlFor={`achievement-description-${ach.id}`}>
                Description (use bullet points for multiple lines)
              </Label>
              <Textarea
                id={`achievement-description-${ach.id}`}
                value={ach.description}
                onChange={(e) => updateAchievement(ach.id, "description", e.target.value)}
                placeholder="• Won first place in national coding competition\n• Recognized for outstanding performance"
                maxLength={500}
              />
              <CharacterCounter current={ach.description.length} max={500} className="mt-1" />
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full bg-transparent" onClick={addAchievement}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Achievement
        </Button>
      </section>

      {/* Extracurriculars */}
      <section className="space-y-4" ref={(el) => (sectionRefs.current["extracurriculars"] = el)} id="extracurriculars">
        <h2 className="text-xl font-semibold text-foreground">Extracurriculars</h2>
        {resumeData.extracurriculars.map((extra) => (
          <div key={extra.id} className="border border-border p-4 rounded-md space-y-3 relative">
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => removeExtracurricular(extra.id)}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
            <div>
              <Label htmlFor={`organization-${extra.id}`}>Organization</Label>
              <Input
                id={`organization-${extra.id}`}
                value={extra.organization}
                onChange={(e) => updateExtracurricular(extra.id, "organization", e.target.value)}
                placeholder="Student Club / Volunteer Group"
              />
            </div>
            <div>
              <Label htmlFor={`designation-${extra.id}`}>Designation</Label>
              <Input
                id={`designation-${extra.id}`}
                value={extra.designation}
                onChange={(e) => updateExtracurricular(extra.id, "designation", e.target.value)}
                placeholder="President / Volunteer"
              />
            </div>
            <div>
              <Label htmlFor={`duration-extra-${extra.id}`}>Duration</Label>
              <Input
                id={`duration-extra-${extra.id}`}
                value={extra.duration}
                onChange={(e) => updateExtracurricular(extra.id, "duration", e.target.value)}
                placeholder="Sept 2021 - May 2023"
              />
            </div>
            <div>
              <Label htmlFor={`description-extra-${extra.id}`}>
                Description (use bullet points for multiple lines)
              </Label>
              <Textarea
                id={`description-extra-${extra.id}`}
                value={extra.description}
                onChange={(e) => updateExtracurricular(extra.id, "description", e.target.value)}
                placeholder="• Organized weekly meetings\n• Led fundraising events"
                maxLength={500}
              />
              <CharacterCounter current={extra.description.length} max={500} className="mt-1" />
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full bg-transparent" onClick={addExtracurricular}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Extracurricular
        </Button>
      </section>

      {/* Custom Sections */}
      <section className="space-y-4" ref={(el) => (sectionRefs.current["custom-sections"] = el)} id="custom-sections">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Custom Sections</h2>
          <Button variant="outline" onClick={addCustomSection} size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>
        {resumeData.customSections.map((section) => (
          <div key={section.id} className="border border-border p-4 rounded-md">
            <CustomSectionForm
              section={section}
              onUpdate={(updatedSection) => updateCustomSection(section.id, updatedSection)}
              onDelete={() => removeCustomSection(section.id)}
            />
          </div>
        ))}
      </section>
    </div>
  )
}
