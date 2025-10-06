
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
  selectedTextObject: any
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
  selectedTextObject, 
  fabricCanvas, 
  onNoteChange 
}: StickyNoteToolbarProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [currentColor, setCurrentColor] = useState("yellow")
  const [currentFontSize, setCurrentFontSize] = useState(16)
  const [currentAlignment, setCurrentAlignment] = useState("left")

  // Only show for sticky notes (text objects with backgroundColor)
  const isSticky = selectedTextObject?.backgroundColor && selectedTextObject?.stickyColor

  useEffect(() => {
    if (!isVisible || !selectedTextObject || !fabricCanvas || !isSticky) {
      return
    }

    // Position toolbar above the selected object
    const objBounds = selectedTextObject.getBoundingRect()
    const zoom = fabricCanvas.getZoom()
    const vpt = fabricCanvas.viewportTransform || [1, 0, 0, 1, 0, 0]
    const viewportX = (objBounds.left + objBounds.width / 2) * zoom + vpt[4]
    const viewportY = Math.max(40, (objBounds.top - 80) * zoom + vpt[5])
    setPosition({ x: viewportX, y: viewportY })

    // Get current properties
    setCurrentFontSize(selectedTextObject.fontSize || 16)
    setCurrentAlignment(selectedTextObject.textAlign || "left")
    setCurrentColor(selectedTextObject.stickyColor || "yellow")
  }, [isVisible, selectedTextObject, fabricCanvas, isSticky])

  const handleColorChange = (colorName: string) => {
    setCurrentColor(colorName)
    if (!selectedTextObject || !fabricCanvas) return

    const color = stickyColors.find(c => c.name === colorName)
    if (!color) return

    selectedTextObject.set({ 
      backgroundColor: color.bg,
      stickyColor: colorName
    })
    fabricCanvas.renderAll()
    onNoteChange()
  }

  const handleFontSizeChange = (size: number) => {
    setCurrentFontSize(size)
    if (!selectedTextObject || !fabricCanvas) return

    selectedTextObject.set({ fontSize: size })
    fabricCanvas.renderAll()
    onNoteChange()
  }

  const handleAlignmentChange = (alignment: string) => {
    setCurrentAlignment(alignment)
    if (!selectedTextObject || !fabricCanvas) return

    selectedTextObject.set({ textAlign: alignment })
    fabricCanvas.renderAll()
    onNoteChange()
  }

  const handleDelete = () => {
    if (!selectedTextObject || !fabricCanvas) return
    fabricCanvas.remove(selectedTextObject)
    fabricCanvas.renderAll()
    onNoteChange()
  }

  if (!isVisible || !isSticky) return null

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
        {/* Background Color Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <div className="flex flex-col items-center">
                <Palette className="h-3 w-3" />
                <div 
                  className="w-4 h-1 rounded-full mt-0.5" 
                  style={{ backgroundColor: stickyColors.find(c => c.name === currentColor)?.bg || "#FEF3C7" }} 
                />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-3 gap-1">
              {stickyColors.map((color) => (
                <Button
                  key={color.name}
                  variant={currentColor === color.name ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0 border-2"
                  style={{ 
                    backgroundColor: color.bg,
                    borderColor: currentColor === color.name ? "#2563eb" : "transparent"
                  }}
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
