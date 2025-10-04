"use client"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Type, 
  Palette, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Trash2
} from "lucide-react"
import { useState, useEffect } from "react"

interface StickyNoteToolbarProps {
  isVisible: boolean
  selectedStickyNote: any
  fabricCanvas: any
  onNoteChange: () => void
}

const stickyColors = [
  { name: "yellow", bg: "#FEF3C7" },
  { name: "pink", bg: "#FCE7F3" },
  { name: "blue", bg: "#DBEAFE" },
  { name: "green", bg: "#D1FAE5" },
  { name: "orange", bg: "#FED7AA" },
  { name: "purple", bg: "#E9D5FF" },
]

const fontSizes = [12, 14, 16, 18, 20, 24, 28]

export function StickyNoteToolbar({ 
  isVisible, 
  selectedStickyNote, 
  fabricCanvas, 
  onNoteChange 
}: StickyNoteToolbarProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [currentColor, setCurrentColor] = useState("yellow")
  const [currentFontSize, setCurrentFontSize] = useState(16)
  const [currentAlignment, setCurrentAlignment] = useState("left")

  useEffect(() => {
    if (!isVisible || !selectedStickyNote || !fabricCanvas) {
      return
    }

    // Position toolbar above the selected sticky note
    const objBounds = selectedStickyNote.getBoundingRect()
    const zoom = fabricCanvas.getZoom()
    const vpt = fabricCanvas.viewportTransform || [1, 0, 0, 1, 0, 0]
    const viewportX = (objBounds.left + objBounds.width / 2) * zoom + vpt[4]
    const viewportY = Math.max(40, (objBounds.top - 80) * zoom + vpt[5])
    setPosition({ x: viewportX, y: viewportY })

    // Get current properties from the text object
    setCurrentFontSize(selectedStickyNote.fontSize || 16)
    setCurrentAlignment(selectedStickyNote.textAlign || "left")

    // Get color from name (format: "sticky-note-yellow")
    const colorFromName = selectedStickyNote.name?.split('-')[2] || "yellow"
    setCurrentColor(colorFromName)
  }, [isVisible, selectedStickyNote, fabricCanvas])

  const handleColorChange = (colorName: string) => {
    setCurrentColor(colorName)
    if (!selectedStickyNote || !fabricCanvas) return

    const color = stickyColors.find(c => c.name === colorName)
    if (!color) return

    selectedStickyNote.set({ 
      backgroundColor: color.bg,
      name: `sticky-note-${colorName}`
    })
    fabricCanvas.renderAll()
    onNoteChange()
  }

  const handleFontSizeChange = (size: number) => {
    setCurrentFontSize(size)
    if (!selectedStickyNote || !fabricCanvas) return

    selectedStickyNote.set({ fontSize: size })
    fabricCanvas.renderAll()
    onNoteChange()
  }

  const handleAlignmentChange = (alignment: string) => {
    setCurrentAlignment(alignment)
    if (!selectedStickyNote || !fabricCanvas) return

    selectedStickyNote.set({ textAlign: alignment })
    fabricCanvas.renderAll()
    onNoteChange()
  }

  const handleDelete = () => {
    if (!selectedStickyNote || !fabricCanvas) return
    fabricCanvas.remove(selectedStickyNote)
    fabricCanvas.renderAll()
    onNoteChange()
  }

  if (!isVisible) return null

  return (
    <TooltipProvider>
      <div
        className="absolute z-50 flex gap-1 bg-card border rounded-lg p-2 shadow-lg"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: "translateX(-50%)",
        }}
      >
        {/* Color Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-3 gap-1">
              {stickyColors.map((color) => (
                <Button
                  key={color.name}
                  variant={currentColor === color.name ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  style={{ backgroundColor: color.bg }}
                  onClick={() => handleColorChange(color.name)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Font Size */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Type className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="flex flex-col gap-1">
              {fontSizes.map((size) => (
                <Button
                  key={size}
                  variant={currentFontSize === size ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleFontSizeChange(size)}
                >
                  {size}px
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Alignment */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentAlignment === "left" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => handleAlignmentChange("left")}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Align Left</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentAlignment === "center" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => handleAlignmentChange("center")}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Align Center</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentAlignment === "right" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => handleAlignmentChange("right")}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Align Right</p></TooltipContent>
        </Tooltip>

        {/* Delete */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Delete Note</p></TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}