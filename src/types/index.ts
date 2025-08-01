export interface SlideElement {
  id: string
  type: "text" | "image" | "shape"
  x: number
  y: number
  width: number
  height: number
  content?: string
  style?: {
    backgroundColor?: string
    color?: string
    fontSize?: number
    fontWeight?: string
    fontStyle?: string
    textDecoration?: string
    textAlign?: "left" | "center" | "right"
    borderRadius?: number | string
  }
  zIndex?: number
}

export interface Slide {
  id: string
  elements: SlideElement[]
  backgroundColor?: string
}

export interface SavedSlide {
  id: string
  name: string
  slide: Slide
  createdAt: Date
  thumbnail?: string
}

export interface GridSettings {
  enabled: boolean
  size: number
}

export interface RealEstateData {
  address: string
  price: string
  bedrooms: number
  bathrooms: number
  sqft: number
  yearBuilt: number
  propertyType: string
  description: string
  agent: {
    name: string
    phone: string
    email: string
  }
  images: string[]
} 