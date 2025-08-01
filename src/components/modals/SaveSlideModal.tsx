import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Save, Loader2, AlertCircle } from 'lucide-react'
import type { Slide, SlideElement } from '@/types'
import { ErrorBoundary } from '@/components/common'
import { SaveSlideModalErrorFallback } from '@/components/common'

// Centralized configuration and constants
const SAVE_MODAL_DEFAULTS = {
  maxNameLength: 50,
  previewHeight: 300,
  maxZIndex: 2147483647,
  minNameLength: 1,
} as const

interface SaveSlideModalProps {
  slide: Slide | null
  onSave: (name: string) => void
  onClose: () => void
  isOpen: boolean
}

// Validation function
const validateSlide = (slide: Slide | null): string | null => {
  if (!slide) {
    return "No slide to save"
  }
  if (!slide.elements || !Array.isArray(slide.elements)) {
    return "Invalid slide data"
  }
  if (slide.elements.length === 0) {
    return "Slide has no content to save"
  }
  return null
}

const validateSlideName = (name: string): string | null => {
  if (!name.trim()) {
    return "Please enter a name for the slide"
  }
  if (name.length > SAVE_MODAL_DEFAULTS.maxNameLength) {
    return `Slide name must be ${SAVE_MODAL_DEFAULTS.maxNameLength} characters or less`
  }
  if (name.length < SAVE_MODAL_DEFAULTS.minNameLength) {
    return `Slide name must be at least ${SAVE_MODAL_DEFAULTS.minNameLength} character`
  }
  if (name.includes('\\') || name.includes('/') || name.includes(':')) {
    return "Slide name cannot contain invalid characters (\\ / :)"
  }
  return null
}

// Reusable element renderer components (shared with PreviewModal)
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

export const SaveSlideModal: React.FC<SaveSlideModalProps> = ({
  slide,
  onSave,
  onClose,
  isOpen,
}) => {
  const [slideName, setSlideName] = useState("")
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Validate slide on mount and when slide changes
  useEffect(() => {
    const error = validateSlide(slide)
    if (error) {
      console.error('SaveSlideModal validation error:', error)
      setValidationError(error)
    } else {
      setValidationError(null)
    }
  }, [slide])

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      // Lock body scroll and prevent background interaction
      document.body.style.overflow = "hidden"
      document.body.style.position = "fixed"
      document.body.style.top = "0"
      document.body.style.left = "0"
      document.body.style.right = "0"
      document.body.style.bottom = "0"
      setSlideName("")
      setError("")
      setIsSaving(false)
    } else {
      // Restore body scroll
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.left = ""
      document.body.style.right = ""
      document.body.style.bottom = ""
    }

    return () => {
      // Cleanup: restore body scroll
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.left = ""
      document.body.style.right = ""
      document.body.style.bottom = ""
    }
  }, [isOpen])

  const handleSave = async () => {
    const nameError = validateSlideName(slideName)
    if (nameError) {
      setError(nameError)
      return
    }

    setIsSaving(true)
    setError("")

    try {
      await onSave(slideName.trim())
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save slide")
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose()
    }
    if (e.key === "Enter" && !isSaving) {
      e.preventDefault()
      handleSave()
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, isSaving])

  if (!mounted || !isOpen || !slide) return null

  if (validationError) {
    return (
      <ErrorBoundary fallback={SaveSlideModalErrorFallback}>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2147483647]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <AlertCircle className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium mb-2">Invalid slide data</h3>
              <p className="text-gray-600 mb-4">{validationError}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  return createPortal(
    <ErrorBoundary fallback={SaveSlideModalErrorFallback}>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        style={{ zIndex: SAVE_MODAL_DEFAULTS.maxZIndex }}
        onClick={onClose}
        role="dialog"
        aria-label="Save slide modal"
        aria-modal="true"
        tabIndex={-1}
      >
        <div
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Save Slide</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close save modal"
              disabled={isSaving}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Slide Name Input */}
            <div className="mb-6">
              <label htmlFor="slide-name" className="block text-sm font-medium text-gray-700 mb-2">
                Slide Name
              </label>
              <input
                id="slide-name"
                type="text"
                value={slideName}
                onChange={(e) => setSlideName(e.target.value)}
                placeholder="Enter slide name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                disabled={isSaving}
                maxLength={SAVE_MODAL_DEFAULTS.maxNameLength}
                aria-describedby={error ? "slide-name-error" : undefined}
              />
              {error && (
                <div id="slide-name-error" className="flex items-center mt-2 text-red-600 text-sm">
                  <AlertCircle size={16} className="mr-1" />
                  {error}
                </div>
              )}
              <div className="mt-1 text-xs text-gray-500">
                {slideName.length}/{SAVE_MODAL_DEFAULTS.maxNameLength} characters
              </div>
            </div>

            {/* Slide Preview */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div
                  style={{
                    width: "100%",
                    height: `${SAVE_MODAL_DEFAULTS.previewHeight}px`,
                    backgroundColor: slide.backgroundColor || "white",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {slide.elements
                    .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                    .map((element) => renderStaticElement(element))}
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {slide.elements.length} element{slide.elements.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!slideName.trim() || isSaving}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              aria-label={isSaving ? "Saving slide..." : "Save slide"}
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Slide
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </ErrorBoundary>,
    document.body
  )
} 