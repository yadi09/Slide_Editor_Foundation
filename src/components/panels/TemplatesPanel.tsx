import React, { useState, useEffect } from 'react'
import { Search, AlertCircle, FolderOpen, X, Trash2 } from 'lucide-react'
import { predefinedTemplates } from '@/data/templates'
import type { Slide, SavedSlide, SlideElement } from '@/types'
import { ErrorBoundary } from '@/components/common'

// Extended template type with name and description
type Template = Slide & { name: string; description?: string }

// Centralized configuration and constants
const TEMPLATE_DEFAULTS = {
  previewWidth: 800,
  previewHeight: 600,
  maxPreviewElements: 3,
  maxPreviewWidth: 20,
  maxPreviewHeight: 15,
  searchDebounceMs: 300,
  maxNameLength: 50,
} as const

interface TemplatesPanelProps {
  onClose: () => void
  onSelectTemplate: (template: Slide) => void
  savedSlides: SavedSlide[]
  onDeleteSavedSlide: (id: string) => void
}

// Validation functions
const validateTemplate = (template: Slide): string | null => {
  if (!template || !template.id) {
    return "Invalid template data"
  }
  if (!template.elements || !Array.isArray(template.elements)) {
    return "Template has no elements"
  }
  if (template.elements.length === 0) {
    return "Template is empty"
  }
  return null
}

const validateSavedSlide = (savedSlide: SavedSlide): string | null => {
  if (!savedSlide || !savedSlide.id) {
    return "Invalid saved slide data"
  }
  if (!savedSlide.name || savedSlide.name.trim().length === 0) {
    return "Saved slide has no name"
  }
  const templateError = validateTemplate(savedSlide.slide)
  if (templateError) {
    return `Saved slide error: ${templateError}`
  }
  return null
}

// Reusable template preview component
const TemplatePreview: React.FC<{
  elements: SlideElement[]
  name: string
  backgroundColor?: string
  isSavedSlide?: boolean
  className?: string
}> = ({ elements, name, backgroundColor = "#f9fafb", isSavedSlide = false, className = "" }) => {
  const calculatePreviewPosition = (element: SlideElement) => {
    const left = `${(element.x / TEMPLATE_DEFAULTS.previewWidth) * 100}%`
    const top = `${(element.y / TEMPLATE_DEFAULTS.previewHeight) * 100}%`
    const width = `${Math.min((element.width / TEMPLATE_DEFAULTS.previewWidth) * 100, TEMPLATE_DEFAULTS.maxPreviewWidth)}%`
    const height = `${Math.min((element.height / TEMPLATE_DEFAULTS.previewHeight) * 100, TEMPLATE_DEFAULTS.maxPreviewHeight)}%`
    
    return { left, top, width, height }
  }

  return (
    <div 
      className={`aspect-video rounded border relative overflow-hidden ${className}`}
      style={{ backgroundColor }}
      role="img"
      aria-label={`Preview of ${name} template`}
    >
      <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
        {name}
      </div>
      {/* Mini preview of template elements */}
      {elements.slice(0, TEMPLATE_DEFAULTS.maxPreviewElements).map((element) => {
        const position = calculatePreviewPosition(element)
        return (
          <div
            key={element.id}
            className={`absolute bg-blue-200 rounded ${isSavedSlide ? 'bg-green-200' : ''}`}
            style={position}
            aria-hidden="true"
          />
        )
      })}
    </div>
  )
}

// Reusable template card component
const TemplateCard: React.FC<{
  template: Slide
  onSelect: () => void
  onDelete?: () => void
  isSavedSlide?: boolean
  savedSlideName?: string
  templateName?: string
}> = ({ template, onSelect, onDelete, isSavedSlide = false, savedSlideName, templateName }) => {
  const templateError = validateTemplate(template)
  const displayName = isSavedSlide ? savedSlideName : templateName || "Template"
  
  if (templateError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="flex items-center text-red-600 text-sm">
          <AlertCircle size={16} className="mr-2" />
          Invalid template
        </div>
        <div className="text-xs text-red-500 mt-1">{templateError}</div>
      </div>
    )
  }

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect()
        }
      }}
      aria-label={`Select ${displayName} template`}
    >
      {/* Template Preview */}
      <TemplatePreview 
        elements={template.elements}
        name={displayName || "Template"}
        backgroundColor={template.backgroundColor}
        isSavedSlide={isSavedSlide}
        className="mb-2"
      />

      {/* Template Info */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900 mb-1">
            {displayName}
          </div>
          <div className="text-xs text-gray-500">
            {template.elements.length} element{template.elements.length !== 1 ? "s" : ""}
          </div>
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
            title="Delete saved slide"
            aria-label="Delete saved slide"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}

