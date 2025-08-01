import type { RealEstateData } from "../types"

export const mockRealEstateData: RealEstateData = {
  address: "1234 Oak Street, Beverly Hills, CA 90210",
  price: "$2,500,000",
  bedrooms: 4,
  bathrooms: 3,
  sqft: 3200,
  yearBuilt: 2018,
  propertyType: "Single Family Home",
  description: "Stunning modern home with open floor plan, high ceilings, and premium finishes throughout. Features a gourmet kitchen with stainless steel appliances, master suite with walk-in closet, and beautiful outdoor living space.",
  agent: {
    name: "Sarah Johnson",
    phone: "(310) 555-0123",
    email: "sarah.johnson@realestate.com",
  },
  images: [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
  ],
} 