import React, { useState, useRef, useEffect } from 'react'
import type { SlideElement } from '@/types'
import { ErrorBoundary } from '@/components/common'
import { Upload, AlertCircle, Loader2 } from "lucide-react"

// Centralized configuration and constants
const IMAGE_DEFAULTS = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'] as const,
  placeholderText: "No image",
  uploadText: "Upload Image",
  urlPlaceholder: "Image URL",
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
} as const

interface ImageElementProps {
  element: SlideElement
  isSelected: boolean
  onUpdate: (updates: Partial<SlideElement>) => void
}

// Validation functions
const validateImageFile = (file: File): string | null => {
  if (file.size > IMAGE_DEFAULTS.maxFileSize) {
    return `File too large (max ${IMAGE_DEFAULTS.maxFileSize / (1024 * 1024)}MB)`
  }
  if (!IMAGE_DEFAULTS.allowedTypes.includes(file.type as any)) {
    return `Invalid file type. Allowed: ${IMAGE_DEFAULTS.allowedTypes.join(', ')}`
  }
  return null
}

const validateImageUrl = (url: string): string | null => {
  if (!url.trim()) return null
  try {
    new URL(url)
    return null
  } catch {
    return "Invalid URL format"
  }
}

// Image optimization function
const optimizeImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img
        const maxWidth = IMAGE_DEFAULTS.maxWidth
        const maxHeight = IMAGE_DEFAULTS.maxHeight
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type }))
            } else {
              reject(new Error("Failed to optimize image"))
            }
          },
          file.type,
          IMAGE_DEFAULTS.quality
        )
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => reject(new Error("Failed to load image for optimization"))
    img.src = URL.createObjectURL(file)
  })
}

// Error fallback component
const ImageElementErrorFallback: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center text-red-500 text-sm border border-red-200 rounded p-2">
    Error rendering image element
  </div>
)

export const ImageElement: React.FC<ImageElementProps> = ({ element, isSelected, onUpdate }) => {
  const [imageUrl, setImageUrl] = useState(element.content || "")
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync imageUrl with element.content when it changes from external sources (like template population)
  useEffect(() => {
    if (element.content && element.content !== imageUrl) {
      setImageUrl(element.content)
      setLoadError(null) // Clear any previous errors
    }
  }, [element.content, imageUrl])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const fileError = validateImageFile(file)
    if (fileError) {
      setValidationError(fileError)
      return
    }

    setIsLoading(true)
    setValidationError(null)
    setLoadError(null)

    try {
      // Optimize image
      const optimizedFile = await optimizeImage(file)
      
      // Convert to data URL
      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target?.result as string
        setImageUrl(url)
        onUpdate({ content: url })
        setIsLoading(false)
      }
      reader.onerror = () => {
        setLoadError("Failed to read file")
        setIsLoading(false)
      }
      reader.readAsDataURL(optimizedFile)
    } catch (error) {
      console.error('Image optimization failed:', error)
      setLoadError("Failed to process image")
      setIsLoading(false)
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setImageUrl(url)
    
    // Validate URL
    const urlError = validateImageUrl(url)
    setValidationError(urlError)
    
    if (!urlError) {
      onUpdate({ content: url })
      setLoadError(null)
    }
  }

  const handleImageLoad = () => {
    setLoadError(null)
    setIsLoading(false)
  }

  const handleImageError = () => {
    setLoadError("Failed to load image")
    setIsLoading(false)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <ErrorBoundary fallback={ImageElementErrorFallback}>
      <div className="w-full h-full relative group">
        {imageUrl && !loadError ? (
          <div className="w-full h-full relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Processing image...</span>
                </div>
              </div>
            )}
            <img
              src={imageUrl}
              alt="Slide image"
              className="w-full h-full object-cover rounded"
              style={{
                borderRadius: element.style?.borderRadius || 0,
              }}
              onLoad={handleImageLoad}
              onError={handleImageError}
              role="img"
              aria-label="Presentation image"
            />
          </div>
        ) : (
          <div className="w-full h-full border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50">
            <div className="text-center">
              {loadError ? (
                <div className="text-red-500 text-sm mb-2 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {loadError}
                </div>
              ) : (
                <div className="text-gray-400 text-sm mb-2">{IMAGE_DEFAULTS.placeholderText}</div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={IMAGE_DEFAULTS.allowedTypes.join(',')}
                onChange={handleImageUpload}
                className="hidden"
                id={`image-upload-${element.id}`}
                aria-label="Upload image file"
              />
              <button
                onClick={handleUploadClick}
                className="text-blue-600 text-sm cursor-pointer hover:text-blue-700 flex items-center justify-center mx-auto"
                disabled={isLoading}
                aria-label="Upload image"
              >
                <Upload className="w-4 h-4 mr-1" />
                {isLoading ? "Processing..." : IMAGE_DEFAULTS.uploadText}
              </button>
            </div>
          </div>
        )}

        {/* Image controls - only show when selected */}
        {isSelected && (
          <div className="absolute -top-10 left-0 bg-white border border-gray-200 rounded shadow-lg p-2 z-20">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder={IMAGE_DEFAULTS.urlPlaceholder}
                value={imageUrl}
                onChange={handleUrlChange}
                className="text-xs border border-gray-300 rounded px-2 py-1 w-48"
                onClick={(e) => e.stopPropagation()}
                aria-label="Image URL input"
                disabled={isLoading}
              />
              {validationError && (
                <div className="text-red-500 text-xs flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {validationError}
                </div>
              )}
            </div>
            {validationError && (
              <div className="text-red-500 text-xs mt-1">
                {validationError}
              </div>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
} 