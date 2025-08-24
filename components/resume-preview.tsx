"use client"

import React, { useMemo, useRef, useState, useLayoutEffect } from "react"
import { Mail, Phone, Linkedin, Github, Code } from 'lucide-react'
import type { ResumeData } from "@/app/page"

// A4 sizing in px at ~96dpi for consistent measurement
const A4_HEIGHT_PX = 1122.52 // 297mm * 3.779528
const A4_WIDTH_MM = 210
const TOP_MARGIN_PX = 37.79 // 10mm
const RIGHT_MARGIN_PX = 22.68 // 6mm
const BOTTOM_MARGIN_PX = 56.69 // 15mm
const LEFT_MARGIN_PX = 30.24 // 8mm
const AVAILABLE_CONTENT_HEIGHT_PX = A4_HEIGHT_PX - TOP_MARGIN_PX - BOTTOM_MARGIN_PX

// Pagination heuristics
const MIN_FOOTER_SPACE_PX = 18 // keep a little space at bottom
const KEEP_WITH_NEXT_TYPES = new Set(["section-heading"]) // keep headings with first item
const ATOMIC_TYPES = new Set(["header"]) // header block stays intact

type UnitType =
  | "header"
  | "section-heading"
  | "education-item"
  | "skill-item"
  | "experience-item"
  | "project-item"
  | "achievement-item"
  | "extracurricular-item"
  | "custom-heading"
  | "custom-item"
  | "spacer"

interface Unit {
  key: string
  type: UnitType
  render: () => React.ReactNode
}

/**
 * Build content as small "units" so the paginator can pack them across pages.
 * We keep headings with at least the first item, and avoid leaving a tiny widow at the bottom.
 */
