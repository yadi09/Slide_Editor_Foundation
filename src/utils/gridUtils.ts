// Simple grid snapping utility
export const snapToGrid = (position: number, gridSize: number): number => {
  return Math.round(position / gridSize) * gridSize
}

// Snap both x and y coordinates
export const snapPositionToGrid = (x: number, y: number, gridSize: number): { x: number; y: number } => {
  return {
    x: snapToGrid(x, gridSize),
    y: snapToGrid(y, gridSize)
  }
} 