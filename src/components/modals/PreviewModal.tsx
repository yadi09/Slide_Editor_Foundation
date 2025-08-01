import React from 'react'
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import type { Slide, SlideElement } from '@/types'
import { ErrorBoundary } from '@/components/common'

interface PreviewModalProps {
  slides: Slide[]
  onClose: () => void
}

// Validation function
const validateSlides = (slides: Slide[]): string | null => {
  if (!slides || !Array.isArray(slides)) {
    return "Invalid slides data"
  }
  if (slides.length === 0) {
    return "No slides to preview"
  }
  return null
}

// Error fallback component
const PreviewErrorFallback: React.FC = () => (
  <div className="fixed inset-0 w-screen h-screen bg-black/95 z-[2147483647] flex items-center justify-center">
    <div className="text-white text-center">
      <div className="text-red-400 mb-4">
        <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium mb-2">Error loading preview</h3>
      <p className="text-gray-300 mb-4">Unable to display presentation preview</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
)

// Extracted element renderer components
const StaticTextElement: React.FC<{ element: SlideElement }> = ({ element }) => {
  const baseStyle = {
    position: "absolute" as const,
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    zIndex: element.zIndex || 0,
    pointerEvents: "none" as const,
  }

  return (
    <div
      style={{
        ...baseStyle,
        display: "flex",
        alignItems: "center",
        color: element.style?.color || "#000000",
        fontSize: `${element.style?.fontSize || 16}px`,
        fontWeight: element.style?.fontWeight || "normal",
        fontStyle: element.style?.fontStyle || "normal",
        textDecoration: element.style?.textDecoration || "none",
        textAlign: element.style?.textAlign || "left",
        padding: "4px",
        userSelect: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word" as const,
          pointerEvents: "none",
        }}
      >
        {element.content}
      </div>
    </div>
  )
}

const StaticImageElement: React.FC<{ element: SlideElement }> = ({ element }) => {
  if (!element.content) return null

  const baseStyle = {
    position: "absolute" as const,
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    zIndex: element.zIndex || 0,
    pointerEvents: "none" as const,
  }

  return (
    <img
      src={element.content}
      alt="Slide element"
      style={{
        ...baseStyle,
        objectFit: "cover",
        borderRadius: `${element.style?.borderRadius || 0}px`,
        userSelect: "none",
      }}
      onError={(e) => {
        console.error('Failed to load image:', element.content)
        e.currentTarget.style.display = 'none'
      }}
    />
  )
}

const StaticShapeElement: React.FC<{ element: SlideElement }> = ({ element }) => {
  const shapeType = element.content || "rectangle"
  const baseStyle = {
    position: "absolute" as const,
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    zIndex: element.zIndex || 0,
    pointerEvents: "none" as const,
  }

  if (shapeType === "triangle") {
    return (
      <div
        style={{
          ...baseStyle,
          width: 0,
          height: 0,
          borderLeft: `${element.width / 2}px solid transparent`,
          borderRight: `${element.width / 2}px solid transparent`,
          borderBottom: `${element.height}px solid ${element.style?.backgroundColor || "#4285f4"}`,
          backgroundColor: "transparent",
        }}
      />
    )
  }

  if (shapeType === "star") {
    return (
      <div
        style={{
          ...baseStyle,
          backgroundColor: element.style?.backgroundColor || "#4285f4",
          clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
        }}
      />
    )
  }

  return (
    <div
      style={{
        ...baseStyle,
        backgroundColor: element.style?.backgroundColor || "#4285f4",
        borderRadius: shapeType === "circle" ? "50%" : element.style?.borderRadius || "8px",
        transform: shapeType === "diamond" ? "rotate(45deg)" : "none",
      }}
    />
  )
}

