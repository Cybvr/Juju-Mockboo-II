
"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Type, 
  Palette, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Trash2,
  Bold,
  Italic,
  Underline
} from "lucide-react"
import { useState, useEffect } from "react"

interface TextToolbarProps {
  isVisible: boolean
  selectedTextObject: any
  fabricCanvas: any
  onTextChange: () => void
}

const textColors = [
  { name: "black", color: "#000000" },
  { name: "white", color: "#ffffff" },
  { name: "red", color: "#ef4444" },
  { name: "blue", color: "#3b82f6" },
  { name: "green", color: "#10b981" },
  { name: "yellow", color: "#f59e0b" },
  { name: "purple", color: "#8b5cf6" },
  { name: "pink", color: "#ec4899" },
]

const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48]

const fontFamilies = [
  "Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana", "Comic Sans MS", "Impact", "Courier New"
]

export function TextToolbar({ 
  isVisible, 
  selectedTextObject, 
  fabricCanvas, 
  onTextChange 
}: TextToolbarProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [currentColor, setCurrentColor] = useState("#000000")
  const [currentFontSize, setCurrentFontSize] = useState(20)
  const [currentFontFamily, setCurrentFontFamily] = useState("Arial")
  const [currentAlignment, setCurrentAlignment] = useState("left")
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)

  useEffect(() => {
    if (!isVisible || !selectedTextObject || !fabricCanvas) {
      return
    }

    // Position toolbar above the selected text
    const objBounds = selectedTextObject.getBoundingRect()
    const zoom = fabricCanvas.getZoom()
    const vpt = fabricCanvas.viewportTransform || [1, 0, 0, 1, 0, 0]

    const viewportX = (objBounds.left + objBounds.width / 2) * zoom + vpt[4]
    const viewportY = Math.max(40, (objBounds.top - 80) * zoom + vpt[5])

    setPosition({ x: viewportX, y: viewportY })

    // Get current text properties
    setCurrentColor(selectedTextObject.fill || "#000000")
    setCurrentFontSize(selectedTextObject.fontSize || 20)
    setCurrentFontFamily(selectedTextObject.fontFamily || "Arial")
    setCurrentAlignment(selectedTextObject.textAlign || "left")
    setIsBold(selectedTextObject.fontWeight === "bold")
    setIsItalic(selectedTextObject.fontStyle === "italic")
    setIsUnderline(selectedTextObject.underline || false)
  }, [isVisible, selectedTextObject, fabricCanvas])

  const handleColorChange = (colorValue: string) => {
    setCurrentColor(colorValue)
    if (!selectedTextObject || !fabricCanvas) return

    selectedTextObject.set({ fill: colorValue })
    fabricCanvas.renderAll()
    onTextChange()
  }

  const handleFontSizeChange = (size: number) => {
    setCurrentFontSize(size)
    if (!selectedTextObject || !fabricCanvas) return

    selectedTextObject.set({ fontSize: size })
    fabricCanvas.renderAll()
    onTextChange()
  }

  const handleFontFamilyChange = (fontFamily: string) => {
    setCurrentFontFamily(fontFamily)
    if (!selectedTextObject || !fabricCanvas) return

    selectedTextObject.set({ fontFamily: fontFamily })
    fabricCanvas.renderAll()
    onTextChange()
  }

  const handleAlignmentChange = (alignment: string) => {
    setCurrentAlignment(alignment)
    if (!selectedTextObject || !fabricCanvas) return

    selectedTextObject.set({ textAlign: alignment })
    fabricCanvas.renderAll()
    onTextChange()
  }

  const handleBoldToggle = () => {
    const newBold = !isBold
    setIsBold(newBold)
    if (!selectedTextObject || !fabricCanvas) return

    selectedTextObject.set({ fontWeight: newBold ? "bold" : "normal" })
    fabricCanvas.renderAll()
    onTextChange()
  }

  const handleItalicToggle = () => {
    const newItalic = !isItalic
    setIsItalic(newItalic)
    if (!selectedTextObject || !fabricCanvas) return

    selectedTextObject.set({ fontStyle: newItalic ? "italic" : "normal" })
    fabricCanvas.renderAll()
    onTextChange()
  }

  const handleUnderlineToggle = () => {
    const newUnderline = !isUnderline
    setIsUnderline(newUnderline)
    if (!selectedTextObject || !fabricCanvas) return

    selectedTextObject.set({ underline: newUnderline })
    fabricCanvas.renderAll()
    onTextChange()
  }

  const handleDelete = () => {
    if (!selectedTextObject || !fabricCanvas) return
    fabricCanvas.remove(selectedTextObject)
    fabricCanvas.renderAll()
    onTextChange()
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
            <div className="grid grid-cols-4 gap-1">
              {textColors.map((color) => (
                <Button
                  key={color.name}
                  variant={currentColor === color.color ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  style={{ backgroundColor: color.color, border: `2px solid ${color.color}` }}
                  onClick={() => handleColorChange(color.color)}
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
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
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

        {/* Font Family */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="text-xs font-bold">Aa</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
              {fontFamilies.map((font) => (
                <Button
                  key={font}
                  variant={currentFontFamily === font ? "default" : "ghost"}
                  size="sm"
                  className="justify-start text-left"
                  style={{ fontFamily: font }}
                  onClick={() => handleFontFamilyChange(font)}
                >
                  {font}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Bold */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isBold ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={handleBoldToggle}
            >
              <Bold className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Bold</p></TooltipContent>
        </Tooltip>

        {/* Italic */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isItalic ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={handleItalicToggle}
            >
              <Italic className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Italic</p></TooltipContent>
        </Tooltip>

        {/* Underline */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isUnderline ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={handleUnderlineToggle}
            >
              <Underline className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Underline</p></TooltipContent>
        </Tooltip>

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
          <TooltipContent><p>Delete Text</p></TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