function buildUnits(resumeData: ResumeData): Unit[] {
  const units: Unit[] = []

  // Header block (atomic)
  units.push({
    key: "header",
    type: "header",
    render: () => (
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            width: "100%",
            marginBottom: 8,
          }}
        >
          <h1
            style={{
              fontSize: "20pt",
              lineHeight: "1.1",
              letterSpacing: "2px",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontWeight: "bold",
              textTransform: "uppercase",
              marginBottom: 0,
            }}
          >
            {resumeData.personalInfo.name || "YOUR NAME"}
          </h1>
          {resumeData.personalInfo.location && (
            <div style={{ fontSize: "11pt", fontFamily: "Arial, Helvetica, sans-serif", marginBottom: 0 }}>
              {resumeData.personalInfo.location}
            </div>
          )}
        </div>

        <div
          className="flex justify-center items-center flex-wrap gap-x-4 gap-y-1"
          style={{
            fontSize: "10pt",
            lineHeight: "1.2",
            fontFamily: "Arial, Helvetica, sans-serif",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "4px 8px",
            marginTop: 0,
            marginBottom: 8,
          }}
        >
          {resumeData.personalInfo.phone && (
            <div
              className="flex items-center gap-1 whitespace-nowrap"
              style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
            >
              <Phone className="w-3 h-3 flex-shrink-0" />
              <a href={`tel:${resumeData.personalInfo.phone}`} style={{ textDecoration: "none", color: "#000" }}>
                {resumeData.personalInfo.phone}
              </a>
            </div>
          )}
          {resumeData.personalInfo.email && (
            <div
              className="flex items-center gap-1 whitespace-nowrap"
              style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
            >
              <Mail className="w-3 h-3 flex-shrink-0" />
              <a
                href={`mailto:${resumeData.personalInfo.email}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "#000" }}
              >
                {resumeData.personalInfo.email}
              </a>
            </div>
          )}
          {resumeData.personalInfo.linkedin && (
            <div
              className="flex items-center gap-1 whitespace-nowrap"
              style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
            >
              <Linkedin className="w-3 h-3 flex-shrink-0" />
              <a
                href={`https://linkedin.com/in/${resumeData.personalInfo.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "#000" }}
              >
                {resumeData.personalInfo.linkedin}
              </a>
            </div>
          )}
          {resumeData.personalInfo.github && (
            <div
              className="flex items-center gap-1 whitespace-nowrap"
              style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
            >
              <Github className="w-3 h-3 flex-shrink-0" />
              <a
                href={`https://github.com/${resumeData.personalInfo.github}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "#000" }}
              >
                {resumeData.personalInfo.github}
              </a>
            </div>
          )}
          {resumeData.personalInfo.leetcode && (
            <div
              className="flex items-center gap-1 whitespace-nowrap"
              style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
            >
              <Code className="w-3 h-3 flex-shrink-0" />
              <a
                href={`https://leetcode.com/u/${resumeData.personalInfo.leetcode}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "#000" }}
              >
                leetcode
              </a>
            </div>
          )}
        </div>
      </div>
    ),
  })

  // Helper to push a section heading
  const pushHeading = (title: string, key: string) => {
    units.push({
      key,
      type: "section-heading",
      render: () => (
        <h2
          className="font-bold uppercase mb-2 border-b border-black pb-1"
          style={{
            fontSize: "12pt",
            borderBottomWidth: "1px",
            fontFamily: "Arial, Helvetica, sans-serif",
            textAlign: "left",
            marginBottom: 8,
            paddingBottom: 2,
          }}
        >
          {title}
        </h2>
      ),
    })
  }

  // Education
  if (resumeData.education.length > 0) {
    pushHeading("Education", "heading-education")
    resumeData.education.forEach((edu, idx) => {
      units.push({
        key: `edu-${edu.id}-${idx}`,
        type: "education-item",
        render: () => (
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: "auto", paddingRight: 24 }}>
                <h3
                  style={{
                    fontSize: "11pt",
                    marginBottom: 2,
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontWeight: "bold",
                  }}
                >
                  {edu.institution}
                </h3>
                <p style={{ fontSize: "10pt", margin: 0, fontFamily: "Arial, Helvetica, sans-serif" }}>
                  {edu.degree}
                  {edu.gradeFormat &&
                    edu.gradeValue &&
                    `; ${edu.gradeFormat}: ${edu.gradeFormat === "Percentage" && !edu.gradeValue.endsWith("%") ? `${edu.gradeValue}%` : edu.gradeValue}`}
                </p>
              </div>
              <div style={{ fontSize: "10pt", paddingLeft: 8, textAlign: "right" }}>
                <div style={{ fontWeight: "bold", whiteSpace: "nowrap", marginBottom: 0 }}>{edu.duration}</div>
                <div style={{ fontStyle: "italic", margin: 0 }}>{edu.location}</div>
              </div>
            </div>
          </div>
        ),
      })
    })
  }

  // Technical Skills
  if (resumeData.technicalSkills.length > 0) {
    pushHeading("Technical Skills", "heading-skills")
    resumeData.technicalSkills.forEach((skill, idx) => {
      units.push({
        key: `skill-${skill.id}-${idx}`,
        type: "skill-item",
        render: () => (
          <div
            style={{
              fontSize: "10pt",
              margin: "2px 0 6px 0",
              fontFamily: "Arial, Helvetica, sans-serif",
              textAlign: "left",
            }}
          >
            <span style={{ fontWeight: "bold" }}>{skill.category}:</span> <span>{skill.skills}</span>
          </div>
        ),
      })
    })
  }

  // Experience
  if (resumeData.experience.length > 0) {
    pushHeading("Professional Experience", "heading-experience")
    resumeData.experience.forEach((exp, idx) => {
      units.push({
        key: `exp-${exp.id}-${idx}`,
        type: "experience-item",
        render: () => (
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 4,
              }}
            >
              <div style={{ flex: 1, paddingRight: 24, maxWidth: "70%" }}>
                <h3
                  style={{
                    fontSize: "11pt",
                    marginBottom: 2,
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontWeight: "bold",
                  }}
                >
                  {exp.company}
                </h3>
                <p
                  style={{
                    fontSize: "10pt",
                    margin: 0,
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontWeight: "bold",
                  }}
                >
                  {exp.position}
                </p>
              </div>
              <div style={{ fontSize: "10pt", paddingLeft: 8, textAlign: "right" }}>
                <div style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>{exp.duration}</div>
                <div style={{ fontStyle: "italic" }}>{exp.location}</div>
              </div>
            </div>

            {exp.description && (
              <div style={{ fontSize: "10pt", lineHeight: "1.2", fontFamily: "Arial, Helvetica, sans-serif" }}>
                {exp.description.split("\n").map((line, i) => (
                  <div
                    key={i}
                    style={{
                      margin: "2px 0",
                      paddingLeft: "1em",
                      textIndent: "-1em",
                      textAlign: "left",
                    }}
                  >
                    {"• " + line.replace(/^•\s*/, "")}
                  </div>
                ))}
              </div>
            )}
          </div>
        ),
      })
    })
  }

  // Projects
  if (resumeData.projects.length > 0) {
    pushHeading("Projects", "heading-projects")
    resumeData.projects.forEach((project, idx) => {
      units.push({
        key: `proj-${project.id}-${idx}`,
        type: "project-item",
        render: () => (
          <div style={{ marginBottom: 8 }}>
            <h3
              style={{
                fontSize: "11pt",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontWeight: "bold",
                marginBottom: 2,
              }}
            >
              {project.title}
              {project.links && (
                <span style={{ fontSize: "10pt", fontWeight: "normal" }}>
                  {" | "}
                  {project.links.split("|").map((link, index) => {
                    const trimmed = link.trim()
                    let display = trimmed
                    let href = trimmed
                    if (trimmed.startsWith("github.com/")) {
                      display = "GitHub"
                      href = `https://${trimmed}`
                    } else if (trimmed.startsWith("leetcode.com/")) {
                      display = "LeetCode"
                      href = `https://${trimmed}`
                    } else if (!trimmed.startsWith("http")) {
                      href = `https://${trimmed}`
                    }
                    return (
                      <span key={index}>
                        {index > 0 && " | "}
                        <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#000" }}>
                          {display}
                        </a>
                      </span>
                    )
                  })}
                </span>
              )}
            </h3>

            {project.technologies && (
              <p
                style={{
                  fontSize: "10pt",
                  margin: "2px 0 2px 0",
                  fontWeight: 500,
                  fontFamily: "Arial, Helvetica, sans-serif",
                }}
              >
                {project.technologies}
              </p>
            )}

            {project.description && (
              <div style={{ fontSize: "10pt", lineHeight: "1.2", fontFamily: "Arial, Helvetica, sans-serif" }}>
                {project.description.split("\n").map((line, i) => (
                  <div
                    key={i}
                    style={{
                      margin: "2px 0",
                      paddingLeft: "1em",
                      textIndent: "-1em",
                    }}
                  >
                    {"• " + line.replace(/^•\s*/, "")}
                  </div>
                ))}
              </div>
            )}
          </div>
        ),
      })
    })
  }

  // Achievements
  if (resumeData.achievements.length > 0) {
    pushHeading("Achievements", "heading-achievements")
    resumeData.achievements.forEach((achievement, idx) => {
      units.push({
        key: `ach-${achievement.id}-${idx}`,
        type: "achievement-item",
        render: () => (
          <div style={{ marginBottom: 6 }}>
            <h3
              style={{
                fontSize: "11pt",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontWeight: "bold",
                marginBottom: 2,
              }}
            >
              {achievement.title}
            </h3>
            {achievement.description && (
              <div style={{ fontSize: "10pt", lineHeight: "1.2", fontFamily: "Arial, Helvetica, sans-serif" }}>
                {achievement.description.split("\n").map((line, i) => (
                  <div
                    key={i}
                    style={{
                      margin: "2px 0",
                      paddingLeft: "1em",
                      textIndent: "-1em",
                    }}
                  >
                    {"• " + line.replace(/^•\s*/, "")}
                  </div>
                ))}
              </div>
            )}
          </div>
        ),
      })
    })
  }

  // Extracurriculars
  if (resumeData.extracurriculars.length > 0) {
    pushHeading("Extracurriculars", "heading-extracurriculars")
    resumeData.extracurriculars.forEach((extra, idx) => {
      units.push({
        key: `ext-${extra.id}-${idx}`,
        type: "extracurricular-item",
        render: () => (
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 4,
              }}
            >
              <div style={{ flex: 1, paddingRight: 24, maxWidth: "70%" }}>
                <h3
                  style={{
                    fontSize: "11pt",
                    marginBottom: 2,
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontWeight: "bold",
                  }}
                >
                  {extra.organization}
                </h3>
                <p
                  style={{
                    fontSize: "10pt",
                    margin: 0,
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontWeight: "bold",
                  }}
                >
                  {extra.designation}
                </p>
              </div>
              <div style={{ fontSize: "10pt", paddingLeft: 8, textAlign: "right" }}>
                <div style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>{extra.duration}</div>
              </div>
            </div>
            {extra.description && (
              <div style={{ fontSize: "10pt", lineHeight: "1.2", fontFamily: "Arial, Helvetica, sans-serif" }}>
                {extra.description.split("\n").map((line, i) => (
                  <div
                    key={i}
                    style={{
                      margin: "2px 0",
                      paddingLeft: "1em",
                      textIndent: "-1em",
                    }}
                  >
                    {"• " + line.replace(/^•\s*/, "")}
                  </div>
                ))}
              </div>
            )}
          </div>
        ),
      })
    })
  }

  // Custom Sections
  resumeData.customSections.forEach((custom) => {
    if (custom.title) {
      // Heading
      units.push({
        key: `custom-heading-${custom.id}`,
        type: "section-heading",
        render: () => (
          <h2
            className="font-bold uppercase mb-2 border-b border-black pb-1"
            style={{
              fontSize: "12pt",
              borderBottomWidth: "1px",
              fontFamily: "Arial, Helvetica, sans-serif",
              marginBottom: 8,
              paddingBottom: 2,
            }}
          >
            {custom.title}
          </h2>
        ),
      })
    }
    custom.items.forEach((item, idx) => {
      units.push({
        key: `custom-item-${custom.id}-${item.id}-${idx}`,
        type: "custom-item",
        render: () => (
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 4,
              }}
            >
              <div style={{ flex: 1, paddingRight: 24, maxWidth: "70%" }}>
                <h3
                  style={{
                    fontSize: "11pt",
                    marginBottom: 2,
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontWeight: "bold",
                  }}
                >
                  {item.title}
                </h3>
                {(item.subtitle || item.location) && (
                  <p
                    style={{
                      fontSize: "10pt",
                      margin: 0,
                      fontFamily: "Arial, Helvetica, sans-serif",
                      fontStyle: "italic",
                    }}
                  >
                    {item.subtitle}
                    {item.subtitle && item.location ? " · " : ""}
                    {item.location}
                  </p>
                )}
              </div>
              <div style={{ fontSize: "10pt", paddingLeft: 8, textAlign: "right" }}>
                {item.duration && <div style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>{item.duration}</div>}
              </div>
            </div>
            {item.description && (
              <div style={{ fontSize: "10pt", lineHeight: "1.2", fontFamily: "Arial, Helvetica, sans-serif" }}>
                {item.description.split("\n").map((line, i) => (
                  <div
                    key={i}
                    style={{
                      margin: "2px 0",
                      paddingLeft: "1em",
                      textIndent: "-1em",
                    }}
                  >
                    {"• " + line.replace(/^•\s*/, "")}
                  </div>
                ))}
              </div>
            )}
          </div>
        ),
      })
    })
  })

  return units
}