// Main renderer function
const renderStaticElement = (element: SlideElement) => {
  switch (element.type) {
    case "text":
      return <StaticTextElement key={element.id} element={element} />
    case "image":
      return <StaticImageElement key={element.id} element={element} />
    case "shape":
      return <StaticShapeElement key={element.id} element={element} />
    default:
      console.warn(`Unknown element type: ${element.type}`)
      return null
  }
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ slides, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const currentSlide = slides[currentIndex]

  // Validate slides on mount
  useEffect(() => {
    const error = validateSlides(slides)
    if (error) {
      console.error('PreviewModal validation error:', error)
      setValidationError(error)
    } else {
      setValidationError(null)
    }
  }, [slides])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.key === "ArrowRight" || e.key === " ") {
      nextSlide()
    }
    if (e.key === "ArrowLeft") {
      prevSlide()
    }
    if (e.key === "Escape") {
      onClose()
    }
  }

  useEffect(() => {
    setMounted(true)

    // Add event listeners
    document.addEventListener("keydown", handleKeyDown, true)

    // Completely disable all interactions with the background
    const originalOverflow = document.body.style.overflow
    const originalPosition = document.body.style.position
    const originalPointerEvents = document.body.style.pointerEvents

    document.body.style.overflow = "hidden"
    document.body.style.position = "fixed"
    document.body.style.width = "100%"
    document.body.style.height = "100%"
    document.body.style.top = "0"
    document.body.style.left = "0"

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true)
      document.body.style.overflow = originalOverflow
      document.body.style.position = originalPosition
      document.body.style.pointerEvents = originalPointerEvents
      document.body.style.width = ""
      document.body.style.height = ""
      document.body.style.top = ""
      document.body.style.left = ""
    }
  }, [])

  if (!mounted) return null

  if (validationError) {
    return (
      <ErrorBoundary fallback={PreviewErrorFallback}>
        <div className="fixed inset-0 w-screen h-screen bg-black/95 z-[2147483647] flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-red-400 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Invalid presentation data</h3>
            <p className="text-gray-300 mb-4">{validationError}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  const modalContent = (
    <ErrorBoundary fallback={PreviewErrorFallback}>
      <div
        className="fixed inset-0 w-screen h-screen bg-black/95 z-[2147483647] flex items-center justify-center"
        role="dialog"
        aria-label="Presentation preview"
        aria-modal="true"
        tabIndex={-1}
      >
        {/* Close button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onClose()
          }}
          className="absolute top-5 right-5 z-[2147483647] bg-white/10 border-none text-white cursor-pointer p-3 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Close preview"
        >
          <X size={24} />
        </button>

        {/* Navigation */}
        {slides.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                prevSlide()
              }}
              disabled={currentIndex === 0}
              className={`absolute left-5 z-[2147483647] bg-white/10 border-none text-white cursor-pointer p-3 rounded-full transition-all ${
                currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/20'
              }`}
              aria-label="Previous slide"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                nextSlide()
              }}
              disabled={currentIndex === slides.length - 1}
              className={`absolute right-5 z-[2147483647] bg-white/10 border-none text-white cursor-pointer p-3 rounded-full transition-all ${
                currentIndex === slides.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/20'
              }`}
              aria-label="Next slide"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Slide counter */}
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 text-white text-base bg-black/70 px-4 py-2 rounded-full z-[2147483647] pointer-events-none">
          {currentIndex + 1} / {slides.length}
        </div>

        {/* Static slide content - completely non-interactive */}
        <div
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          className="w-[960px] h-[540px] bg-white rounded-lg shadow-2xl relative overflow-hidden pointer-events-none"
          style={{
            backgroundColor: currentSlide?.backgroundColor || "white",
          }}
        >
          {currentSlide && (
            <div className="w-full h-full relative pointer-events-none">
              {/* Render static elements - no react-rnd, no interactions */}
              {currentSlide.elements
                .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                .map((element) => renderStaticElement(element))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-white/80 text-sm text-center z-[2147483647] pointer-events-none">
          Use arrow keys to navigate • Press ESC to exit
        </div>
      </div>
    </ErrorBoundary>
  )

  return createPortal(modalContent, document.body)
}
