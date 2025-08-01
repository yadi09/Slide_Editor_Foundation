import React, { useState, useEffect, useCallback } from 'react'
import { X, AlertTriangle, AlertCircle, Info, Loader2 } from 'lucide-react'
import { createPortal } from 'react-dom'
import { ErrorBoundary, ConfirmationDialogErrorFallback } from '@/components/common'

// Centralized configuration and constants
const CONFIRMATION_DEFAULTS = {
  maxZIndex: 2147483647,
  animationDuration: 200,
  variants: {
    danger: { 
      bgColor: "bg-red-600", 
      hoverColor: "hover:bg-red-700",
      icon: AlertTriangle,
      iconColor: "text-red-500",
      title: "Confirm Action"
    },
    warning: { 
      bgColor: "bg-yellow-600", 
      hoverColor: "hover:bg-yellow-700",
      icon: AlertCircle,
      iconColor: "text-yellow-500",
      title: "Warning"
    },
    info: { 
      bgColor: "bg-blue-600", 
      hoverColor: "hover:bg-blue-700",
      icon: Info,
      iconColor: "text-blue-500",
      title: "Information"
    },
  },
} as const

type ConfirmationVariant = keyof typeof CONFIRMATION_DEFAULTS.variants

interface ConfirmationDialogProps {
  message: string
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  isOpen: boolean
  variant?: ConfirmationVariant
  title?: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  disabled?: boolean
}

// Validation function
const validateProps = (props: ConfirmationDialogProps): string | null => {
  if (!props.message || props.message.trim().length === 0) {
    return "Message is required"
  }
  if (typeof props.onConfirm !== "function") {
    return "onConfirm must be a function"
  }
  if (typeof props.onCancel !== "function") {
    return "onCancel must be a function"
  }
  if (props.variant && !Object.keys(CONFIRMATION_DEFAULTS.variants).includes(props.variant)) {
    return `Invalid variant: ${props.variant}`
  }
  return null
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  message,
  onConfirm,
  onCancel,
  isOpen,
  variant = "danger",
  title,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  disabled = false
}) => {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Validate props on mount and when they change
  useEffect(() => {
    const error = validateProps({ message, onConfirm, onCancel, isOpen, variant })
    if (error) {
      console.error('ConfirmationDialog validation error:', error)
      setValidationError(error)
    } else {
      setValidationError(null)
    }
  }, [message, onConfirm, onCancel, isOpen, variant])

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      // Lock body scroll and prevent background interaction
      document.body.style.overflow = "hidden"
      document.body.style.position = "fixed"
      document.body.style.top = "0"
      document.body.style.left = "0"
      document.body.style.right = "0"
      document.body.style.bottom = "0"
    } else {
      // Restore body scroll
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.left = ""
      document.body.style.right = ""
      document.body.style.bottom = ""
    }

    return () => {
      // Cleanup: restore body scroll
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.left = ""
      document.body.style.right = ""
      document.body.style.bottom = ""
    }
  }, [isOpen])

  const handleConfirm = useCallback(async () => {
    if (disabled || isLoading || isConfirming) return

    setIsConfirming(true)
    try {
      await onConfirm()
    } catch (error) {
      console.error('Confirmation action failed:', error)
    } finally {
      setIsConfirming(false)
    }
  }, [onConfirm, disabled, isLoading, isConfirming])

  const handleCancel = useCallback(async () => {
    if (disabled || isLoading || isCancelling) return

    setIsCancelling(true)
    try {
      await onCancel()
    } catch (error) {
      console.error('Cancel action failed:', error)
    } finally {
      setIsCancelling(false)
    }
  }, [onCancel, disabled, isLoading, isCancelling])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel()
    }
    if (e.key === "Enter" && !disabled && !isLoading && !isConfirming) {
      e.preventDefault()
      handleConfirm()
    }
  }, [handleCancel, handleConfirm, disabled, isLoading, isConfirming])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!mounted || !isOpen) return null

  if (validationError) {
    return (
      <ErrorBoundary fallback={ConfirmationDialogErrorFallback}>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: CONFIRMATION_DEFAULTS.maxZIndex }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <AlertTriangle className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium mb-2">Invalid dialog configuration</h3>
              <p className="text-gray-600 mb-4">{validationError}</p>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  const variantConfig = CONFIRMATION_DEFAULTS.variants[variant]
  const IconComponent = variantConfig.icon
  const dialogTitle = title || variantConfig.title
  const isProcessing = isLoading || isConfirming || isCancelling

  return createPortal(
    <ErrorBoundary fallback={ConfirmationDialogErrorFallback}>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        style={{ zIndex: CONFIRMATION_DEFAULTS.maxZIndex }}
        onClick={handleCancel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        tabIndex={-1}
      >
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <IconComponent className={`w-6 h-6 ${variantConfig.iconColor}`} />
              <h3 id="dialog-title" className="text-lg font-semibold text-gray-900">
                {dialogTitle}
              </h3>
            </div>
            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p id="dialog-description" className="text-gray-700">
              {message}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Cancel action"
            >
              {isCancelling ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Cancelling...
                </>
              ) : (
                cancelText
              )}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${variantConfig.bgColor} ${variantConfig.hoverColor}`}
              aria-label="Confirm action"
            >
              {isConfirming ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Confirming...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </ErrorBoundary>,
    document.body
  )
} 