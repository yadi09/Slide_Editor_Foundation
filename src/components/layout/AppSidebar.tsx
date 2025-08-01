import React from 'react'
import { APP_CONSTANTS } from '@/constants/appConstants'
import { SlidesPanel } from '@/components/slides'

/**
 * App Sidebar Component
 * Handles the left sidebar with slide management
 */
interface AppSidebarProps {
  slides: any[]
  currentSlideId: string | null
  onSlideSelect: (slideId: string) => void
  onAddSlide: () => void
  onDeleteSlide: (slideId: string) => void
  onDuplicateSlide: (slideId: string) => void
  onReorderSlides: (dragIndex: number, hoverIndex: number) => void
  onShowConfirmation: (message: string, onConfirm: () => void) => void
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ 
  slides, 
  currentSlideId, 
  onSlideSelect, 
  onAddSlide, 
  onDeleteSlide, 
  onDuplicateSlide, 
  onReorderSlides,
  onShowConfirmation
}) => {
  return (
    <div className="w-60 bg-white border-r border-gray-200">
      <SlidesPanel
        slides={slides}
        currentSlideId={currentSlideId}
        onSlideSelect={onSlideSelect}
        onAddSlide={onAddSlide}
        onDeleteSlide={(slideId) => {
          const slideToDelete = slides.find(s => s.id === slideId)
          onShowConfirmation(
            APP_CONSTANTS.CONFIRMATIONS.DELETE_SLIDE(slideToDelete?.id || ''),
            () => onDeleteSlide(slideId)
          )
        }}
        onDuplicateSlide={onDuplicateSlide}
        onReorderSlides={onReorderSlides}
      />
    </div>
  )
} 