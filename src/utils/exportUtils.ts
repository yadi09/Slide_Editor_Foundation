import type { Slide } from "../types"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { showToast } from "./toastUtils"

// Utility function to download data as file
export const downloadFile = (data: string, filename: string, type: string) => {
  const blob = new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// html2canvas + jsPDF as the primary method
export const exportToPDF = async (slides: Slide[], filename: string): Promise<void> => {
  try {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
      format: [960, 540],
      compress: true,
  })

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]

    // Create a temporary container for the slide
    const container = document.createElement("div")
      container.style.cssText = `
        width: 960px;
        height: 540px;
        position: absolute;
        left: -9999px;
        top: 0;
        background-color: ${slide.backgroundColor || "#ffffff"};
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        overflow: hidden;
        box-sizing: border-box;
      `

      // Render slide elements with exact positioning
      slide.elements
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
        .forEach((element) => {
          const elementDiv = document.createElement("div")
          elementDiv.style.cssText = `
            position: absolute;
            left: ${element.x}px;
            top: ${element.y}px;
            width: ${element.width}px;
            height: ${element.height}px;
            z-index: ${element.zIndex || 0};
            box-sizing: border-box;
          `

          if (element.type === "text") {
            const textContent = (element.content || "").replace(/\n/g, "<br>")
            elementDiv.innerHTML = textContent
            elementDiv.style.cssText += `
              color: ${element.style?.color || "#000000"};
              font-size: ${element.style?.fontSize || 16}px;
              font-weight: ${element.style?.fontWeight || "normal"};
              font-style: ${element.style?.fontStyle || "normal"};
              text-decoration: ${element.style?.textDecoration || "none"};
              text-align: ${element.style?.textAlign || "left"};
              display: flex;
              align-items: center;
              padding: 4px;
              line-height: 1.2;
              word-wrap: break-word;
              overflow: hidden;
            `
          } else if (element.type === "image" && element.content) {
            const img = document.createElement("img")
            img.src = element.content
            img.style.cssText = `
              width: 100%;
              height: 100%;
              object-fit: cover;
              border-radius: ${element.style?.borderRadius || 0}px;
              display: block;
            `
            img.crossOrigin = "anonymous"
            elementDiv.appendChild(img)
          } else if (element.type === "shape") {
            const shapeType = element.content || "rectangle"
            const backgroundColor = element.style?.backgroundColor || "#4285f4"

            if (shapeType === "triangle") {
              elementDiv.style.cssText += `
                width: 0;
                height: 0;
                border-left: ${element.width / 2}px solid transparent;
                border-right: ${element.width / 2}px solid transparent;
                border-bottom: ${element.height}px solid ${backgroundColor};
                background-color: transparent;
              `
            } else {
              let borderRadius = "8px"
              let transform = "none"

              if (shapeType === "circle") {
                borderRadius = "50%"
              } else if (shapeType === "diamond") {
                transform = "rotate(45deg)"
                borderRadius = "8px"
              } else {
                borderRadius = `${element.style?.borderRadius || 8}px`
              }

              elementDiv.style.cssText += `
                background-color: ${backgroundColor};
                border-radius: ${borderRadius};
                transform: ${transform};
                transform-origin: center;
              `
            }
          }

          container.appendChild(elementDiv)
        })

      // Add container to DOM
      document.body.appendChild(container)

      try {
        // Wait for images to load
        const images = container.querySelectorAll("img")
        if (images.length > 0) {
          await Promise.all(
            Array.from(images).map(
              (img) =>
                new Promise<void>((resolve) => {
                  if (img.complete) {
                    resolve()
                  } else {
                    img.onload = () => resolve()
                    img.onerror = () => resolve()
                    // Timeout after 5 seconds
                    setTimeout(() => resolve(), 5000)
                  }
                }),
            ),
          )
        }

        // Convert to canvas with high quality settings
        const canvas = await html2canvas(container, {
          width: 960,
          height: 540,
          scale: 2, // High resolution
          useCORS: true,
          allowTaint: true,
          backgroundColor: slide.backgroundColor || "#ffffff",
          logging: false,
          imageTimeout: 10000,
          removeContainer: false,
        })

        // Add page to PDF (landscape orientation)
        if (i > 0) {
          pdf.addPage([960, 540], "landscape")
        }

        // Convert canvas to image and add to PDF
        const imgData = canvas.toDataURL("image/jpeg", 0.95)
        pdf.addImage(imgData, "JPEG", 0, 0, 960, 540, undefined, "FAST")
      } finally {
        // Clean up DOM
        if (container.parentNode) {
          document.body.removeChild(container)
        }
      }
    }

    // Save the PDF
    pdf.save(filename)
  } catch (error) {
    console.error("PDF export error:", error)
    showToast.error("PDF export failed. Please try again.")
    throw new Error(`Export failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
