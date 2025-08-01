import React, { useState, useEffect, useRef } from 'react'
import type { SlideElement } from '@/types'
import { ErrorBoundary } from '@/components/common'

// Centralized default values and constants
const TEXT_DEFAULTS = {
  fontSize: 16,
  color: "#000000",
  fontWeight: "normal" as const,
  textAlign: "left" as const,
  placeholder: "Double-click to edit",
  maxLength: 1000,
} as const

interface TextElementProps {
  element: SlideElement
  isSelected: boolean
  onUpdate: (updates: Partial<SlideElement>) => void
}

// Reusable style function to eliminate duplication
const getTextStyles = (style: any, isEditing: boolean = false) => ({
  color: style?.color || TEXT_DEFAULTS.color,
  fontSize: `${style?.fontSize || TEXT_DEFAULTS.fontSize}px`,
  fontWeight: style?.fontWeight || TEXT_DEFAULTS.fontWeight,
  textAlign: style?.textAlign || TEXT_DEFAULTS.textAlign,
  fontFamily: isEditing ? "inherit" : undefined,
  padding: isEditing ? undefined : "4px",
  fontStyle: style?.fontStyle || "normal",
  textDecoration: style?.textDecoration || "none",
  lineHeight: style?.lineHeight || "normal",
})

// Validation function for element props
const validateElement = (element: SlideElement): string | null => {
  if (!element || typeof element !== 'object') {
    return "Invalid element provided"
  }
  if (element.type !== 'text') {
    return "Element is not a text type"
  }
  if (element.content && typeof element.content !== 'string') {
    return "Content must be a string"
  }
  return null
}

// Validation function for content
const validateContent = (content: string): string | null => {
  if (content.length > TEXT_DEFAULTS.maxLength) {
    return `Text too long (max ${TEXT_DEFAULTS.maxLength} characters)`
  }
  return null
}

// Error fallback component
const TextElementErrorFallback: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center text-red-500 text-sm border border-red-200 rounded p-2">
    Error rendering text element
  </div>
)

export const TextElement: React.FC<TextElementProps> = ({ element, isSelected, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(element.content || "")
  const [validationError, setValidationError] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Validate element on mount and when element changes
  useEffect(() => {
    const error = validateElement(element)
    if (error) {
      console.error('TextElement validation error:', error)
      setValidationError(error)
    } else {
      setValidationError(null)
    }
  }, [element])

  // Sync editValue with element.content when it changes from external sources
  useEffect(() => {
    if (!isEditing) {
      setEditValue(element.content || "")
    }
  }, [element.content, isEditing])

  // Focus and select text when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Auto-save functionality with debouncing - only when user is actively editing
  useEffect(() => {
    if (isEditing && editValue !== element.content) {
      const timeout = setTimeout(() => {
        const contentError = validateContent(editValue)
        if (!contentError) {
          onUpdate({ content: editValue })
        }
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [editValue, isEditing, element.content, onUpdate])

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const elementError = validateElement(element)
    if (elementError) {
      console.error('Cannot edit invalid element:', elementError)
      return
    }
    setIsEditing(true)
    setEditValue(element.content || "")
  }

  const handleBlur = () => {
    setIsEditing(false)
    const contentError = validateContent(editValue)
    if (!contentError) {
      onUpdate({ content: editValue })
    } else {
      // Revert to original content if validation fails
      setEditValue(element.content || "")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleBlur()
    } else if (e.key === "Escape") {
      setIsEditing(false)
      setEditValue(element.content || "")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const contentError = validateContent(newValue)
    setValidationError(contentError)
    setEditValue(newValue)
  }

  // Show error state if validation failed
  if (validationError) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-500 text-sm border border-red-200 rounded p-2">
        {validationError}
      </div>
    )
  }

  if (isEditing) {
    return (
      <ErrorBoundary fallback={TextElementErrorFallback}>
        <textarea
          ref={inputRef}
          value={editValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full h-full resize-none border-none outline-none bg-transparent"
          style={getTextStyles(element.style, true)}
          aria-label="Edit text content"
          aria-multiline="true"
          maxLength={TEXT_DEFAULTS.maxLength}
          title={`Edit text (max ${TEXT_DEFAULTS.maxLength} characters)`}
        />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary fallback={TextElementErrorFallback}>
      <div
        className="w-full h-full flex items-center cursor-text"
        onDoubleClick={handleDoubleClick}
        style={getTextStyles(element.style, false)}
        role="textbox"
        aria-label="Text element"
        aria-multiline="true"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        title="Double-click to edit text"
      >
        <div className="w-full whitespace-pre-wrap break-words">
          {element.content || TEXT_DEFAULTS.placeholder}
        </div>
      </div>
    </ErrorBoundary>
  )
} 