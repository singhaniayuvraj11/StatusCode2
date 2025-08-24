import type { ResumeData } from "@/app/page"
import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, TabStopPosition, TabStopType } from "docx"

// Perfect Word (.docx) generator that matches Live Preview exactly
export async function generateHTMLToDOCX(resumeData: ResumeData) {
  try {
    // Show loading indicator
    const loadingToast = showToast("Generating Word document...", "#333")

    // Wait for fonts and images to load
    await document.fonts.ready
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Generate the perfect Word document
    await generatePerfectWordDocument(resumeData)

    // Clean up loading indicator
    hideToast(loadingToast)

    // Show success message
    showToast("Word document generated successfully!", "#28a745", 3000)
  } catch (error) {
    console.error("Error generating Word document:", error)
    alert(`Error generating Word document: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Helper functions for toast notifications
function showToast(message: string, backgroundColor: string, duration?: number): HTMLElement {
  const toast = document.createElement("div")
  toast.textContent = message
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${backgroundColor};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 9999;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `
  document.body.appendChild(toast)

  if (duration) {
    setTimeout(() => hideToast(toast), duration)
  }

  return toast
}

function hideToast(toast: HTMLElement) {
  if (document.body.contains(toast)) {
    document.body.removeChild(toast)
  }
}

// Custom file download function
function downloadFile(content: Blob, filename: string) {
  const url = URL.createObjectURL(content)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.style.display = "none"

  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Generate perfect Word document that matches Live Preview exactly
async function generatePerfectWordDocument(resumeData: ResumeData): Promise<void> {
  const children: Paragraph[] = []

  // HEADER SECTION - Exact match to Live Preview
  // Name (20pt, bold, uppercase, centered, with letter spacing)
  if (resumeData.personalInfo.name) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resumeData.personalInfo.name.toUpperCase(),
            bold: true,
            size: 40, // 20pt = 40 half-points
            font: "Arial",
            characterSpacing: 40, // Letter spacing equivalent to 2px
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 0 },
      }),
    )
  }

  // Location (11pt, centered)
  if (resumeData.personalInfo.location) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resumeData.personalInfo.location,
            size: 22, // 11pt = 22 half-points
            font: "Arial",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 }, // 8pt spacing
      }),
    )
  }

  // Contact Information - EXACT match to live preview layout
  const contactParts: string[] = []

  if (resumeData.personalInfo.phone) {
    contactParts.push(`📞 ${resumeData.personalInfo.phone}`)
  }

  if (resumeData.personalInfo.email) {
    contactParts.push(`✉️ ${resumeData.personalInfo.email}`)
  }

  if (resumeData.personalInfo.linkedin) {
    contactParts.push(`💼 ${resumeData.personalInfo.linkedin}`)
  }

  if (resumeData.personalInfo.github) {
    contactParts.push(`🔗 ${resumeData.personalInfo.github}`)
  }

  if (resumeData.personalInfo.leetcode) {
    contactParts.push(`💻 leetcode`)
  }

  // Join contact parts with proper spacing to match live preview
  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactParts.join("    "), // 4 spaces between each contact item
            size: 20, // 10pt
            font: "Arial",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 }, // 8pt spacing
      }),
    )
  }

  // EDUCATION SECTION
  if (resumeData.education.length > 0) {
    children.push(createSectionHeader("EDUCATION"))

    resumeData.education.forEach((edu) => {
      // Institution name and duration (two-column layout)
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.institution,
              bold: true,
              size: 22, // 11pt
              font: "Arial",
            }),
            new TextRun({
              text: "\t" + edu.duration,
              bold: true,
              size: 20, // 10pt
              font: "Arial",
            }),
          ],
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: TabStopPosition.MAX,
            },
          ],
          spacing: { after: 40 }, // 2pt spacing
        }),
      )

      // Degree and grade with location
      let degreeText = edu.degree
      if (edu.gradeFormat && edu.gradeValue) {
        const gradeValue =
          edu.gradeFormat === "Percentage" && !edu.gradeValue.endsWith("%") ? `${edu.gradeValue}%` : edu.gradeValue
        degreeText += `; ${edu.gradeFormat}: ${gradeValue}`
      }

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: degreeText,
              size: 20, // 10pt
              font: "Arial",
            }),
            new TextRun({
              text: "\t" + edu.location,
              italics: true,
              size: 20, // 10pt
              font: "Arial",
            }),
          ],
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: TabStopPosition.MAX,
            },
          ],
          spacing: { after: 160 }, // 8pt spacing between items
        }),
      )
    })
  }

  // TECHNICAL SKILLS SECTION
  if (resumeData.technicalSkills.length > 0) {
    children.push(createSectionHeader("TECHNICAL SKILLS"))

    resumeData.technicalSkills.forEach((skill) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${skill.category}: `,
              bold: true,
              size: 20, // 10pt
              font: "Arial",
            }),
            new TextRun({
              text: skill.skills,
              size: 20, // 10pt
              font: "Arial",
            }),
          ],
          spacing: { after: 40 }, // 2pt spacing
        }),
      )
    })
  }

  // PROFESSIONAL EXPERIENCE SECTION
  if (resumeData.experience.length > 0) {
    children.push(createSectionHeader("PROFESSIONAL EXPERIENCE"))

    resumeData.experience.forEach((exp) => {
      // Company and Duration
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.company,
              bold: true,
              size: 22, // 11pt
              font: "Arial",
            }),
            new TextRun({
              text: "\t" + exp.duration,
              bold: true,
              size: 20, // 10pt
              font: "Arial",
            }),
          ],
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: TabStopPosition.MAX,
            },
          ],
          spacing: { after: 40 },
        }),
      )

      // Position and Location
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.position,
              bold: true,
              size: 20, // 10pt
              font: "Arial",
            }),
            new TextRun({
              text: "\t" + exp.location,
              italics: true,
              size: 20, // 10pt
              font: "Arial",
            }),
          ],
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: TabStopPosition.MAX,
            },
          ],
          spacing: { after: 80 }, // 4pt spacing
        }),
      )

      // Description with perfect bullet points
      if (exp.description) {
        const descriptions = exp.description.split("\n")
        descriptions.forEach((desc) => {
          if (desc.trim()) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${desc.replace(/^•\s*/, "")}`,
                    size: 20, // 10pt
                    font: "Arial",
                  }),
                ],
                spacing: { after: 40 }, // 2pt spacing
                indent: { left: 240, hanging: 240 }, // Perfect bullet indentation
              }),
            )
          }
        })
      }

      // Spacing between experience items
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "", size: 20 })],
          spacing: { after: 160 }, // 8pt spacing
        }),
      )
    })
  }

  // PROJECTS SECTION
  if (resumeData.projects.length > 0) {
    children.push(createSectionHeader("PROJECTS"))

    resumeData.projects.forEach((project) => {
      // Project Title with Links
      let titleText = project.title
      if (project.links) {
        titleText += ` | ${project.links}`
      }

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: titleText,
              bold: true,
              size: 22, // 11pt
              font: "Arial",
            }),
          ],
          spacing: { after: 40 },
        }),
      )

      // Technologies
      if (project.technologies) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: project.technologies,
                size: 20, // 10pt
                font: "Arial",
              }),
            ],
            spacing: { after: 80 }, // 4pt spacing
          }),
        )
      }

      // Description with bullet points
      if (project.description) {
        const descriptions = project.description.split("\n")
        descriptions.forEach((desc) => {
          if (desc.trim()) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${desc.replace(/^•\s*/, "")}`,
                    size: 20, // 10pt
                    font: "Arial",
                  }),
                ],
                spacing: { after: 40 },
                indent: { left: 240, hanging: 240 }, // Perfect bullet indentation
              }),
            )
          }
        })
      }

      // Spacing between project items
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "", size: 20 })],
          spacing: { after: 160 },
        }),
      )
    })
  }

  // ACHIEVEMENTS SECTION
  if (resumeData.achievements.length > 0) {
    children.push(createSectionHeader("ACHIEVEMENTS"))

    resumeData.achievements.forEach((achievement) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: achievement.title,
              bold: true,
              size: 22, // 11pt
              font: "Arial",
            }),
          ],
          spacing: { after: 40 },
        }),
      )

      if (achievement.description) {
        const descriptions = achievement.description.split("\n")
        descriptions.forEach((desc) => {
          if (desc.trim()) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${desc.replace(/^•\s*/, "")}`,
                    size: 20, // 10pt
                    font: "Arial",
                  }),
                ],
                spacing: { after: 40 },
                indent: { left: 240, hanging: 240 },
              }),
            )
          }
        })
      }

      children.push(
        new Paragraph({
          children: [new TextRun({ text: "", size: 20 })],
          spacing: { after: 160 },
        }),
      )
    })
  }

  // EXTRACURRICULARS SECTION
  if (resumeData.extracurriculars.length > 0) {
    children.push(createSectionHeader("EXTRACURRICULARS"))

    resumeData.extracurriculars.forEach((extra) => {
      // Organization and Duration
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: extra.organization,
              bold: true,
              size: 22, // 11pt
              font: "Arial",
            }),
            new TextRun({
              text: "\t" + extra.duration,
              bold: true,
              size: 20, // 10pt
              font: "Arial",
            }),
          ],
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: TabStopPosition.MAX,
            },
          ],
          spacing: { after: 40 },
        }),
      )

      // Designation
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: extra.designation,
              bold: true,
              size: 20, // 10pt
              font: "Arial",
            }),
          ],
          spacing: { after: 80 },
        }),
      )

      // Description with bullet points
      if (extra.description) {
        const descriptions = extra.description.split("\n")
        descriptions.forEach((desc) => {
          if (desc.trim()) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${desc.replace(/^•\s*/, "")}`,
                    size: 20, // 10pt
                    font: "Arial",
                  }),
                ],
                spacing: { after: 40 },
                indent: { left: 240, hanging: 240 },
              }),
            )
          }
        })
      }

      children.push(
        new Paragraph({
          children: [new TextRun({ text: "", size: 20 })],
          spacing: { after: 160 },
        }),
      )
    })
  }

  // CUSTOM SECTIONS
  resumeData.customSections.forEach((customSection) => {
    if (customSection.title && customSection.items.length > 0) {
      children.push(createSectionHeader(customSection.title.toUpperCase()))

      customSection.items.forEach((item) => {
        // Item Title and Duration
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: item.title,
                bold: true,
                size: 22, // 11pt
                font: "Arial",
              }),
              ...(item.duration
                ? [
                    new TextRun({
                      text: "\t" + item.duration,
                      bold: true,
                      size: 20, // 10pt
                      font: "Arial",
                    }),
                  ]
                : []),
            ],
            tabStops: item.duration
              ? [
                  {
                    type: TabStopType.RIGHT,
                    position: TabStopPosition.MAX,
                  },
                ]
              : [],
            spacing: { after: 40 },
          }),
        )

        // Subtitle and Location
        if (item.subtitle || item.location) {
          children.push(
            new Paragraph({
              children: [
                ...(item.subtitle
                  ? [
                      new TextRun({
                        text: item.subtitle,
                        italics: true,
                        size: 20, // 10pt
                        font: "Arial",
                      }),
                    ]
                  : []),
                ...(item.location
                  ? [
                      new TextRun({
                        text: item.subtitle ? "\t" + item.location : item.location,
                        italics: true,
                        size: 20, // 10pt
                        font: "Arial",
                      }),
                    ]
                  : []),
              ],
              tabStops:
                item.subtitle && item.location
                  ? [
                      {
                        type: TabStopType.RIGHT,
                        position: TabStopPosition.MAX,
                      },
                    ]
                  : [],
              spacing: { after: 80 },
            }),
          )
        }

        // Description with bullet points
        if (item.description) {
          const descriptions = item.description.split("\n")
          descriptions.forEach((desc) => {
            if (desc.trim()) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${desc.replace(/^•\s*/, "")}`,
                      size: 20, // 10pt
                      font: "Arial",
                    }),
                  ],
                  spacing: { after: 40 },
                  indent: { left: 240, hanging: 240 },
                }),
              )
            }
          })
        }

        children.push(
          new Paragraph({
            children: [new TextRun({ text: "", size: 20 })],
            spacing: { after: 160 },
          }),
        )
      })
    }
  })

  // Create the document with perfect A4 formatting
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 inch (10mm)
              right: 432, // 0.3 inch (6mm)
              bottom: 1080, // 0.75 inch (15mm)
              left: 576, // 0.4 inch (8mm)
            },
          },
        },
        children: children,
      },
    ],
  })

  // Generate and download the document
  const buffer = await Packer.toBuffer(doc)
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  })

  const fileName = resumeData.personalInfo.name
    ? `${resumeData.personalInfo.name.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_")}_Resume.docx`
    : "Resume.docx"

  downloadFile(blob, fileName)
}

// Helper function to create section headers with underlines
function createSectionHeader(title: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 24, // 12pt
        font: "Arial",
      }),
    ],
    spacing: { before: 160, after: 160 }, // 8pt spacing before and after
    border: {
      bottom: {
        color: "000000",
        space: 1,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
  })
}
