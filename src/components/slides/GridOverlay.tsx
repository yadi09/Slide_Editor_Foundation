import type React from "react"
import type { GridSettings } from '@/types'

export const GridOverlay: React.FC<GridSettings> = ({
  enabled,
  size,
}) => {
  if (!enabled) return null

  // Create grid lines using CSS
  const gridStyle = {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: `
      linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
    `,
    backgroundSize: `${size}px ${size}px`,
    pointerEvents: "none" as const,
    zIndex: 1,
  }

  return <div style={gridStyle} />
} 