/**
 * Application Constants
 * Centralized constants for better maintainability and consistency
 */

export const APP_CONSTANTS = {
  // Element positioning and dimensions
  DEFAULT_ELEMENT_POSITION: { x: 100, y: 100 },
  ELEMENT_DIMENSIONS: {
    text: { width: 300, height: 60 },
    image: { width: 150, height: 100 },
    shape: { width: 150, height: 100 }
  },
  
  // Grid settings
  GRID_SIZE: 20,
  
  // Canvas dimensions
  CANVAS_DIMENSIONS: { width: 800, height: 600 },
  
  // Keyboard shortcuts
  KEYBOARD_SHORTCUTS: {
    GRID_TOGGLE: 'g',
    SAVE: 's',
    UNDO: 'z',
    REDO: 'y',
    DELETE: 'Delete',
    ESCAPE: 'Escape'
  },
  
  // Default styles
  DEFAULT_STYLES: {
    text: {
      backgroundColor: 'transparent',
      color: '#000000',
      fontSize: 18,
      fontWeight: 'normal',
      textAlign: 'left' as const,
      borderRadius: 0
    },
    shape: {
      backgroundColor: '#4285f4',
      color: '#000000',
      fontSize: 18,
      fontWeight: 'normal',
      textAlign: 'left' as const,
      borderRadius: 8
    },
    image: {
      backgroundColor: 'transparent',
      color: '#000000',
      fontSize: 18,
      fontWeight: 'normal',
      textAlign: 'left' as const,
      borderRadius: 0
    }
  },
  
  // Toast messages
  MESSAGES: {
    ELEMENT_ADDED: (type: string) => `${type.charAt(0).toUpperCase() + type.slice(1)} element added!`,
    TEMPLATE_POPULATED: 'Template populated with sample data!',
    PDF_EXPORTED: 'PDF exported successfully!',
    SLIDE_SAVED: (name: string) => `Slide "${name}" saved successfully!`,
    SLIDE_DELETED: 'Saved slide deleted successfully!',
    PRESENTATION_CLEARED: 'Presentation cleared successfully',
    WARNINGS: {
      NO_SLIDE_SELECTED: 'Please select a slide first',
      NO_SLIDES_TO_EXPORT: 'No slides to export',
      NO_SLIDE_TO_SAVE: 'No slide to save'
    },
    ERRORS: {
      FAILED_TO_ADD_ELEMENT: 'Failed to add element',
      FAILED_TO_POPULATE_TEMPLATE: 'Failed to populate template',
      FAILED_TO_EXPORT_PDF: 'Failed to export PDF. Please try again.',
      FAILED_TO_SAVE_SLIDE: 'Failed to save slide. Please try again.',
      FAILED_TO_DELETE_SLIDE: 'Failed to delete saved slide. Please try again.',
      FAILED_TO_CLEAR_PRESENTATION: 'Failed to clear presentation',
      FAILED_TO_LOAD_SAVED_SLIDES: 'Failed to load saved slides',
      FAILED_TO_ADD_TEMPLATE: 'Failed to add template'
    }
  },
  
  // Confirmation messages
  CONFIRMATIONS: {
    DELETE_SLIDE: (slideId: string) => 
      `Are you sure you want to delete "${slideId || 'this slide'}"? This action cannot be undone.`,
    DELETE_SAVED_SLIDE: (slideName: string) => 
      `Are you sure you want to delete "${slideName || 'this saved slide'}"? This action cannot be undone.`,
    CLEAR_PRESENTATION: 'Are you sure you want to clear the entire presentation? This cannot be undone.'
  },
  
  // File names
  FILES: {
    DEFAULT_PDF_NAME: 'rei-presentation.pdf'
  },
  
  // UI Settings
  UI: {
    LOADING_SPINNER_SIZE: 'h-8 w-8',
    TOAST_DURATION: 3000,
    ANIMATION_DURATION: 200
  }
} as const

/**
 * Type definitions for constants
 */
export type ElementType = 'text' | 'image' | 'shape'
export type TextAlign = 'left' | 'center' | 'right'
export type FontWeight = 'normal' | 'bold'

/**
 * Helper functions using constants
 */
export const getElementDimensions = (type: ElementType) => {
  return APP_CONSTANTS.ELEMENT_DIMENSIONS[type]
}

export const getDefaultStyles = (type: ElementType) => {
  return APP_CONSTANTS.DEFAULT_STYLES[type]
}

export const getElementMessage = (type: ElementType) => {
  return APP_CONSTANTS.MESSAGES.ELEMENT_ADDED(type)
} 