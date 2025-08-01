import React from 'react'
import type { SlideElement } from '@/types'
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Palette } from "lucide-react"

interface TextFormatPanelProps {
  element: SlideElement
  onUpdate: (updates: Partial<SlideElement>) => void
}

// Reusable formatting button component
const FormatButton: React.FC<{
  icon: React.ReactNode
  isActive: boolean
  onClick: () => void
  title: string
}> = ({ icon, isActive, onClick, title }) => (
  <button
    onClick={onClick}
    className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${isActive ? "bg-gray-200" : ""}`}
    title={title}
  >
    {icon}
  </button>
)

// Style presets for quick formatting
const STYLE_PRESETS = [
  { name: "Heading", style: { fontSize: 24, fontWeight: "bold" as const } },
  { name: "Subheading", style: { fontSize: 18, fontWeight: "bold" as const } },
  { name: "Body", style: { fontSize: 14, fontWeight: "normal" as const } },
  { name: "Caption", style: { fontSize: 12, fontStyle: "italic" as const } },
]

const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72]
const colors = [
  "#000000",
  "#434343",
  "#666666",
  "#999999",
  "#b7b7b7",
  "#cccccc",
  "#d9d9d9",
  "#efefef",
  "#f3f3f3",
  "#ffffff",
  "#980000",
  "#ff0000",
  "#ff9900",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#4a86e8",
  "#0000ff",
  "#9900ff",
  "#ff00ff",
  "#e6b8af",
  "#f4cccc",
  "#fce5cd",
  "#fff2cc",
  "#d9ead3",
  "#d0e0e3",
  "#c9daf8",
  "#cfe2f3",
  "#d9d2e9",
  "#ead1dc",
]

export const TextFormatPanel: React.FC<TextFormatPanelProps> = ({ element, onUpdate }) => {
  const style = element.style || {}

  const handleStyleUpdate = (newStyle: Partial<typeof style>) => {
    onUpdate({
      style: { ...style, ...newStyle },
    })
  }

  const applyPreset = (preset: typeof STYLE_PRESETS[0]) => {
    handleStyleUpdate(preset.style)
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center space-x-4">
        {/* Style Presets */}
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500 mr-2">Presets:</span>
          {STYLE_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
              title={`Apply ${preset.name} style`}
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300" />

        {/* Font Size */}
        <div className="flex items-center space-x-1">
          <select
            value={style.fontSize || 18}
            onChange={(e) => handleStyleUpdate({ fontSize: Number(e.target.value) })}
            className="text-sm border border-gray-300 rounded px-2 py-1 w-16"
          >
            {fontSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300" />

        {/* Text Style */}
        <div className="flex items-center space-x-1">
          <FormatButton
            icon={<Bold className="w-4 h-4" />}
            isActive={style.fontWeight === "bold"}
            onClick={() => handleStyleUpdate({
              fontWeight: style.fontWeight === "bold" ? "normal" : "bold",
            })}
            title="Bold (Ctrl+B)"
          />
          <FormatButton
            icon={<Italic className="w-4 h-4" />}
            isActive={style.fontStyle === "italic"}
            onClick={() => handleStyleUpdate({
              fontStyle: style.fontStyle === "italic" ? "normal" : "italic",
            })}
            title="Italic (Ctrl+I)"
          />
          <FormatButton
            icon={<Underline className="w-4 h-4" />}
            isActive={style.textDecoration === "underline"}
            onClick={() => handleStyleUpdate({
              textDecoration: style.textDecoration === "underline" ? "none" : "underline",
            })}
            title="Underline (Ctrl+U)"
          />
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300" />

        {/* Text Alignment */}
        <div className="flex items-center space-x-1">
          <FormatButton
            icon={<AlignLeft className="w-4 h-4" />}
            isActive={style.textAlign === "left"}
            onClick={() => handleStyleUpdate({ textAlign: "left" })}
            title="Align left"
          />
          <FormatButton
            icon={<AlignCenter className="w-4 h-4" />}
            isActive={style.textAlign === "center"}
            onClick={() => handleStyleUpdate({ textAlign: "center" })}
            title="Align center"
          />
          <FormatButton
            icon={<AlignRight className="w-4 h-4" />}
            isActive={style.textAlign === "right"}
            onClick={() => handleStyleUpdate({ textAlign: "right" })}
            title="Align right"
          />
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300" />

        {/* Text Color */}
        <div className="flex items-center space-x-2">
          {/* Color Palette */}
          <div className="relative group">
            <button className="flex items-center space-x-1 p-1.5 rounded hover:bg-gray-100" title="Text color palette">
              <Palette className="w-4 h-4" />
              <div className="w-4 h-1 rounded" style={{ backgroundColor: style.color || "#000000" }} />
            </button>
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 hidden group-hover:block z-50">
              <div className="grid grid-cols-10 gap-1 w-48">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleStyleUpdate({ color })}
                    className="w-4 h-4 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Custom Color Picker */}
          <input
            type="color"
            value={style.color || "#000000"}
            onChange={(e) => handleStyleUpdate({ color: e.target.value })}
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
            title="Custom color picker"
          />
        </div>
      </div>
    </div>
  )
} 