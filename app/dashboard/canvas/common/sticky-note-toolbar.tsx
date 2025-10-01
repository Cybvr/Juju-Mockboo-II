
"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Type, 
  Palette, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Trash2,
  Plus,
  Minus
} from "lucide-react"
import { useState, useEffect } from "react"

interface StickyNoteToolbarProps {
  isVisible: boolean
  selectedStickyNote: any
  fabricCanvas: any
  onNoteChange: () => void
}

const stickyColors = [
  { name: "yellow", bg: "#FEF3C7", border: "#F59E0B" },
  { name: "pink", bg: "#FCE7F3", border: "#EC4899" },
  { name: "blue", bg: "#DBEAFE", border: "#3B82F6" },
  { name: "green", bg: "#D1FAE5", border: "#10B981" },
  { name: "orange", bg: "#FED7AA", border: "#F97316" },
  { name: "purple", bg: "#E9D5FF", border: "#8B5CF6" },
]

const fontSizes = [12, 14, 16, 18, 20, 24, 28]

export function StickyNoteToolbar({ 
  isVisible, 
  selectedStickyNote, 
  fabricCanvas, 
  onNoteChange 
}: StickyNoteToolbarProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [noteText, setNoteText] = useState("")
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

    // Get current sticky note properties
    if (selectedStickyNote.type === "group" && selectedStickyNote.stickyNoteGroup) {
      const textObj = selectedStickyNote.getObjects().find((obj: any) => obj.type === "textbox")
      if (textObj) {
        setNoteText(textObj.text || "")
        setCurrentFontSize(textObj.fontSize || 16)
        setCurrentAlignment(textObj.textAlign || "left")
      }
      setCurrentColor(selectedStickyNote.stickyColor || "yellow")
    }
  }, [isVisible, selectedStickyNote, fabricCanvas])

  const handleTextChange = (newText: string) => {
    setNoteText(newText)
    if (!selectedStickyNote || !fabricCanvas) return

    if (selectedStickyNote.type === "group" && selectedStickyNote.stickyNoteGroup) {
      const textObj = selectedStickyNote.getObjects().find((obj: any) => obj.type === "textbox")
      if (textObj) {
        textObj.set({ text: newText })
        fabricCanvas.renderAll()
        onNoteChange()
      }
    }
  }

  const handleColorChange = (colorName: string) => {
    setCurrentColor(colorName)
    if (!selectedStickyNote || !fabricCanvas) return

    const color = stickyColors.find(c => c.name === colorName)
    if (!color) return

    if (selectedStickyNote.type === "group" && selectedStickyNote.stickyNoteGroup) {
      const objects = selectedStickyNote.getObjects()
      // Update background
      if (objects[0]) {
        objects[0].set({ fill: color.bg, stroke: color.border })
      }
      // Update fold
      if (objects[1]) {
        objects[1].set({ fill: color.border })
      }
      selectedStickyNote.stickyColor = colorName
      fabricCanvas.renderAll()
      onNoteChange()
    }
  }

  const handleFontSizeChange = (size: number) => {
    setCurrentFontSize(size)
    if (!selectedStickyNote || !fabricCanvas) return

    if (selectedStickyNote.type === "group" && selectedStickyNote.stickyNoteGroup) {
      const textObj = selectedStickyNote.getObjects().find((obj: any) => obj.type === "textbox")
      if (textObj) {
        textObj.set({ fontSize: size })
        fabricCanvas.renderAll()
        onNoteChange()
      }
    }
  }

  const handleAlignmentChange = (alignment: string) => {
    setCurrentAlignment(alignment)
    if (!selectedStickyNote || !fabricCanvas) return

    if (selectedStickyNote.type === "group" && selectedStickyNote.stickyNoteGroup) {
      const textObj = selectedStickyNote.getObjects().find((obj: any) => obj.type === "textbox")
      if (textObj) {
        textObj.set({ textAlign: alignment })
        fabricCanvas.renderAll()
        onNoteChange()
      }
    }
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
        className="absolute z-50 flex gap-1 bg-card border rounded-lg p-2 shadow-lg min-w-80"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: "translateX(-50%)",
        }}
      >
        {/* Text Area */}
        <div className="flex-1 mr-2">
          <Textarea
            value={noteText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type your note..."
            className="min-h-16 text-sm resize-none"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-1">
          {/* First row - Color and Font Size */}
          <div className="flex gap-1">
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
                      style={{ backgroundColor: color.bg, border: `2px solid ${color.border}` }}
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
          </div>

          {/* Second row - Alignment */}
          <div className="flex gap-1">
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
          </div>

          {/* Third row - Delete */}
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
      </div>
    </TooltipProvider>
  )
}