// Templates Panel Error Fallback
const TemplatesPanelErrorFallback: React.FC<{ error?: Error; errorInfo?: React.ErrorInfo }> = ({ error }) => (
  <div className="h-full flex flex-col">
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
      <div className="flex items-center text-red-600 text-sm">
        <AlertCircle size={16} className="mr-2" />
        Templates Panel Error
      </div>
      <div className="text-xs text-red-500 mt-1">
        {error?.message || 'Unable to load templates panel'}
      </div>
    </div>
  </div>
)

export const TemplatesPanel: React.FC<TemplatesPanelProps> = ({ 
  onClose, 
  onSelectTemplate, 
  savedSlides,
  onDeleteSavedSlide,
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [filteredSavedSlides, setFilteredSavedSlides] = useState<SavedSlide[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])

  // Validate saved slides on mount and when they change
  useEffect(() => {
    const errors: Record<string, string> = {}
    
    savedSlides.forEach((savedSlide) => {
      const error = validateSavedSlide(savedSlide)
      if (error) {
        errors[savedSlide.id] = error
        console.error(`Saved slide validation error for ${savedSlide.name}:`, error)
      }
    })
    
    setValidationErrors(errors)
  }, [savedSlides])

  // Filter templates and saved slides based on search term
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const term = searchTerm.toLowerCase().trim()
      
      // Filter saved slides
      const filteredSaved = savedSlides.filter(slide => {
        if (validationErrors[slide.id]) return false
        return term === "" || slide.name.toLowerCase().includes(term)
      })
      setFilteredSavedSlides(filteredSaved)
      
      // Filter predefined templates
      const filteredTemplates = predefinedTemplates.filter(template => {
        const templateError = validateTemplate(template)
        if (templateError) return false
        return term === "" || 
               template.name.toLowerCase().includes(term) || 
               template.description?.toLowerCase().includes(term)
      })
      setFilteredTemplates(filteredTemplates)
    }, TEMPLATE_DEFAULTS.searchDebounceMs)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, savedSlides, validationErrors])

  const handleDeleteSavedSlide = async (id: string) => {
    try {
      await onDeleteSavedSlide(id)
    } catch (error) {
      console.error('Failed to delete saved slide:', error)
    }
  }

  const handleSelectTemplate = (template: Slide) => {
    const error = validateTemplate(template)
    if (error) {
      console.error('Template validation error:', error)
      return
    }
    onSelectTemplate(template)
  }

  return (
    <ErrorBoundary fallback={TemplatesPanelErrorFallback}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">Templates</h2>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Close templates"
              aria-label="Close templates panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-3">Choose a template to get started</p>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Search templates"
            />
          </div>
        </div>

        {/* Templates List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Saved Slides Section */}
          {filteredSavedSlides.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">Saved Slides</h3>
                
              </div>
              <div className="space-y-3">
                {filteredSavedSlides.map((savedSlide) => (
                  <TemplateCard
                    key={savedSlide.id}
                    template={savedSlide.slide}
                    onSelect={() => handleSelectTemplate(savedSlide.slide)}
                    onDelete={() => handleDeleteSavedSlide(savedSlide.id)}
                    isSavedSlide={true}
                    savedSlideName={savedSlide.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Predefined Templates Section */}
          {filteredTemplates.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Predefined Templates</h3>
              <div className="space-y-4">
                {filteredTemplates.map((template) => (
                  <div key={template.id}>
                    <TemplateCard
                      template={template}
                      onSelect={() => handleSelectTemplate(template)}
                      templateName={template.name}
                    />
                    {template.description && (
                      <div className="text-xs text-gray-500 mt-1 ml-3">
                        {template.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredSavedSlides.length === 0 && filteredTemplates.length === 0 && (
            <div className="text-center py-8">
              {searchTerm ? (
                <>
                  <div className="text-gray-400 text-sm mb-2">No templates found</div>
                  <div className="text-gray-500 text-xs">Try adjusting your search terms</div>
                </>
              ) : (
                <>
                  <FolderOpen className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <div className="text-gray-400 text-sm mb-2">No templates available</div>
                  <div className="text-gray-500 text-xs">Templates will appear here</div>
                </>
              )}
            </div>
          )}

          {/* Validation Errors Summary */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center text-yellow-800 text-sm mb-2">
                <AlertCircle size={16} className="mr-2" />
                Some saved slides have issues
              </div>
              <div className="text-xs text-yellow-700">
                {Object.keys(validationErrors).length} saved slide{Object.keys(validationErrors).length !== 1 ? "s" : ""} with validation errors
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
} 