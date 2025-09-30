"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Type, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface StickyNoteToolbarProps {
  selectedObject: any
  fabricCanvas: any
  onColorChange: (color: string) => void
  onFontSizeChange: (size: number) => void
  onDelete: () => void
}

const stickyColors = [
  { bg: "#ffeb3b", border: "#fbc02d", name: "yellow", label: "Yellow" },
  { bg: "#4caf50", border: "#388e3c", name: "green", label: "Green" },
  { bg: "#2196f3", border: "#1976d2", name: "blue", label: "Blue" },
  { bg: "#ff9800", border: "#f57c00", name: "orange", label: "Orange" },
  { bg: "#e91e63", border: "#c2185b", name: "pink", label: "Pink" },
  { bg: "#9c27b0", border: "#7b1fa2", name: "purple", label: "Purple" },
]

const fontSizes = [12, 14, 16, 18, 20, 24]

export function StickyNoteToolbar({
  selectedObject,
  fabricCanvas,
  onColorChange,
  onFontSizeChange,
  onDelete,
}: StickyNoteToolbarProps) {
  const [isColorOpen, setIsColorOpen] = useState(false)
  const [isFontOpen, setIsFontOpen] = useState(false)

  if (!selectedObject || !selectedObject.stickyNoteGroup) {
    return null
  }

  const currentColor = selectedObject.stickyColor || "yellow"
  const currentFontSize = selectedObject.getObjects?.()?.[2]?.fontSize || 14

  return (
    <div className="flex items-center gap-2 bg-card border rounded-lg p-2 shadow-lg">
      {/* Color Picker */}
      <Popover open={isColorOpen} onOpenChange={setIsColorOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <div
              className="w-4 h-4 rounded border"
              style={{
                backgroundColor: stickyColors.find((c) => c.name === currentColor)?.bg || "#ffeb3b",
              }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-3">
          <div className="grid grid-cols-3 gap-2">
            {stickyColors.map((color) => (
              <button
                key={color.name}
                onClick={() => {
                  onColorChange(color.name)
                  setIsColorOpen(false)
                }}
                className={cn(
                  "w-12 h-12 rounded-lg border-2 transition-all hover:scale-105",
                  currentColor === color.name ? "border-foreground" : "border-border",
                )}
                style={{ backgroundColor: color.bg }}
                title={color.label}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Font Size */}
      <Popover open={isFontOpen} onOpenChange={setIsFontOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Type className="w-3 h-3 mr-1" />
            {currentFontSize}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-32 p-2">
          <div className="space-y-1">
            {fontSizes.map((size) => (
              <button
                key={size}
                onClick={() => {
                  onFontSizeChange(size)
                  setIsFontOpen(false)
                }}
                className={cn(
                  "w-full text-left px-2 py-1 rounded hover:bg-accent",
                  currentFontSize === size && "bg-accent",
                )}
              >
                {size}px
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Delete */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  )
}
