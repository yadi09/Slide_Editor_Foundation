import { useState, useCallback, useEffect } from "react"
import type { Slide, SlideElement } from "../types"
import { savePresentation, loadPresentation } from "../utils/presentationStorage"

/**
 * CUSTOM HOOK: useSlideStore
 * 
 * Centralized state management for the slide editor application.
 * Manages slides, current slide selection, element selection, and auto-save functionality.
 * 
 * FEATURES:
 * - Slide management (add, delete, duplicate, reorder)
 * - Element management (add, update, delete, bring to front/back)
 * - Auto-save to localStorage
 * - Current slide and element selection
 * - Persistent state across browser sessions
 * 
 * STATE STRUCTURE:
 * - slides: Array of all slides in the presentation
 * - currentSlideId: ID of the currently selected slide
 * - selectedElementId: ID of the currently selected element
 * - isLoaded: Whether initial data has been loaded from localStorage
 * 
 * @returns Object containing all state and state-modifying functions
 */
export const useSlideStore = () => {
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: "slide-1",
      elements: [],
      backgroundColor: "#ffffff",
    },
  ])

  const [currentSlideId, setCurrentSlideId] = useState<string | null>("slide-1")
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  /**
   * EFFECT: Auto-load presentation from localStorage on mount
   * 
   * Loads saved presentation data when the component mounts.
   * If saved data exists, it replaces the default empty slide.
   * Sets isLoaded to true after loading is complete.
   * 
   * DEPENDENCIES: None (runs only on mount)
   */
  useEffect(() => {
    const savedSlides = loadPresentation()
    if (savedSlides && savedSlides.length > 0) {
      setSlides(savedSlides)
      setCurrentSlideId(savedSlides[0].id)
      console.log('Presentation loaded from localStorage')
    }
    setIsLoaded(true)
  }, [])

  /**
   * AUTO-SAVE FUNCTION
   * 
   * Automatically saves the current slides state to localStorage.
   * Only saves if the component has finished initial loading.
   * Includes error handling to prevent app crashes.
   * 
   * @param newSlides - Array of slides to save
   * @returns void
   */
  const autoSave = useCallback((newSlides: Slide[]) => {
    if (isLoaded) {
      try {
        // Debug: Log the slides being saved
        console.log('Auto-saving slides:', newSlides.length, 'slides')
        savePresentation(newSlides)
      } catch (error) {
        console.error('Auto-save failed:', error)
        // Don't throw the error, just log it to prevent app crashes
      }
    }
  }, [isLoaded])

  /**
   * ADD SLIDE FUNCTION
   * 
   * Creates and adds a new slide to the presentation.
   * Can accept an optional template slide to use as a base.
   * Automatically selects the new slide and clears element selection.
   * 
   * VALIDATION:
   * - Ensures template is a proper Slide object if provided
   * - Filters out invalid slides from previous state
   * 
   * @param template - Optional slide template to use as base
   * @returns void
   */
  const addSlide = useCallback((template?: Slide) => {
    console.log("addSlide called with template:", template)
    
    // Validate that template is a proper Slide object or undefined
    if (template && (typeof template !== 'object' || !template.id || !Array.isArray(template.elements))) {
      console.error('Invalid template provided to addSlide:', template)
      return
    }
    
    const newSlide: Slide = template || {
      id: `slide-${Date.now()}`,
      elements: [],
      backgroundColor: "#ffffff",
    }

    console.log("Creating new slide:", newSlide)

    setSlides((prev) => {
      // Validate that prev is an array of proper Slide objects
      const validSlides = prev.filter(slide => 
        slide && typeof slide === 'object' && slide.id && Array.isArray(slide.elements)
      )
      
      const newSlides = [...validSlides, newSlide]
      console.log("Updated slides array:", newSlides)
      autoSave(newSlides)
      return newSlides
    })
    setCurrentSlideId(newSlide.id)
    setSelectedElementId(null)
  }, [autoSave])

  /**
   * DELETE SLIDE FUNCTION
   * 
   * Removes a slide from the presentation by ID.
   * Ensures at least one slide always exists in the presentation.
   * Handles current slide selection when the deleted slide was selected.
   * 
   * BEHAVIOR:
   * - If deleting the last slide, creates a new empty slide
   * - If deleting the current slide, selects the first remaining slide
   * - Clears element selection after deletion
   * 
   * @param slideId - ID of the slide to delete
   * @returns void
   */
  const deleteSlide = useCallback(
    (slideId: string) => {
      setSlides((prev) => {
        const filtered = prev.filter((slide) => slide.id !== slideId)
        if (filtered.length === 0) {
          // Always keep at least one slide
          const newSlide: Slide = {
            id: `slide-${Date.now()}`,
            elements: [],
            backgroundColor: "#ffffff",
          }
          setCurrentSlideId(newSlide.id)
          const newSlides = [newSlide]
          autoSave(newSlides)
          return newSlides
        }

        // If we deleted the current slide, select the first remaining slide
        if (slideId === currentSlideId) {
          setCurrentSlideId(filtered[0].id)
        }

        autoSave(filtered)
        return filtered
      })
      setSelectedElementId(null)
    },
    [currentSlideId, autoSave],
  )

  /**
   * DUPLICATE SLIDE FUNCTION
   * 
   * Creates a copy of an existing slide with all its elements.
   * Generates new IDs for all elements to prevent conflicts.
   * Inserts the duplicate after the original slide.
   * 
   * @param slideId - ID of the slide to duplicate
   * @returns void
   */
  const duplicateSlide = useCallback((slideId: string) => {
    setSlides((prev) => {
      const slideIndex = prev.findIndex((slide) => slide.id === slideId)
      if (slideIndex === -1) return prev

      const originalSlide = prev[slideIndex]
      const duplicatedSlide: Slide = {
        id: `slide-${Date.now()}`,
        elements: originalSlide.elements.map((element) => ({
          ...element,
          id: `element-${Date.now()}-${Math.random()}`,
        })),
        backgroundColor: originalSlide.backgroundColor,
      }

      const newSlides = [...prev]
      newSlides.splice(slideIndex + 1, 0, duplicatedSlide)
      autoSave(newSlides)
      return newSlides
    })
  }, [autoSave])

  /**
   * REORDER SLIDES FUNCTION
   * 
   * Changes the order of slides using drag and drop indices.
   * Used by react-dnd for slide reordering functionality.
   * 
   * @param dragIndex - Index of the slide being dragged
   * @param hoverIndex - Index where the slide should be dropped
   * @returns void
   */
  const reorderSlides = useCallback((dragIndex: number, hoverIndex: number) => {
    setSlides((prev) => {
      const newSlides = [...prev]
      const draggedSlide = newSlides[dragIndex]
      newSlides.splice(dragIndex, 1)
      newSlides.splice(hoverIndex, 0, draggedSlide)
      autoSave(newSlides)
      return newSlides
    })
  }, [autoSave])

  /**
   * SET CURRENT SLIDE FUNCTION
   * 
   * Changes the currently selected slide.
   * Clears element selection when switching slides.
   * 
   * @param slideId - ID of the slide to select
   * @returns void
   */
  const setCurrentSlide = useCallback((slideId: string) => {
    setCurrentSlideId(slideId)
    setSelectedElementId(null)
  }, [])

  /**
   * ADD ELEMENT FUNCTION
   * 
   * Adds a new element to a specific slide.
   * Automatically selects the newly added element.
   * 
   * @param slideId - ID of the slide to add the element to
   * @param element - The element to add
   * @returns void
   */
  const addElement = useCallback((slideId: string, element: SlideElement) => {
    setSlides((prev) => {
      const newSlides = prev.map((slide) => 
        slide.id === slideId 
          ? { ...slide, elements: [...slide.elements, element] } 
          : slide
      )
      autoSave(newSlides)
      return newSlides
    })
    setSelectedElementId(element.id)
  }, [autoSave])

  /**
   * UPDATE ELEMENT FUNCTION
   * 
   * Updates properties of an existing element on a slide.
   * Uses partial updates to modify only specific properties.
   * 
   * @param slideId - ID of the slide containing the element
   * @param elementId - ID of the element to update
   * @param updates - Partial object with properties to update
   * @returns void
   */
  const updateElement = useCallback((slideId: string, elementId: string, updates: Partial<SlideElement>) => {
    setSlides((prev) => {
      const newSlides = prev.map((slide) =>
        slide.id === slideId
          ? {
              ...slide,
              elements: slide.elements.map((element) =>
                element.id === elementId ? { ...element, ...updates } : element,
              ),
            }
          : slide,
      )
      autoSave(newSlides)
      return newSlides
    })
  }, [autoSave])

  /**
   * DELETE ELEMENT FUNCTION
   * 
   * Removes an element from a slide by ID.
   * Clears element selection after deletion.
   * 
   * @param slideId - ID of the slide containing the element
   * @param elementId - ID of the element to delete
   * @returns void
   */
  const deleteElement = useCallback((slideId: string, elementId: string) => {
    setSlides((prev) => {
      const newSlides = prev.map((slide) =>
        slide.id === slideId
          ? { ...slide, elements: slide.elements.filter((element) => element.id !== elementId) }
          : slide,
      )
      autoSave(newSlides)
      return newSlides
    })
    setSelectedElementId(null)
  }, [autoSave])

  /**
   * SET SELECTED ELEMENT FUNCTION
   * 
   * Changes the currently selected element.
   * Used for highlighting and editing elements.
   * 
   * @param elementId - ID of the element to select (null to deselect)
   * @returns void
   */
  const setSelectedElement = useCallback((elementId: string | null) => {
    setSelectedElementId(elementId)
  }, [])

  /**
   * BRING TO FRONT FUNCTION
   * 
   * Moves an element to the top of the z-index stack.
   * Calculates the maximum z-index and adds 1 to ensure it's on top.
   * 
   * @param slideId - ID of the slide containing the element
   * @param elementId - ID of the element to bring to front
   * @returns void
   */
  const bringToFront = useCallback((slideId: string, elementId: string) => {
    setSlides((prev) => {
      const newSlides = prev.map((slide) => {
        if (slide.id !== slideId) return slide

        const maxZIndex = Math.max(...slide.elements.map((el) => el.zIndex || 0))
        return {
          ...slide,
          elements: slide.elements.map((element) =>
            element.id === elementId ? { ...element, zIndex: maxZIndex + 1 } : element,
          ),
        }
      })
      autoSave(newSlides)
      return newSlides
    })
  }, [autoSave])

  /**
   * SEND TO BACK FUNCTION
   * 
   * Moves an element to the bottom of the z-index stack.
   * Calculates the minimum z-index and subtracts 1 to ensure it's at the back.
   * 
   * @param slideId - ID of the slide containing the element
   * @param elementId - ID of the element to send to back
   * @returns void
   */
  const sendToBack = useCallback((slideId: string, elementId: string) => {
    setSlides((prev) => {
      const newSlides = prev.map((slide) => {
        if (slide.id !== slideId) return slide

        const minZIndex = Math.min(...slide.elements.map((el) => el.zIndex || 0))
        return {
          ...slide,
          elements: slide.elements.map((element) =>
            element.id === elementId ? { ...element, zIndex: minZIndex - 1 } : element,
          ),
        }
      })
      autoSave(newSlides)
      return newSlides
    })
  }, [autoSave])

  return {
    slides,
    currentSlideId,
    selectedElementId,
    isLoaded,
    addSlide,
    deleteSlide,
    duplicateSlide,
    reorderSlides,
    setCurrentSlide,
    addElement,
    updateElement,
    deleteElement,
    setSelectedElement,
    bringToFront,
    sendToBack,
  }
} 