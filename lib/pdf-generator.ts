import type { ResumeData } from "@/app/page"

export async function generatePDF(resumeData: ResumeData) {
  const element = document.getElementById("resume-preview")
  if (!element) {
    console.error("Resume preview element not found")
    return
  }

  try {
    const html2canvas = (await import("html2canvas")).default
    const jsPDF = (await import("jspdf")).default
    const saveAs = (await import("file-saver")).default

    // Wait for all fonts to load completely
    await document.fonts.ready

    // Additional wait to ensure all content is fully rendered
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Configure html2canvas with optimal settings for natural spacing
    const canvas = await html2canvas(element, {
      scale: 2.5, // Optimal scale for crisp text without over-processing
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      width: element.offsetWidth,
      height: element.offsetHeight,
      windowWidth: element.offsetWidth,
      windowHeight: element.offsetHeight,
      x: 0,
      y: 0,
      // Critical settings for natural text rendering
      letterRendering: true,
      logging: false,
      removeContainer: true,
      imageTimeout: 0,
      // Preserve natural spacing and prevent justification
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById("resume-preview")
        if (clonedElement) {
          // Add comprehensive CSS to prevent spacing distortion
          const style = clonedDoc.createElement("style")
          style.textContent = `
            /* Force natural spacing and prevent justification */
            #resume-preview, #resume-preview * {
              font-family: Arial, Helvetica, sans-serif !important;
              text-align: left !important;
              text-justify: none !important;
              text-align-last: left !important;
              word-spacing: normal !important;
              letter-spacing: normal !important;
              white-space: normal !important;
              line-height: 1.2 !important;
              text-rendering: geometricPrecision !important;
              -webkit-font-smoothing: subpixel-antialiased !important;
              -moz-osx-font-smoothing: auto !important;
              font-kerning: normal !important;
              font-variant-ligatures: none !important;
              font-feature-settings: normal !important;
              text-size-adjust: none !important;
              -webkit-text-size-adjust: none !important;
              -moz-text-size-adjust: none !important;
            }

            /* Prevent any text justification */
            #resume-preview .text-center {
              text-align: center !important;
            }
            
            #resume-preview .text-right {
              text-align: right !important;
            }

            /* Ensure bullet points are properly left-aligned */
            #resume-preview div[style*="text-indent"] {
              text-align: left !important;
              text-justify: none !important;
              white-space: normal !important;
              word-spacing: normal !important;
              letter-spacing: normal !important;
              padding-left: 1em !important;
              text-indent: -1em !important;
              margin: 3px 0 !important;
            }

            /* Prevent flex items from stretching text */
            #resume-preview .flex {
              align-items: flex-start !important;
            }

            /* Ensure proper spacing in contact info */
            #resume-preview .gap-x-4 > * {
              margin-right: 16px !important;
            }

            /* Force consistent line heights */
            #resume-preview h1 { line-height: 1.1 !important; }
            #resume-preview h2 { line-height: 1.2 !important; }
            #resume-preview h3 { line-height: 1.2 !important; }
            #resume-preview p { line-height: 1.2 !important; }
            #resume-preview div { line-height: 1.2 !important; }
          `
          clonedDoc.head.appendChild(style)

          // Process all text-containing elements to ensure natural spacing
          const allElements = clonedElement.querySelectorAll("*")
          allElements.forEach((el: any) => {
            if (el.style) {
              // Force left alignment for all text except explicitly centered/right-aligned
              if (!el.classList.contains("text-center") && !el.classList.contains("text-right")) {
                el.style.textAlign = "left"
              }

              // Prevent any justification
              el.style.textJustify = "none"
              el.style.textAlignLast = "left"

              // Ensure natural spacing
              el.style.wordSpacing = "normal"
              el.style.letterSpacing = el.style.letterSpacing || "normal"
              el.style.whiteSpace = "normal"

              // Prevent font rendering issues
              el.style.fontKerning = "normal"
              el.style.fontVariantLigatures = "none"
              el.style.fontFeatureSettings = "normal"

              // Force Arial font
              el.style.fontFamily = "Arial, Helvetica, sans-serif"
            }
          })

          // Special handling for bullet points
          const bulletPoints = clonedElement.querySelectorAll('div[style*="text-indent"]')
          bulletPoints.forEach((bullet: any) => {
            bullet.style.textAlign = "left"
            bullet.style.textJustify = "none"
            bullet.style.wordSpacing = "normal"
            bullet.style.letterSpacing = "normal"
            bullet.style.whiteSpace = "normal"
            bullet.style.paddingLeft = "1em"
            bullet.style.textIndent = "-1em"
          })
        }
      },
    })

    // Create PDF with precise settings
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: false, // No compression to preserve exact spacing
      precision: 16,
      putOnlyUsedFonts: true,
      floatPrecision: 16,
    })

    const pdfWidth = 210 // A4 width in mm
    const pdfHeight = 297 // A4 height in mm

    // Convert to PNG with maximum quality
    const imgData = canvas.toDataURL("image/png", 1.0)

    // Add image with no compression to preserve spacing
    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      pdfWidth,
      pdfHeight,
      undefined,
      "NONE", // No compression
    )

    // Set PDF metadata
    pdf.setProperties({
      title: `${resumeData.personalInfo.name || "Resume"}`,
      subject: "Professional Resume",
      author: resumeData.personalInfo.name || "Resume Builder User",
      creator: "Resume Builder - Natural Spacing",
      producer: "Resume Builder PDF Generator v3.0",
      keywords: "resume, cv, professional",
    })

    // Generate filename
    const fileName = resumeData.personalInfo.name
      ? `${resumeData.personalInfo.name.replace(/\s+/g, "_")}_Resume.pdf`
      : "Resume.pdf"

    // Save the PDF
    pdf.save(fileName)
  } catch (error) {
    console.error("Error generating PDF:", error)
    alert("Error generating PDF. Please try again.")
  }
}
