import React from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { Plus, Copy, Trash2, GripVertical } from "lucide-react"
import type { Slide } from '@/types'
import { ErrorBoundary } from '@/components/common'

/**
 * Simple error fallback for individual slide items
 */
const SlideItemErrorFallback: React.FC<{ slideId: string }> = ({ slideId }) => (
  <div className="group relative bg-white border border-red-200 rounded-lg p-3">
    <div className="flex items-center space-x-3">
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">Slide {slideId}</div>
        <div className="text-xs text-red-500">Error loading slide</div>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="text-xs text-blue-600 hover:text-blue-700"
      >
        Retry
      </button>
    </div>
  </div>
)

/**
 * Simple error fallback for the entire slides panel
 */
const SlidesPanelErrorFallback: React.FC = () => (
  <div className="h-full flex flex-col">
    <div className="p-4 border-b border-gray-200">
      <h2 className="text-sm font-semibold text-gray-900">Slides</h2>
    </div>
    
    <div className="flex-1 p-4">
      <div className="text-center py-8">
        <div className="text-red-400 mb-4">
          <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">Unable to load slides</h3>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
)

interface SlidesPanelProps {
  slides: Slide[]
  currentSlideId: string | null
  onSlideSelect: (slideId: string) => void
  onAddSlide: () => void
  onDeleteSlide: (slideId: string) => void
  onDuplicateSlide: (slideId: string) => void
  onReorderSlides: (dragIndex: number, hoverIndex: number) => void
}

interface DraggableSlideProps {
  slide: Slide
  index: number
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onDuplicate: () => void
  onMove: (dragIndex: number, hoverIndex: number) => void
}

/**
 * Individual slide item with drag-and-drop functionality
 */
const DraggableSlide: React.FC<DraggableSlideProps> = ({
  slide,
  index,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onMove,
}) => {
  const [{ isDragging }, drag, preview] = useDrag({
    type: "slide",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: "slide",
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        onMove(item.index, index)
        item.index = index
      }
    },
  })

  return (
    <div
      ref={(node) => {
        if (node) preview(drop(node))
      }}
      className={`group relative bg-white border rounded-lg p-3 cursor-pointer transition-all ${
        isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-300"
      } ${isDragging ? "opacity-50" : ""}`}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      <div
        ref={(node) => {
          if (node) drag(node)
        }}
        className="absolute left-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      {/* Slide Preview */}
      <div className="aspect-video bg-gray-50 rounded border mb-2 ml-6 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
          Slide {index + 1}
        </div>
        {slide.elements?.slice(0, 3).map((element) => (
          <div
            key={element.id}
            className="absolute bg-blue-200 rounded"
            style={{
              left: `${(element.x / 800) * 100}%`,
              top: `${(element.y / 600) * 100}%`,
              width: `${Math.min((element.width / 800) * 100, 20)}%`,
              height: `${Math.min((element.height / 600) * 100, 15)}%`,
            }}
          />
        ))}
      </div>

      {/* Slide Info */}
      <div className="text-sm font-medium text-gray-900 mb-1">Slide {index + 1}</div>
      <div className="text-xs text-gray-500">
        {slide.elements?.length || 0} element{(slide.elements?.length || 0) !== 1 ? "s" : ""}
      </div>

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDuplicate()
          }}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          title="Duplicate slide"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
          title="Delete slide"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

/**
 * Main slides panel component
 */
export const SlidesPanel: React.FC<SlidesPanelProps> = ({
  slides,
  currentSlideId,
  onSlideSelect,
  onAddSlide,
  onDeleteSlide,
  onDuplicateSlide,
  onReorderSlides,
}) => {
  return (
    <ErrorBoundary fallback={SlidesPanelErrorFallback}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">Slides</h2>
            <button
              onClick={onAddSlide}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Add slide"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slides List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {slides.map((slide, index) => (
            <ErrorBoundary
              key={slide.id}
              fallback={() => <SlideItemErrorFallback slideId={slide.id} />}
            >
              <DraggableSlide
                slide={slide}
                index={index}
                isSelected={slide.id === currentSlideId}
                onSelect={() => onSlideSelect(slide.id)}
                onDelete={() => onDeleteSlide(slide.id)}
                onDuplicate={() => onDuplicateSlide(slide.id)}
                onMove={onReorderSlides}
              />
            </ErrorBoundary>
          ))}

          {/* Empty State */}
          {slides.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-sm mb-2">No slides yet</div>
              <button onClick={onAddSlide} className="text-blue-600 text-sm hover:text-blue-700">
                Create your first slide
              </button>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
} 