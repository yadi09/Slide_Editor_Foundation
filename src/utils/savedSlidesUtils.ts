import type { Slide, SavedSlide } from "../types"
import { showToast } from "./toastUtils"

const SAVED_SLIDES_KEY = 'slide-editor-saved-slides'

// Save slide to localStorage
export const saveSlideToStorage = (slide: Slide, name: string): void => {
  try {
    const savedSlides = getSavedSlides()
    
    // Check for duplicate names
    const existingSlide = savedSlides.find(saved => saved.name === name)
    if (existingSlide) {
      throw new Error(`A slide with the name "${name}" already exists`)
    }

    const savedSlide: SavedSlide = {
      id: `saved-${Date.now()}`,
      name,
      slide: {
        ...slide,
        id: `slide-${Date.now()}`, // Generate new ID for the saved slide
        elements: slide.elements.map(element => ({
          ...element,
          id: `element-${Date.now()}-${Math.random()}`, // Generate new IDs for elements
        }))
      },
      createdAt: new Date(),
    }

    savedSlides.push(savedSlide)
    localStorage.setItem(SAVED_SLIDES_KEY, JSON.stringify(savedSlides))
    
    console.log(`Slide "${name}" saved successfully with ${slide.elements.length} elements`)
  } catch (error) {
    console.error('Error saving slide:', error)
    showToast.error('Failed to save slide. Please try again.')
    throw error
  }
}

// Get all saved slides from localStorage
export const getSavedSlides = (): SavedSlide[] => {
  try {
    const saved = localStorage.getItem(SAVED_SLIDES_KEY)
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error('Error loading saved slides:', error)
    showToast.error('Failed to load saved slides.')
    return []
  }
}

// Delete saved slide by ID
export const deleteSavedSlide = (id: string): void => {
  try {
    const savedSlides = getSavedSlides()
    const filtered = savedSlides.filter(saved => saved.id !== id)
    localStorage.setItem(SAVED_SLIDES_KEY, JSON.stringify(filtered))
    console.log(`Saved slide deleted: ${id}`)
  } catch (error) {
    console.error('Error deleting saved slide:', error)
    showToast.error('Failed to delete saved slide.')
    throw error
  }
}

// Check if slide is already saved
export const isSlideSaved = (slideId: string): boolean => {
  const savedSlides = getSavedSlides()
  return savedSlides.some(saved => saved.slide.id === slideId)
}

// Generate thumbnail for saved slide (simplified version)
export const generateSlideThumbnail = async (slide: Slide): Promise<string> => {
  // For now, return a placeholder. In a real implementation, 
  // you could use html2canvas to generate actual thumbnails
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="200" height="120" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="12" fill="#666">
        ${slide.elements.length} elements
      </text>
    </svg>
  `)}`
} 