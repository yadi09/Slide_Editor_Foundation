import React from 'react'

/**
 * App Header Component
 * Handles the top navigation bar with title and action buttons
 */
interface AppHeaderProps {
  slides: any[]
  currentSlideId: string | null
  isExporting: boolean
  isPopulating: boolean
  onPopulateTemplate: () => void
  onExportPDF: () => void
  onClearPresentation: () => void
  onShowPreview: () => void
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  slides, 
  currentSlideId, 
  isExporting, 
  isPopulating,
  onPopulateTemplate, 
  onExportPDF, 
  onClearPresentation, 
  onShowPreview 
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-medium text-gray-900">Slide Editor</h1>
          <div className="text-sm text-gray-500">
            {slides.length} slide{slides.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onPopulateTemplate}
            disabled={!currentSlideId || isPopulating}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors disabled:opacity-50"
            title="Populate current slide with sample real estate data"
          >
            {isPopulating ? "Populating..." : "Populate Template"}
          </button>
          <button
            onClick={onShowPreview}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            title="Preview presentation in full screen"
          >
            Present
          </button>
          <button
            onClick={onExportPDF}
            disabled={isExporting}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            title="Export presentation as PDF"
          >
            {isExporting ? "Exporting..." : "Export"}
          </button>
          <button
            onClick={onClearPresentation}
            className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
            title="Clear all slides and start fresh"
          >
            Clear All
          </button>
        </div>
      </div>
    </header>
  )
} 