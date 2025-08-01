import type React from "react"
import { Type, ImageIcon, Square, BringToFront, SendToBack, Trash2, Save, Grid3X3 } from "lucide-react"

interface ToolbarProps {
  onAddElement: (type: "text" | "image" | "shape") => void
  selectedElementId: string | null
  onBringToFront: () => void
  onSendToBack: () => void
  onDeleteElement: () => void
  gridEnabled: boolean
  onSaveSlide: () => void
  onToggleGrid: () => void
}

// Reusable button component
const ToolbarButton: React.FC<{
  onClick: () => void
  icon: React.ReactNode
  label: string
  title?: string
  disabled?: boolean
  variant?: 'default' | 'danger' | 'primary'
}> = ({ onClick, icon, label, title, disabled = false, variant = 'default' }) => {
  const getButtonStyles = () => {
    const baseStyles = "flex items-center space-x-1 px-3 py-1.5 text-sm rounded-md transition-colors"
    
    if (disabled) {
      return `${baseStyles} opacity-50 cursor-not-allowed text-gray-400 bg-gray-50`
    }
    
    switch (variant) {
      case 'danger':
        return `${baseStyles} text-red-600 bg-red-50 hover:bg-red-100`
      case 'primary':
        return `${baseStyles} text-blue-600 bg-blue-50 hover:bg-blue-100`
      default:
        return `${baseStyles} text-gray-700 bg-gray-50 hover:bg-gray-100`
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={getButtonStyles()}
      title={title}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

// Reusable divider component
const ToolbarDivider: React.FC = () => (
  <div className="h-6 w-px bg-gray-300" />
)

// Reusable section component
const ToolbarSection: React.FC<{
  label: string
  children: React.ReactNode
}> = ({ label, children }) => (
  <div className="flex items-center space-x-2">
    <span className="text-sm font-medium text-gray-700">{label}:</span>
    {children}
  </div>
)

// Data-driven element configuration
const ELEMENT_TOOLS = [
  { type: "text" as const, icon: <Type className="w-4 h-4" />, label: "Text", title: "Add text" },
  { type: "image" as const, icon: <ImageIcon className="w-4 h-4" />, label: "Image", title: "Add image" },
  { type: "shape" as const, icon: <Square className="w-4 h-4" />, label: "Shape", title: "Add shape" },
]

// Data-driven element management tools
const ELEMENT_MANAGEMENT_TOOLS = [
  { action: 'bringToFront' as const, icon: <BringToFront className="w-4 h-4" />, label: "Front", title: "Bring to front" },
  { action: 'sendToBack' as const, icon: <SendToBack className="w-4 h-4" />, label: "Back", title: "Send to back" },
  { action: 'delete' as const, icon: <Trash2 className="w-4 h-4" />, label: "Delete", title: "Delete element", variant: 'danger' as const },
]

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddElement,
  selectedElementId,
  onBringToFront,
  onSendToBack,
  onDeleteElement,
  onSaveSlide,
  gridEnabled,
  onToggleGrid,
}) => {
  // Action handlers for element management
  const elementActionHandlers = {
    bringToFront: onBringToFront,
    sendToBack: onSendToBack,
    delete: onDeleteElement,
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center space-x-4">
        {/* Add Elements */}
        <ToolbarSection label="Add">
          {ELEMENT_TOOLS.map((tool) => (
            <ToolbarButton
              key={tool.type}
              onClick={() => onAddElement(tool.type)}
              icon={tool.icon}
              label={tool.label}
              title={tool.title}
            />
          ))}
        </ToolbarSection>

        <ToolbarDivider />

        {/* Element Actions */}
        <ToolbarSection label="Element">
          {ELEMENT_MANAGEMENT_TOOLS.map((tool) => (
            <ToolbarButton
              key={tool.action}
              onClick={elementActionHandlers[tool.action]}
              icon={tool.icon}
              label={tool.label}
              title={tool.title}
              disabled={!selectedElementId}
              variant={tool.variant}
            />
          ))}
        </ToolbarSection>

        <ToolbarDivider />

        {/* Grid Toggle */}
        <ToolbarButton
          onClick={onToggleGrid}
          icon={<Grid3X3 className="w-4 h-4" />}
          label="Grid"
          title="Toggle grid"
          variant={gridEnabled ? 'primary' : 'default'}
        />

        <ToolbarDivider />

        {/* Slide Actions */}
        <ToolbarButton
          onClick={onSaveSlide}
          icon={<Save className="w-4 h-4" />}
          label="Save Slide"
          title="Save slide for reuse"
          variant="primary"
        />
      </div>
    </div>
  )
} 