function paginateUnits(units: Unit[], heights: number[]): number[][] {
  const pages: number[][] = []
  let currentPage: number[] = []
  let currentHeight = 0

  const canFit = (h: number) => currentHeight + h + MIN_FOOTER_SPACE_PX <= AVAILABLE_CONTENT_HEIGHT_PX

  for (let i = 0; i < units.length; i++) {
    const h = heights[i] || 0
    const u = units[i]

    // Try to keep headings with the next item
    if (KEEP_WITH_NEXT_TYPES.has(u.type)) {
      const nextIndex = i + 1
      const nextHeight = heights[nextIndex] || 0
      const need = h + nextHeight

      // If next item doesn't exist, treat like a normal unit
      if (nextIndex >= units.length) {
        if (canFit(h)) {
          currentPage.push(i)
          currentHeight += h
        } else {
          pages.push(currentPage)
          currentPage = [i]
          currentHeight = h
        }
      } else {
        if (canFit(need)) {
          currentPage.push(i, nextIndex)
          currentHeight += need
          i = nextIndex // we consumed the next item already
        } else {
          // move heading to next page with its first item
          if (currentPage.length > 0) pages.push(currentPage)
          currentPage = [i, nextIndex]
          currentHeight = need
          i = nextIndex
        }
      }
      continue
    }

    // Atomic block must fit entirely; otherwise, push to new page
    if (ATOMIC_TYPES.has(u.type)) {
      if (currentPage.length === 0 && !canFit(h)) {
        // Edge case: huge atomic block; still place on empty page
        currentPage.push(i)
        pages.push(currentPage)
        currentPage = []
        currentHeight = 0
        continue
      }
      if (!canFit(h)) {
        pages.push(currentPage)
        currentPage = [i]
        currentHeight = h
      } else {
        currentPage.push(i)
        currentHeight += h
      }
      continue
    }

    // General case
    if (canFit(h)) {
      currentPage.push(i)
      currentHeight += h
    } else {
      // Widow/orphan control: if there's only a tiny space left, move to next page
      pages.push(currentPage)
      currentPage = [i]
      currentHeight = h
    }
  }

  if (currentPage.length > 0) pages.push(currentPage)
  return pages
}

