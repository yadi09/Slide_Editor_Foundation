import type { Slide, RealEstateData } from "../types"

// @hideable: true
/**
 * TEMPLATE POPULATION ENGINE
 * 
 * This function transforms a slide template (with placeholder text) into a populated slide (with real data).
 * It demonstrates advanced programming concepts including functional programming, type safety, and error handling.
 * 
 * @param slide - The template slide containing placeholder elements like "{{address}}", "{{price}}"
 * @param data - Real estate data object containing actual property information
 * @returns A new slide with all placeholders replaced with real data
 * 
 * EXAMPLE INPUT:
 * slide.elements = [
 *   { content: "{{address}}" },           // Will become "123 Main St"
 *   { content: "Price: {{price}}" },     // Will become "Price: $750,000"
 *   { content: "{{images[0]}}" }         // Will become actual image URL
 * ]
 * 
 * EXAMPLE OUTPUT:
 * slide.elements = [
 *   { content: "123 Main St" },
 *   { content: "Price: $750,000" },
 *   { content: "https://example.com/image1.jpg" }
 * ]
 * 
 * TECHNICAL DETAILS:
 * 
 * 1. FUNCTIONAL PROGRAMMING:
 *    - Uses map() to transform array without modifying original (immutable pattern)
 *    - Creates new objects instead of mutating existing ones
 * 
 * 2. TYPE SAFETY:
 *    - TypeScript ensures data structure compliance
 *    - Record<string, string> = object with string keys and string values
 * 
 * 3. ERROR HANDLING:
 *    - Null checks prevent crashes with empty content
 *    - Array bounds validation prevents "Cannot read property of undefined"
 *    - Graceful degradation: keeps original if replacement fails
 * 
 * 4. REGEX PROCESSING:
 *    - .match() returns: RegExpMatchArray | null
 *    - RegExpMatchArray = [full match, group1, group2, ...]
 *    - Example: "{{images[2]}}" → ["{{images[2]}}", "2"]
 *    - imageMatch[0] = full match, imageMatch[1] = first captured group
 * 
 * 5. DATA TRANSFORMATION:
 *    - toString() converts numbers to strings
 *    - toLocaleString() formats numbers with commas (e.g., "2,500")
 *    - Nested object access: data.agent.name
 * 
 * 6. PERFORMANCE OPTIMIZATION:
 *    - Object.entries() for efficient iteration
 *    - Global regex flag "g" replaces all occurrences and ["{{address}}" becomes a RegExp like /{{address}}/g ]
 *    - Early returns prevent unnecessary processing
 */
export const populateTemplate = (slide: Slide, data: RealEstateData): Slide => {
  const populatedElements = slide.elements.map((element) => {
    if (!element.content) {
      return element
    }

    let populatedContent = element.content

    // Replace placeholders with actual data 
    const replacements: Record<string, string> = {
      "{{address}}": data.address,
      "{{price}}": data.price,
      "{{bedrooms}}": data.bedrooms.toString(),
      "{{bathrooms}}": data.bathrooms.toString(),
      "{{sqft}}": data.sqft.toLocaleString(),
      "{{yearBuilt}}": data.yearBuilt.toString(),
      "{{propertyType}}": data.propertyType,
      "{{description}}": data.description,
      "{{agent.name}}": data.agent.name,
      "{{agent.phone}}": data.agent.phone,
      "{{agent.email}}": data.agent.email,
    }

    // Handle image placeholders
    if (element.type === "image" && element.content.includes("{{images[")) {
      // Extract image index from placeholder like {{images[0]}}
      const imageMatch = element.content.match(/{{images\[(\d+)\]}}/)
      if (imageMatch) {
        const imageIndex = parseInt(imageMatch[1])
        if (data.images[imageIndex]) {
          populatedContent = data.images[imageIndex] 
        }
      }
    } else {
      // Handle text placeholders
      Object.entries(replacements).forEach(([placeholder, value]) => {
        populatedContent = populatedContent.replace(new RegExp(placeholder, "g"), value)
      })
    }

    return {
      ...element,
      content: populatedContent,
    }
  })

  return {
    ...slide,
    elements: populatedElements,
  }
}