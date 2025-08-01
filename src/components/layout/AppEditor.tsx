import React from 'react'
import { Toolbar } from '@/components/panels'
import { Canvas } from '@/components/slides'
import { TextFormatPanel } from '@/components/panels'
import type { SlideElement } from '@/types'
import type { ElementType } from '@/constants/appConstants'

/**
 * App Editor Component
 * Handles the center editor area with toolbar, canvas, and text formatting
 */
interface AppEditorProps {
  currentSlide: any
  selectedElementId: string | null
  selectedElement: any
  gridEnabled: boolean
  gridSize: number
  onAddElement: (type: ElementType) => void
  onBringToFront: () => void
  onSendToBack: () => void
  onDeleteElement: () => void
  onSaveSlide: () => void
  onToggleGrid: () => void
  onElementSelect: (elementId: string | null) => void
  onElementUpdate: (elementId: string, updates: Partial<SlideElement>) => void
}

export const AppEditor: React.FC<AppEditorProps> = ({
  currentSlide,
  selectedElementId,
  selectedElement,
  gridEnabled,
  gridSize,
  onAddElement,
  onBringToFront,
  onSendToBack,
  onDeleteElement,
  onSaveSlide,
  onToggleGrid,
  onElementSelect,
  onElementUpdate
}) => {
  return (
    <div className="flex-1 flex flex-col">
      {/* Toolbar */}
      <Toolbar
        onAddElement={onAddElement}
        selectedElementId={selectedElementId}
        onBringToFront={onBringToFront}
        onSendToBack={onSendToBack}
        onDeleteElement={onDeleteElement}
        onSaveSlide={onSaveSlide}
        gridEnabled={gridEnabled}
        onToggleGrid={onToggleGrid}
      />

      {/* Text Format Panel - Only show for text elements */}
      {selectedElement?.type === "text" && (
        <TextFormatPanel
          element={selectedElement}
          onUpdate={(updates) => onElementUpdate(selectedElement.id, updates)}
        />
      )}

      {/* Canvas */}
      <div className="flex-1 p-8 overflow-auto bg-gray-100">
        <Canvas
          slide={currentSlide}
          selectedElementId={selectedElementId}
          onElementSelect={onElementSelect}
          onElementUpdate={onElementUpdate}
          gridEnabled={gridEnabled}
          gridSize={gridSize}
        />
      </div>
    </div>
  )
} 