export function ResumePreview({ resumeData }: { resumeData: ResumeData }) {
  const [pages, setPages] = useState<number[][]>([])
  const measurementRef = useRef<HTMLDivElement>(null)

  // Build units once per data change
  const units = useMemo(() => buildUnits(resumeData), [resumeData])

  // Measure and paginate
  useLayoutEffect(() => {
    const measure = () => {
      const container = measurementRef.current
      if (!container) return

      const children = Array.from(container.children) as HTMLElement[]
      const heights = children.map((el) => el.getBoundingClientRect().height)

      const computedPages = paginateUnits(units, heights)
      setPages(computedPages)
    }

    // Defer a tick to ensure layout is stable
    const id = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(id)
  }, [units])

  return (
    <>
      {/* Hidden measurement container */}
      <div
        ref={measurementRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          height: "auto",
          width: `${A4_WIDTH_MM}mm`,
          padding: `${TOP_MARGIN_PX}px ${RIGHT_MARGIN_PX}px ${BOTTOM_MARGIN_PX}px ${LEFT_MARGIN_PX}px`,
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: "10pt",
          lineHeight: "1.2",
          whiteSpace: "normal",
        }}
      >
        {units.map((u) => (
          <div key={`measure-${u.key}`}>{u.render()}</div>
        ))}
      </div>

      {/* Visible multi-page render inside a wrapper with id="resume-preview" */}
      <div id="resume-preview">
        {pages.map((pageUnitIndexes, pageIndex) => (
          <div
            key={`page-${pageIndex}`}
            className="bg-white text-black shadow-lg mb-8 print:shadow-none print:mb-0 resume-page"
            style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              width: `${A4_WIDTH_MM}mm`,
              height: "297mm",
              margin: "0 auto",
              padding: `${TOP_MARGIN_PX}px ${RIGHT_MARGIN_PX}px ${BOTTOM_MARGIN_PX}px ${LEFT_MARGIN_PX}px`,
              fontSize: "10pt",
              lineHeight: "1.2",
              color: "#000000",
              boxSizing: "border-box",
              overflow: "hidden",
              position: "relative",
              textAlign: "left",
              textJustify: "none",
              wordSpacing: "normal",
              letterSpacing: "normal",
              whiteSpace: "normal",
              textRendering: "geometricPrecision",
              WebkitFontSmoothing: "subpixel-antialiased",
              MozOsxFontSmoothing: "auto",
              fontKerning: "normal",
              fontVariantLigatures: "none",
              fontFeatureSettings: "normal",
              textSizeAdjust: "none",
              WebkitTextSizeAdjust: "none",
              MozTextSizeAdjust: "none",
            }}
          >
            {pageUnitIndexes.map((uIdx) => {
              const unit = units[uIdx]
              return unit && typeof unit.render === "function" ? (
                <div key={unit.key}>{unit.render()}</div>
              ) : null
            })}

            {/* Page number footer */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                bottom: 8,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "8pt",
                color: "#555",
              }}
            >
              Page {pageIndex + 1} of {pages.length}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
