import React from 'react'
import { AlertTriangle } from 'lucide-react'

// Centralized error fallback configuration
const ERROR_FALLBACK_DEFAULTS = {
  maxZIndex: 2147483647,
  iconSize: {
    large: "h-12 w-12",
    medium: "h-8 w-8",
    small: "h-6 w-6",
  },
  buttonVariants: {
    primary: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors",
    secondary: "px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors",
  },
} as const

// Base error icon component
const ErrorIcon: React.FC<{ size?: keyof typeof ERROR_FALLBACK_DEFAULTS.iconSize }> = ({ 
  size = "large" 
}) => (
  <div className="text-red-400 mb-4">
    <AlertTriangle className={`${ERROR_FALLBACK_DEFAULTS.iconSize[size]} mx-auto`} />
  </div>
)

// Base error fallback component
const BaseErrorFallback: React.FC<{
  title: string
  message?: string
  buttonText?: string
  onRetry?: () => void
  iconSize?: keyof typeof ERROR_FALLBACK_DEFAULTS.iconSize
  buttonVariant?: keyof typeof ERROR_FALLBACK_DEFAULTS.buttonVariants
  className?: string
}> = ({ 
  title, 
  message, 
  buttonText = "Try Again", 
  onRetry = () => window.location.reload(),
  iconSize = "large",
  buttonVariant = "primary",
  className = ""
}) => (
  <div className={`text-center ${className}`}>
    <ErrorIcon size={iconSize} />
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    {message && <p className="text-gray-600 mb-4">{message}</p>}
    <button
      onClick={onRetry}
      className={ERROR_FALLBACK_DEFAULTS.buttonVariants[buttonVariant]}
    >
      {buttonText}
    </button>
  </div>
)

// Modal error fallback (for dialogs, modals, etc.)
export const ModalErrorFallback: React.FC<{
  title?: string
  message?: string
  buttonText?: string
  onRetry?: () => void
}> = ({ 
  title = "Error loading component", 
  message = "Unable to display this component", 
  buttonText,
  onRetry 
}) => (
  <div 
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" 
    style={{ zIndex: ERROR_FALLBACK_DEFAULTS.maxZIndex }}
  >
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
      <BaseErrorFallback
        title={title}
        message={message}
        buttonText={buttonText}
        onRetry={onRetry}
        iconSize="large"
        buttonVariant="primary"
      />
    </div>
  </div>
)

// Panel error fallback (for sidebars, panels, etc.)
export const PanelErrorFallback: React.FC<{
  title?: string
  message?: string
  buttonText?: string
  onRetry?: () => void
  headerContent?: React.ReactNode
}> = ({ 
  title = "Unable to load content", 
  message = "There was an error loading this section", 
  buttonText,
  onRetry,
  headerContent
}) => (
  <div className="h-full flex flex-col">
    {headerContent && (
      <div className="p-4 border-b border-gray-200">
        {headerContent}
      </div>
    )}
    <div className="flex-1 p-4">
      <div className="text-center py-8">
        <BaseErrorFallback
          title={title}
          message={message}
          buttonText={buttonText}
          onRetry={onRetry}
          iconSize="medium"
          buttonVariant="secondary"
        />
      </div>
    </div>
  </div>
)

// Inline error fallback (for smaller components)
export const InlineErrorFallback: React.FC<{
  title?: string
  message?: string
  buttonText?: string
  onRetry?: () => void
}> = ({ 
  title = "Error", 
  message = "Something went wrong", 
  buttonText,
  onRetry 
}) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
    <BaseErrorFallback
      title={title}
      message={message}
      buttonText={buttonText}
      onRetry={onRetry}
      iconSize="small"
      buttonVariant="secondary"
    />
  </div>
)

// Specific error fallbacks for common use cases
export const ConfirmationDialogErrorFallback: React.FC = () => (
  <ModalErrorFallback
    title="Error loading dialog"
    message="Unable to display confirmation dialog"
  />
)

export const SaveSlideModalErrorFallback: React.FC = () => (
  <ModalErrorFallback
    title="Error loading save modal"
    message="Unable to display save slide dialog"
  />
)

export const TemplatesPanelErrorFallback: React.FC = () => (
  <PanelErrorFallback
    title="Unable to load templates"
    message="There was an error loading the templates section"
    headerContent={
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Templates</h2>
      </div>
    }
  />
)

export const SlidesPanelErrorFallback: React.FC = () => (
  <PanelErrorFallback
    title="Unable to load slides"
    message="There was an error loading the slides panel"
    headerContent={
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Slides</h2>
      </div>
    }
  />
)

export const CanvasErrorFallback: React.FC = () => (
  <InlineErrorFallback
    title="Canvas Error"
    message="Unable to render the canvas"
  />
)

export const ToolbarErrorFallback: React.FC = () => (
  <InlineErrorFallback
    title="Toolbar Error"
    message="Unable to load the toolbar"
  />
)

// Generic error fallback for unknown components
export const GenericErrorFallback: React.FC<{
  componentName?: string
}> = ({ componentName = "component" }) => (
  <ModalErrorFallback
    title={`Error loading ${componentName}`}
    message={`Unable to display ${componentName}`}
  />
) 