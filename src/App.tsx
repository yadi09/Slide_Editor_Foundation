import { useState, useCallback, useEffect, useMemo } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { useSlideStore } from "@/hooks/useSlideStore"
import { exportToPDF } from "@/utils/exportUtils"
import { populateTemplate } from "@/utils/templateUtils"
import { getSavedSlides, saveSlideToStorage, deleteSavedSlide } from "@/utils/savedSlidesUtils"
import { clearPresentation } from "@/utils/presentationStorage"
import { mockRealEstateData } from "@/data/mockData"
import type { SavedSlide, SlideElement } from "@/types"
import { showToast } from "@/utils/toastUtils"
import { Toaster } from "react-hot-toast"
import { APP_CONSTANTS, getElementDimensions, getDefaultStyles, getElementMessage, type ElementType } from "@/constants/appConstants"
import { 
  AppHeader, 
  AppSidebar, 
  AppEditor, 
  AppTemplatesSidebar,
  PreviewModal,
  SaveSlideModal,
  ConfirmationDialog,
  ErrorBoundary 
} from "@/components"

/**
 * Main App Component
 * Orchestrates all the sub-components and manages global state
 */
function App() {
  // Central state management from custom hook
  const {
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
  } = useSlideStore()

  // Local UI state
  const [showPreview, setShowPreview] = useState(false)
  const [showTemplates, setShowTemplates] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [isPopulating, setIsPopulating] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [savedSlides, setSavedSlides] = useState<SavedSlide[]>([])
  const [gridEnabled, setGridEnabled] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null)
  const [confirmMessage, setConfirmMessage] = useState("")

  // Memoized computed values for performance
  const currentSlide = useMemo(() => 
    slides.find((slide) => slide.id === currentSlideId), 
    [slides, currentSlideId]
  )
  
  const selectedElement = useMemo(() => 
    currentSlide?.elements.find((el: any) => el.id === selectedElementId),
    [currentSlide, selectedElementId]
  )

  // Load saved slides on mount
  useEffect(() => {
    try {
      const saved = getSavedSlides()
      setSavedSlides(saved)
    } catch (error) {
      console.error('Failed to load saved slides:', error)
      showToast.error(APP_CONSTANTS.MESSAGES.ERRORS.FAILED_TO_LOAD_SAVED_SLIDES)
    }
  }, [])

  // Confirmation dialog handler
  const showConfirmation = useCallback((message: string, onConfirm: () => void) => {
    setConfirmMessage(message)
    setConfirmAction(() => onConfirm)
    setShowConfirmDialog(true)
  }, [])

  // Wrapper for addSlide to prevent event objects from being passed
  const handleAddSlide = useCallback(() => {
    addSlide()
  }, [addSlide])

  // Element management handlers
  const handleAddElement = useCallback(
    (type: ElementType) => {
      if (!currentSlideId) {
        showToast.warning(APP_CONSTANTS.MESSAGES.WARNINGS.NO_SLIDE_SELECTED)
        return
      }

      const { DEFAULT_ELEMENT_POSITION } = APP_CONSTANTS
      const dimensions = getElementDimensions(type)
      const defaultStyles = getDefaultStyles(type)

      const newElement: SlideElement = {
        id: `element-${Date.now()}`,
        type,
        x: DEFAULT_ELEMENT_POSITION.x,
        y: DEFAULT_ELEMENT_POSITION.y,
        width: dimensions.width,
        height: dimensions.height,
        content: type === "text" ? "Click to add text" : "",
        style: defaultStyles,
        zIndex: Date.now(),
      }

      try {
        addElement(currentSlideId, newElement)
        setSelectedElement(newElement.id)
        showToast.success(getElementMessage(type))
      } catch (error) {
        console.error('Failed to add element:', error)
        showToast.error(APP_CONSTANTS.MESSAGES.ERRORS.FAILED_TO_ADD_ELEMENT)
      }
    },
    [currentSlideId, addElement, setSelectedElement],
  )

  // Template population handler
  const handlePopulateTemplate = useCallback(async () => {
    if (!currentSlideId || !currentSlide) {
      showToast.warning(APP_CONSTANTS.MESSAGES.WARNINGS.NO_SLIDE_SELECTED)
      return
    }

    setIsPopulating(true)
    try {
      const populatedSlide = populateTemplate(currentSlide, mockRealEstateData)
      populatedSlide.elements.forEach((element) => {
        updateElement(currentSlideId, element.id, { content: element.content })
      })
      showToast.success(APP_CONSTANTS.MESSAGES.TEMPLATE_POPULATED)
    } catch (error) {
      console.error('Failed to populate template:', error)
      showToast.error(APP_CONSTANTS.MESSAGES.ERRORS.FAILED_TO_POPULATE_TEMPLATE)
    } finally {
      setIsPopulating(false)
    }
  }, [currentSlideId, currentSlide, updateElement])

  // PDF export handler
  const handleExportPDF = useCallback(async () => {
    if (slides.length === 0) {
      showToast.warning(APP_CONSTANTS.MESSAGES.WARNINGS.NO_SLIDES_TO_EXPORT)
      return
    }

    setIsExporting(true)
    try {
      await exportToPDF(slides, APP_CONSTANTS.FILES.DEFAULT_PDF_NAME)
      showToast.success(APP_CONSTANTS.MESSAGES.PDF_EXPORTED)
    } catch (error) {
      console.error("Export failed:", error)
      showToast.error(APP_CONSTANTS.MESSAGES.ERRORS.FAILED_TO_EXPORT_PDF)
    } finally {
      setIsExporting(false)
    }
  }, [slides])

  // Save slide handler
  const handleSaveSlide = useCallback((name: string) => {
    if (!currentSlide) {
      showToast.warning(APP_CONSTANTS.MESSAGES.WARNINGS.NO_SLIDE_TO_SAVE)
      return
    }
    
    try {
      saveSlideToStorage(currentSlide, name)
      // Reload saved slides
      const saved = getSavedSlides()
      setSavedSlides(saved)
      showToast.success(APP_CONSTANTS.MESSAGES.SLIDE_SAVED(name))
    } catch (error) {
      console.error("Failed to save slide:", error)
      showToast.error(APP_CONSTANTS.MESSAGES.ERRORS.FAILED_TO_SAVE_SLIDE)
      throw error
    }
  }, [currentSlide])

  // Delete saved slide handler
  const handleDeleteSavedSlide = useCallback((id: string) => {
    const savedSlide = savedSlides.find(s => s.id === id)
    showConfirmation(
      APP_CONSTANTS.CONFIRMATIONS.DELETE_SAVED_SLIDE(savedSlide?.name || ''),
      () => {
        try {
          deleteSavedSlide(id)
          // Reload saved slides
          const saved = getSavedSlides()
          setSavedSlides(saved)
          showToast.success(APP_CONSTANTS.MESSAGES.SLIDE_DELETED)
        } catch (error) {
          console.error("Failed to delete saved slide:", error)
          showToast.error(APP_CONSTANTS.MESSAGES.ERRORS.FAILED_TO_DELETE_SLIDE)
        }
      }
    )
  }, [savedSlides, showConfirmation])

  // Save slide click handler
  const handleSaveSlideClick = useCallback(() => {
    if (!currentSlide) {
      showToast.warning(APP_CONSTANTS.MESSAGES.WARNINGS.NO_SLIDE_TO_SAVE)
      return
    }
    setShowSaveModal(true)
  }, [currentSlide])

  // Clear presentation handler
  const handleClearPresentation = useCallback(() => {
    showConfirmation(
      APP_CONSTANTS.CONFIRMATIONS.CLEAR_PRESENTATION,
      () => {
        try {
          clearPresentation()
          showToast.success(APP_CONSTANTS.MESSAGES.PRESENTATION_CLEARED)
          window.location.reload() // Reload to reset to default state
        } catch (error) {
          console.error("Failed to clear presentation:", error)
          showToast.error(APP_CONSTANTS.MESSAGES.ERRORS.FAILED_TO_CLEAR_PRESENTATION)
        }
      }
    )
  }, [showConfirmation])

  // Template selection handler
  const handleSelectTemplate = useCallback((template: any) => {
    try {
      // Add template as new slide
      const newSlide = {
        ...template,
        id: `slide-${Date.now()}`,
        elements: template.elements.map((el: any) => ({
          ...el,
          id: `element-${Date.now()}-${Math.random()}`,
        })),
      }
      addSlide(newSlide)
      setCurrentSlide(newSlide.id)
      showToast.success("Template added as new slide!")
    } catch (error) {
      console.error("Failed to add template:", error)
      showToast.error(APP_CONSTANTS.MESSAGES.ERRORS.FAILED_TO_ADD_TEMPLATE)
    }
  }, [addSlide, setCurrentSlide])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === APP_CONSTANTS.KEYBOARD_SHORTCUTS.GRID_TOGGLE) {
        e.preventDefault()
        setGridEnabled(!gridEnabled)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [gridEnabled])

  // Loading state
  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          <div className={`animate-spin rounded-full ${APP_CONSTANTS.UI.LOADING_SPINNER_SIZE} border-b-2 border-blue-600 mx-auto mb-4`}></div>
          <div className="text-gray-600">Loading presentation...</div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <DndProvider backend={HTML5Backend}>
        <div className="h-screen flex flex-col bg-gray-100">
          {/* Header */}
          <AppHeader
            slides={slides}
            currentSlideId={currentSlideId}
            isExporting={isExporting}
            isPopulating={isPopulating}
            onPopulateTemplate={handlePopulateTemplate}
            onExportPDF={handleExportPDF}
            onClearPresentation={handleClearPresentation}
            onShowPreview={() => setShowPreview(true)}
          />

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Slides */}
            <AppSidebar
              slides={slides}
              currentSlideId={currentSlideId}
              onSlideSelect={setCurrentSlide}
              onAddSlide={handleAddSlide}
              onDeleteSlide={deleteSlide}
              onDuplicateSlide={duplicateSlide}
              onReorderSlides={reorderSlides}
              onShowConfirmation={showConfirmation}
            />

            {/* Center - Editor */}
            <AppEditor
              currentSlide={currentSlide}
              selectedElementId={selectedElementId}
              selectedElement={selectedElement}
              currentSlideId={currentSlideId}
              gridEnabled={gridEnabled}
              gridSize={APP_CONSTANTS.GRID_SIZE}
              onAddElement={handleAddElement}
              onBringToFront={() => selectedElementId && currentSlideId && bringToFront(currentSlideId, selectedElementId)}
              onSendToBack={() => selectedElementId && currentSlideId && sendToBack(currentSlideId, selectedElementId)}
              onDeleteElement={() => selectedElementId && currentSlideId && deleteElement(currentSlideId, selectedElementId)}
              onSaveSlide={handleSaveSlideClick}
              onToggleGrid={() => setGridEnabled(!gridEnabled)}
              onElementSelect={setSelectedElement}
              onElementUpdate={(elementId, updates) => currentSlideId && updateElement(currentSlideId, elementId, updates)}
            />

            {/* Right Sidebar - Templates */}
            <AppTemplatesSidebar
              showTemplates={showTemplates}
              savedSlides={savedSlides}
              onCloseTemplates={() => setShowTemplates(false)}
              onSelectTemplate={handleSelectTemplate}
              onDeleteSavedSlide={handleDeleteSavedSlide}
              onSaveCurrentSlide={handleSaveSlideClick}
            />
          </div>

          {/* Modals */}
          {showPreview && <PreviewModal slides={slides} onClose={() => setShowPreview(false)} />}
          
          <SaveSlideModal
            slide={currentSlide || null}
            onSave={handleSaveSlide}
            onClose={() => setShowSaveModal(false)}
            isOpen={showSaveModal}
          />

          <ConfirmationDialog
            message={confirmMessage}
            onConfirm={() => {
              confirmAction?.()
              setShowConfirmDialog(false)
              setConfirmAction(null)
            }}
            onCancel={() => {
              setShowConfirmDialog(false)
              setConfirmAction(null)
            }}
            isOpen={showConfirmDialog}
          />

          {/* Toast Notifications */}
          <Toaster />
        </div>
      </DndProvider>
    </ErrorBoundary>
  )
}

export default App
