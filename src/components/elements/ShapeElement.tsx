import React, { useState } from 'react'
import { Palette, AlertCircle } from 'lucide-react'
import type { SlideElement } from '@/types'
import { ErrorBoundary } from '@/components/common'

// Centralized configuration and constants
const SHAPE_DEFAULTS = {
  types: ['rectangle', 'circle', 'triangle', 'diamond', 'star'] as const,
  defaultColor: "#4285f4",
  defaultBorderRadius: "8px",
  colors: [
    "#4285f4", "#ea4335", "#fbbc04", "#34a853", "#9aa0a6",
    "#ff6d01", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3",
    "#00bcd4", "#009688", "#4caf50", "#8bc34a", "#cddc39",
    "#ffeb3b", "#ffc107", "#ff9800", "#ff5722", "#795548",
  ],
  borderRadiusOptions: ["0px", "4px", "8px", "12px", "16px", "50%"],
} as const

interface ShapeElementProps {
  element: SlideElement
  isSelected: boolean
  onUpdate: (updates: Partial<SlideElement>) => void
}

// Validation functions
const validateShapeType = (type: string): string | null => {
  if (!SHAPE_DEFAULTS.types.includes(type as any)) {
    return `Invalid shape type: ${type}. Allowed: ${SHAPE_DEFAULTS.types.join(', ')}`
  }
  return null
}

const validateColor = (color: string): string | null => {
  if (!color) return null
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  if (!colorRegex.test(color)) {
    return "Invalid color format. Use hex format (e.g., #FF0000)"
  }
  return null
}

const validateBorderRadius = (radius: string): string | null => {
  const validRadiuses = SHAPE_DEFAULTS.borderRadiusOptions
  if (!validRadiuses.includes(radius as any)) {
    return `Invalid border radius. Allowed: ${validRadiuses.join(', ')}`
  }
  return null
}

// Error fallback component
const ShapeElementErrorFallback: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center text-red-500 text-sm border border-red-200 rounded p-2">
    Error rendering shape element
  </div>
)

export const ShapeElement: React.FC<ShapeElementProps> = ({ element, isSelected, onUpdate }) => {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const shapeType = element.content || "rectangle"

  const handleColorChange = (color: string) => {
    const colorError = validateColor(color)
    if (colorError) {
      setValidationError(colorError)
      return
    }

    setValidationError(null)
    onUpdate({
      style: {
        ...element.style,
        backgroundColor: color,
      },
    })
    setShowColorPicker(false)
  }

  const handleShapeTypeChange = (type: string) => {
    const typeError = validateShapeType(type)
    if (typeError) {
      setValidationError(typeError)
      return
    }

    setValidationError(null)
    const borderRadius = type === "circle" ? "50%" : SHAPE_DEFAULTS.defaultBorderRadius
    onUpdate({
      content: type,
      style: {
        ...element.style,
        borderRadius,
      },
    })
  }

  const handleBorderRadiusChange = (radius: string) => {
    const radiusError = validateBorderRadius(radius)
    if (radiusError) {
      setValidationError(radiusError)
      return
    }

    setValidationError(null)
    onUpdate({
      style: {
        ...element.style,
        borderRadius: radius,
      },
    })
  }

  const getShapeStyles = () => {
    const backgroundColor = element.style?.backgroundColor || SHAPE_DEFAULTS.defaultColor
    const borderRadius = element.style?.borderRadius || (shapeType === "circle" ? "50%" : SHAPE_DEFAULTS.defaultBorderRadius)

    return {
      width: "100%",
      height: "100%",
      backgroundColor,
      borderRadius,
    }
  }

  const renderShape = () => {
    const style = getShapeStyles()

    switch (shapeType) {
      case "circle":
        return (
          <div
            style={{
              ...style,
              borderRadius: "50%",
            }}
            role="img"
            aria-label="Circle shape"
          />
        )
      case "triangle":
        return (
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: `${element.width / 2}px solid transparent`,
              borderRight: `${element.width / 2}px solid transparent`,
              borderBottom: `${element.height}px solid ${element.style?.backgroundColor || SHAPE_DEFAULTS.defaultColor}`,
              backgroundColor: "transparent",
            }}
            role="img"
            aria-label="Triangle shape"
          />
        )
      case "diamond":
        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: element.style?.backgroundColor || SHAPE_DEFAULTS.defaultColor,
              transform: "rotate(45deg)",
            }}
            role="img"
            aria-label="Diamond shape"
          />
        )
      case "star":
        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: element.style?.backgroundColor || SHAPE_DEFAULTS.defaultColor,
              clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
            }}
            role="img"
            aria-label="Star shape"
          />
        )
      default: // rectangle
        return (
          <div 
            style={style} 
            role="img" 
            aria-label="Rectangle shape"
          />
        )
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      setShowColorPicker(!showColorPicker)
    } else if (e.key === "Escape") {
      setShowColorPicker(false)
    }
  }

  return (
    <ErrorBoundary fallback={ShapeElementErrorFallback}>
      <div className="w-full h-full relative group">
        {renderShape()}

        {/* Shape controls - only show when selected */}
        {isSelected && (
          <div className="absolute -top-20 right-20 bg-white border border-gray-200 rounded shadow-lg p-2 z-20 min-w-48">
            <div className="flex flex-col space-y-2">
              {/* Shape type selector */}
              <div className="flex items-center space-x-2">
                <label className="text-xs text-gray-600 w-12">Shape:</label>
                <select
                  value={shapeType}
                  onChange={(e) => handleShapeTypeChange(e.target.value)}
                  className="text-xs border border-gray-300 rounded px-2 py-1 flex-1"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Select shape type"
                >
                  {SHAPE_DEFAULTS.types.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Border radius selector */}
              <div className="flex items-center space-x-2">
                <label className="text-xs text-gray-600 w-12">Radius:</label>
                <select
                  value={element.style?.borderRadius || SHAPE_DEFAULTS.defaultBorderRadius}
                  onChange={(e) => handleBorderRadiusChange(e.target.value)}
                  className="text-xs border border-gray-300 rounded px-2 py-1 flex-1"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Select border radius"
                >
                  {SHAPE_DEFAULTS.borderRadiusOptions.map((radius) => (
                    <option key={radius} value={radius}>
                      {radius}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color controls */}
              <div className="flex items-center space-x-2">
                <label className="text-xs text-gray-600 w-12">Color:</label>
                <div className="flex items-center space-x-1 flex-1">
                  {/* Color palette */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowColorPicker(!showColorPicker)
                      }}
                      onKeyDown={handleKeyDown}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Color palette"
                      aria-label="Open color palette"
                      tabIndex={0}
                    >
                      <Palette className="w-3 h-3" />
                    </button>

                    {showColorPicker && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg p-2 z-50">
                        <div className="grid grid-cols-5 gap-1 w-32">
                          {SHAPE_DEFAULTS.colors.map((color) => (
                            <button
                              key={color}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleColorChange(color)
                              }}
                              className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                              title={color}
                              aria-label={`Select color ${color}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Custom color picker */}
                  <input
                    type="color"
                    value={element.style?.backgroundColor || SHAPE_DEFAULTS.defaultColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-6 h-6 rounded border border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
                    title="Custom color picker"
                    aria-label="Custom color picker"
                  />
                </div>
              </div>

              {/* Validation error display */}
              {validationError && (
                <div className="text-red-500 text-xs flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {validationError}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
} 