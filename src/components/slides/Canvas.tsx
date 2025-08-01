import React, { useCallback } from 'react'
import { Rnd } from 'react-rnd'
import type { Slide, SlideElement } from '@/types'
import { TextElement } from '@/components/elements'
import { ImageElement } from '@/components/elements'
import { ShapeElement } from '@/components/elements'
import { GridOverlay } from './GridOverlay'
import { ErrorBoundary } from '@/components/common'
import { snapPositionToGrid } from '@/utils/gridUtils'

interface CanvasProps {
  slide?: Slide
  selectedElementId: string | null
  onElementSelect: (elementId: string | null) => void
  onElementUpdate: (elementId: string, updates: Partial<SlideElement>) => void
  gridEnabled: boolean
  gridSize: number
}

/**
 * Creates default elements for empty slides
 */
const createDefaultElement = (type: 'title' | 'subtitle', isFirstSlide: boolean): SlideElement => {
  const baseElement = {
    id: `element-${Date.now()}`,
    type: "text" as const,
    zIndex: type === 'title' ? 1 : 2,
  }
  
  if (isFirstSlide) {
    return type === 'title' 
      ? { ...baseElement, x: 100, y: 200, width: 760, height: 80, content: "Click to add title", style: { fontSize: 44, fontWeight: "normal", color: "#1f2937", textAlign: "center" as const } }
      : { ...baseElement, x: 100, y: 320, width: 760, height: 60, content: "Click to add subtitle", style: { fontSize: 24, fontWeight: "normal", color: "#6b7280", textAlign: "center" as const } }
  } else {
    return { ...baseElement, x: 100, y: 100, width: 760, height: 60, content: "Click to add title", style: { fontSize: 36, fontWeight: "normal", color: "#1f2937", textAlign: "left" as const } }
  }
}

/**
 * Safe element renderer with error boundary
 */
const SafeElementRenderer: React.FC<{
  element: SlideElement
  isSelected: boolean
  onUpdate: (updates: Partial<SlideElement>) => void
}> = ({ element, isSelected, onUpdate }) => {
  const renderElement = (element: SlideElement) => {
    switch (element.type) {
      case "text":
        return <TextElement element={element} isSelected={isSelected} onUpdate={onUpdate} />
      case "image":
        return <ImageElement element={element} isSelected={isSelected} onUpdate={onUpdate} />
      case "shape":
        return <ShapeElement element={element} isSelected={isSelected} onUpdate={onUpdate} />
      default:
        return <div className="flex items-center justify-center h-full text-red-500 text-sm">Unknown element type: {element.type}</div>
    }
  }

  return (
    <ErrorBoundary 
      fallback={() => (
        <div className="flex items-center justify-center h-full text-red-500 text-sm border border-red-200 rounded p-2">
          Error rendering element
        </div>
      )}
    >
      {renderElement(element)}
    </ErrorBoundary>
  )
}

export const Canvas: React.FC<CanvasProps> = ({ 
  slide, 
  selectedElementId, 
  onElementSelect, 
  onElementUpdate,
  gridEnabled,
  gridSize
}) => {
  const canvasRef = React.useRef<HTMLDivElement>(null)

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current || e.currentTarget === canvasRef.current) {
        onElementSelect(null)
      }
    },
    [onElementSelect],
  )

  if (!slide) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">No slide selected</div>
          <div className="text-gray-500 text-sm">Select a slide from the panel to start editing</div>
        </div>
      </div>
    )
  }

  const sortedElements = [...slide.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
  const isFirstSlide = slide.id === "slide-1"

  return (
    <div className="flex items-center justify-center h-full">
      <div className="relative">
        {/* Paper shadow */}
        <div className="absolute inset-0 bg-gray-400 rounded-lg transform translate-x-1 translate-y-1" />

        {/* Main slide canvas */}
        <div
          ref={canvasRef}
          className="relative bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden cursor-default"
          style={{
            width: 960,
            height: 540,
            backgroundColor: slide.backgroundColor || "#ffffff",
          }}
          onClick={handleCanvasClick}
        >
          {/* Grid Overlay */}
          <GridOverlay
            enabled={gridEnabled}
            size={gridSize}
          />

          {/* Default content for empty slides */}
          {slide.elements.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8">
              {isFirstSlide ? (
                <>
                  <div
                    className="text-4xl text-gray-400 cursor-text border-2 border-dashed border-transparent hover:border-gray-300 px-8 py-4 rounded"
                    onClick={(e) => {
                      e.stopPropagation()
                      const titleElement = createDefaultElement('title', true)
                      onElementUpdate(titleElement.id, titleElement)
                    }}
                  >
                    Click to add title
                  </div>
                  <div
                    className="text-2xl text-gray-400 cursor-text border-2 border-dashed border-transparent hover:border-gray-300 px-8 py-4 rounded"
                    onClick={(e) => {
                      e.stopPropagation()
                      const subtitleElement = createDefaultElement('subtitle', true)
                      onElementUpdate(subtitleElement.id, subtitleElement)
                    }}
                  >
                    Click to add subtitle
                  </div>
                </>
              ) : (
                <div
                  className="text-3xl text-gray-400 cursor-text border-2 border-dashed border-transparent hover:border-gray-300 px-8 py-4 rounded"
                  onClick={(e) => {
                    e.stopPropagation()
                    const titleElement = createDefaultElement('title', false)
                    onElementUpdate(titleElement.id, titleElement)
                  }}
                >
                  Click to add title
                </div>
              )}
            </div>
          )}

          {/* Render elements */}
          {sortedElements.map((element) => (
            <Rnd
              key={element.id}
              size={{ width: element.width, height: element.height }}
              position={{ x: element.x, y: element.y }}
              onDragStop={(_e, d) => {
                const snappedPosition = gridEnabled 
                  ? snapPositionToGrid(d.x, d.y, gridSize)
                  : { x: d.x, y: d.y }
                
                onElementUpdate(element.id, { 
                  x: snappedPosition.x, 
                  y: snappedPosition.y 
                })
              }}
              onResizeStop={(_e, _direction, ref, _delta, position) => {
                const snappedPosition = gridEnabled 
                  ? snapPositionToGrid(position.x, position.y, gridSize)
                  : { x: position.x, y: position.y }
                
                onElementUpdate(element.id, {
                  width: Number.parseInt(ref.style.width),
                  height: Number.parseInt(ref.style.height),
                  x: snappedPosition.x,
                  y: snappedPosition.y,
                })
              }}
              bounds="parent"
              className={`${element.id === selectedElementId ? "ring-2 ring-blue-500 selected-element" : "non-selected-element"}`}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                onElementSelect(element.id)
              }}
              enableResizing={{
                top: true,
                right: true,
                bottom: true,
                left: true,
                topRight: true,
                bottomRight: true,
                bottomLeft: true,
                topLeft: true,
              }}
              style={{ zIndex: element.zIndex || 0 }}
            >
              <SafeElementRenderer
                element={element}
                isSelected={element.id === selectedElementId}
                onUpdate={(updates) => onElementUpdate(element.id, updates)}
              />
            </Rnd>
          ))}
        </div>
      </div>
    </div>
  )
} 