import React from 'react'
import type { SavedSlide } from '@/types'
import { TemplatesPanel } from '@/components/panels'

/**
 * App Templates Sidebar Component
 * Handles the right sidebar with templates and saved slides
 */
interface AppTemplatesSidebarProps {
  showTemplates: boolean
  savedSlides: SavedSlide[]
  onCloseTemplates: () => void
  onSelectTemplate: (template: any) => void
  onDeleteSavedSlide: (id: string) => void
}

export const AppTemplatesSidebar: React.FC<AppTemplatesSidebarProps> = ({
  showTemplates,
  savedSlides,
  onCloseTemplates,
  onSelectTemplate,
  onDeleteSavedSlide
}) => {
  if (!showTemplates) return null

  return (
    <div className="w-80 bg-white border-l border-gray-200">
      <TemplatesPanel
        onClose={onCloseTemplates}
        onSelectTemplate={onSelectTemplate}
        savedSlides={savedSlides}
        onDeleteSavedSlide={onDeleteSavedSlide}
      />
    </div>
  )
} 