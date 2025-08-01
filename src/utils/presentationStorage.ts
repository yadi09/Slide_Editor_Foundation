import type { Slide } from "../types"
import { showToast } from "./toastUtils"

const PRESENTATION_STORAGE_KEY = 'slide-editor-presentation'

// Create a clean, serializable version of slides data
const sanitizeSlidesForStorage = (slides: Slide[]): Slide[] => {
  // Filter out any non-Slide objects (like event objects)
  const validSlides = slides.filter(slide => 
    slide && 
    typeof slide === 'object' && 
    slide.id && 
    Array.isArray(slide.elements)
  )
  
  return validSlides.map(slide => ({
    id: slide.id,
    backgroundColor: slide.backgroundColor,
    elements: slide.elements.map(element => ({
      id: element.id,
      type: element.type,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      content: element.content,
      style: element.style,
      zIndex: element.zIndex,
    }))
  }))
}

// Save entire presentation to localStorage
export const savePresentation = (slides: Slide[]): void => {
  try {
    // Create a clean version without circular references
    const cleanSlides = sanitizeSlidesForStorage(slides)
    
    // Debug: Check if the clean slides are serializable
    const testStringify = JSON.stringify(cleanSlides)
    console.log('Clean slides serialization test passed')
    
    localStorage.setItem(PRESENTATION_STORAGE_KEY, testStringify)
    console.log(`Presentation saved with ${slides.length} slides`)
  } catch (error) {
    console.error('Error saving presentation:', error)
    console.error('Slides that caused the error:', slides)
    // showToast.error('Failed to save presentation.')
  }
}

// Load entire presentation from localStorage
export const loadPresentation = (): Slide[] | null => {
  try {
    const saved = localStorage.getItem(PRESENTATION_STORAGE_KEY)
    if (!saved) return null
    
    const slides = JSON.parse(saved)
    
    // Validate that it's an array of slides
    if (!Array.isArray(slides)) {
      console.warn('Invalid presentation data in localStorage')
      return null
    }
    
    // Basic validation of slide structure
    const isValidSlide = (slide: any): slide is Slide => {
      return slide && 
             typeof slide.id === 'string' && 
             Array.isArray(slide.elements)
    }
    
    if (!slides.every(isValidSlide)) {
      console.warn('Invalid slide structure in localStorage')
      return null
    }
    
    console.log(`Presentation loaded with ${slides.length} slides`)
    return slides
  } catch (error) {
    console.error('Error loading presentation:', error)
    showToast.error('Failed to load presentation.')
    return null
  }
}

// Clear saved presentation
export const clearPresentation = (): void => {
  try {
    localStorage.removeItem(PRESENTATION_STORAGE_KEY)
    console.log('Presentation cleared from localStorage')
  } catch (error) {
    console.error('Error clearing presentation:', error)
    showToast.error('Failed to clear presentation.')
  }
} 