import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx"
import * as FileSaver from "file-saver"
import type { ResumeData } from "@/app/page"

// Text sanitization function
const sanitizeText = (text: string, maxLength = 1000): string => {
  if (!text) return ""
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control characters
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim()
    .substring(0, maxLength)
}

// Content limits to prevent memory issues
const CONTENT_LIMITS = {
  education: 10,
  technicalSkills: 15,
  projects: 8,
  experience: 8,
  achievements: 10,
  extracurriculars: 8,
  customSections: 5,
}

export async function generateDOCX(resumeData: ResumeData): Promise<void> {
  try {
    console.log("Starting DOCX generation...")

    const children: Paragraph[] = []

    // Header Section
    try {
      if (resumeData.personalInfo.name) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: sanitizeText(resumeData.personalInfo.name, 100),
                bold: true,
                size: 32,
                allCaps: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
        )
      }

      if (resumeData.personalInfo.location) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: sanitizeText(resumeData.personalInfo.location, 100),
                size: 22,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
        )
      }

      // Contact information
      const contactInfo: string[] = []
      if (resumeData.personalInfo.phone) contactInfo.push(sanitizeText(resumeData.personalInfo.phone, 50))
      if (resumeData.personalInfo.email) contactInfo.push(sanitizeText(resumeData.personalInfo.email, 100))
      if (resumeData.personalInfo.linkedin)
        contactInfo.push(`LinkedIn: ${sanitizeText(resumeData.personalInfo.linkedin, 50)}`)
      if (resumeData.personalInfo.github)
        contactInfo.push(`GitHub: ${sanitizeText(resumeData.personalInfo.github, 50)}`)
      if (resumeData.personalInfo.leetcode)
        contactInfo.push(`LeetCode: ${sanitizeText(resumeData.personalInfo.leetcode, 50)}`)

      if (contactInfo.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: contactInfo.join(" | "),
                size: 20,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),
        )
      }
    } catch (error) {
      console.error("Error generating header:", error)
    }

    // Education Section
    try {
      if (resumeData.education.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "EDUCATION",
                bold: true,
                size: 24,
                allCaps: true,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            border: {
              bottom: {
                color: "000000",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
          }),
        )

        const limitedEducation = resumeData.education.slice(0, CONTENT_LIMITS.education)
        limitedEducation.forEach((edu) => {
          try {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: sanitizeText(edu.institution, 200),
                    bold: true,
                    size: 22,
                  }),
                  new TextRun({
                    text: `\t${sanitizeText(edu.duration, 50)}`,
                    bold: true,
                    size: 20,
                  }),
                ],
                spacing: { after: 50 },
              }),
            )

            let degreeText = sanitizeText(edu.degree, 300)
            if (edu.gradeFormat && edu.gradeValue) {
              degreeText += `; ${edu.gradeFormat}: ${sanitizeText(edu.gradeValue, 20)}`
            }

            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: degreeText,
                    size: 20,
                  }),
                  new TextRun({
                    text: `\t${sanitizeText(edu.location, 100)}`,
                    italics: true,
                    size: 20,
                  }),
                ],
                spacing: { after: 150 },
              }),
            )
          } catch (error) {
            console.error("Error processing education entry:", error)
          }
        })
      }
    } catch (error) {
      console.error("Error generating education section:", error)
    }

    // Technical Skills Section
    try {
      if (resumeData.technicalSkills.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "TECHNICAL SKILLS",
                bold: true,
                size: 24,
                allCaps: true,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            border: {
              bottom: {
                color: "000000",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
          }),
        )

        const limitedSkills = resumeData.technicalSkills.slice(0, CONTENT_LIMITS.technicalSkills)
        limitedSkills.forEach((skill) => {
          try {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${sanitizeText(skill.category, 100)}: `,
                    bold: true,
                    size: 20,
                  }),
                  new TextRun({
                    text: sanitizeText(skill.skills, 500),
                    size: 20,
                  }),
                ],
                spacing: { after: 50 },
              }),
            )
          } catch (error) {
            console.error("Error processing skill entry:", error)
          }
        })
      }
    } catch (error) {
      console.error("Error generating skills section:", error)
    }

    // Professional Experience Section
    try {
      if (resumeData.experience.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "PROFESSIONAL EXPERIENCE",
                bold: true,
                size: 24,
                allCaps: true,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            border: {
              bottom: {
                color: "000000",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
          }),
        )

        const limitedExperience = resumeData.experience.slice(0, CONTENT_LIMITS.experience)
        limitedExperience.forEach((exp) => {
          try {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: sanitizeText(exp.company, 200),
                    bold: true,
                    size: 22,
                  }),
                  new TextRun({
                    text: `\t${sanitizeText(exp.duration, 50)}`,
                    bold: true,
                    size: 20,
                  }),
                ],
                spacing: { after: 50 },
              }),
            )

            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: sanitizeText(exp.position, 200),
                    bold: true,
                    size: 20,
                  }),
                  new TextRun({
                    text: `\t${sanitizeText(exp.location, 100)}`,
                    italics: true,
                    size: 20,
                  }),
                ],
                spacing: { after: 100 },
              }),
            )

            if (exp.description) {
              const descriptions = sanitizeText(exp.description, 1000).split("\n")
              descriptions.forEach((desc) => {
                if (desc.trim()) {
                  children.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `• ${desc.replace(/^•\s*/, "")}`,
                          size: 20,
                        }),
                      ],
                      spacing: { after: 50 },
                    }),
                  )
                }
              })
            }

            children.push(
              new Paragraph({
                children: [new TextRun({ text: "", size: 20 })],
                spacing: { after: 100 },
              }),
            )
          } catch (error) {
            console.error("Error processing experience entry:", error)
          }
        })
      }
    } catch (error) {
      console.error("Error generating experience section:", error)
    }

    // Projects Section
    try {
      if (resumeData.projects.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "PROJECTS",
                bold: true,
                size: 24,
                allCaps: true,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            border: {
              bottom: {
                color: "000000",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
          }),
        )

        const limitedProjects = resumeData.projects.slice(0, CONTENT_LIMITS.projects)
        limitedProjects.forEach((project) => {
          try {
            let titleText = sanitizeText(project.title, 200)
            if (project.links) {
              const links = sanitizeText(project.links, 200)
              titleText += ` | ${links}`
            }

            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: titleText,
                    bold: true,
                    size: 22,
                  }),
                ],
                spacing: { after: 50 },
              }),
            )

            if (project.technologies) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: sanitizeText(project.technologies, 300),
                      size: 20,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
              )
            }

            if (project.description) {
              const descriptions = sanitizeText(project.description, 1000).split("\n")
              descriptions.forEach((desc) => {
                if (desc.trim()) {
                  children.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `• ${desc.replace(/^•\s*/, "")}`,
                          size: 20,
                        }),
                      ],
                      spacing: { after: 50 },
                    }),
                  )
                }
              })
            }

            children.push(
              new Paragraph({
                children: [new TextRun({ text: "", size: 20 })],
                spacing: { after: 100 },
              }),
            )
          } catch (error) {
            console.error("Error processing project entry:", error)
          }
        })
      }
    } catch (error) {
      console.error("Error generating projects section:", error)
    }

    // Achievements Section
    try {
      if (resumeData.achievements.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "ACHIEVEMENTS",
                bold: true,
                size: 24,
                allCaps: true,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            border: {
              bottom: {
                color: "000000",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
          }),
        )

        const limitedAchievements = resumeData.achievements.slice(0, CONTENT_LIMITS.achievements)
        limitedAchievements.forEach((achievement) => {
          try {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: sanitizeText(achievement.title, 200),
                    bold: true,
                    size: 22,
                  }),
                ],
                spacing: { after: 50 },
              }),
            )

            if (achievement.description) {
              const descriptions = sanitizeText(achievement.description, 800).split("\n")
              descriptions.forEach((desc) => {
                if (desc.trim()) {
                  children.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `• ${desc.replace(/^•\s*/, "")}`,
                          size: 20,
                        }),
                      ],
                      spacing: { after: 50 },
                    }),
                  )
                }
              })
            }

            children.push(
              new Paragraph({
                children: [new TextRun({ text: "", size: 20 })],
                spacing: { after: 100 },
              }),
            )
          } catch (error) {
            console.error("Error processing achievement entry:", error)
          }
        })
      }
    } catch (error) {
      console.error("Error generating achievements section:", error)
    }

    // Extracurriculars Section
    try {
      if (resumeData.extracurriculars.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "EXTRACURRICULARS",
                bold: true,
                size: 24,
                allCaps: true,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            border: {
              bottom: {
                color: "000000",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
          }),
        )

        const limitedExtracurriculars = resumeData.extracurriculars.slice(0, CONTENT_LIMITS.extracurriculars)
        limitedExtracurriculars.forEach((extra) => {
          try {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: sanitizeText(extra.organization, 200),
                    bold: true,
                    size: 22,
                  }),
                  new TextRun({
                    text: `\t${sanitizeText(extra.duration, 50)}`,
                    bold: true,
                    size: 20,
                  }),
                ],
                spacing: { after: 50 },
              }),
            )

            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: sanitizeText(extra.designation, 200),
                    bold: true,
                    size: 20,
                  }),
                ],
                spacing: { after: 100 },
              }),
            )

            if (extra.description) {
              const descriptions = sanitizeText(extra.description, 800).split("\n")
              descriptions.forEach((desc) => {
                if (desc.trim()) {
                  children.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `• ${desc.replace(/^•\s*/, "")}`,
                          size: 20,
                        }),
                      ],
                      spacing: { after: 50 },
                    }),
                  )
                }
              })
            }

            children.push(
              new Paragraph({
                children: [new TextRun({ text: "", size: 20 })],
                spacing: { after: 100 },
              }),
            )
          } catch (error) {
            console.error("Error processing extracurricular entry:", error)
          }
        })
      }
    } catch (error) {
      console.error("Error generating extracurriculars section:", error)
    }

    // Custom Sections
    try {
      const limitedCustomSections = resumeData.customSections.slice(0, CONTENT_LIMITS.customSections)
      limitedCustomSections.forEach((customSection) => {
        try {
          if (customSection.title && customSection.items.length > 0) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: sanitizeText(customSection.title, 100).toUpperCase(),
                    bold: true,
                    size: 24,
                    allCaps: true,
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
                border: {
                  bottom: {
                    color: "000000",
                    space: 1,
                    style: BorderStyle.SINGLE,
                    size: 6,
                  },
                },
              }),
            )

            customSection.items.forEach((item) => {
              try {
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: sanitizeText(item.title, 200),
                        bold: true,
                        size: 22,
                      }),
                      ...(item.duration
                        ? [
                            new TextRun({
                              text: `\t${sanitizeText(item.duration, 50)}`,
                              bold: true,
                              size: 20,
                            }),
                          ]
                        : []),
                    ],
                    spacing: { after: 50 },
                  }),
                )

                if (item.subtitle) {
                  children.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: sanitizeText(item.subtitle, 200),
                          italics: true,
                          size: 20,
                        }),
                        ...(item.location
                          ? [
                              new TextRun({
                                text: `\t${sanitizeText(item.location, 100)}`,
                                italics: true,
                                size: 20,
                              }),
                            ]
                          : []),
                      ],
                      spacing: { after: 100 },
                    }),
                  )
                }

                if (item.description) {
                  const descriptions = sanitizeText(item.description, 800).split("\n")
                  descriptions.forEach((desc) => {
                    if (desc.trim()) {
                      children.push(
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `• ${desc.replace(/^•\s*/, "")}`,
                              size: 20,
                            }),
                          ],
                          spacing: { after: 50 },
                        }),
                      )
                    }
                  })
                }

                children.push(
                  new Paragraph({
                    children: [new TextRun({ text: "", size: 20 })],
                    spacing: { after: 100 },
                  }),
                )
              } catch (error) {
                console.error("Error processing custom section item:", error)
              }
            })
          }
        } catch (error) {
          console.error("Error processing custom section:", error)
        }
      })
    } catch (error) {
      console.error("Error generating custom sections:", error)
    }

    console.log("Creating document...")
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    })

    console.log("Generating buffer...")
    const buffer = await Packer.toBuffer(doc)

    console.log("Saving file...")
    const fileName = resumeData.personalInfo.name
      ? `${sanitizeText(resumeData.personalInfo.name, 50).replace(/[^a-zA-Z0-9]/g, "_")}_Resume.docx`
      : "Resume.docx"

    FileSaver.saveAs(new Blob([buffer]), fileName)
    console.log("DOCX generation completed successfully!")
  } catch (error) {
    console.error("Error generating DOCX:", error)
    alert("Failed to generate Word document. Please try reducing the amount of content or contact support.")
  }
}
