
"use client"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Type, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface TextToolbarProps {
  isVisible: boolean
  selectedTextObject: any
  fabricCanvas: any
  onTextChange: () => void
}

const fontFamilies = [
  "Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana", "Comic Sans MS"
]

const textColors = [
  "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", 
  "#ffff00", "#ff00ff", "#00ffff", "#ff8000", "#8000ff"
]

export function TextToolbar({
  isVisible,
  selectedTextObject,
  fabricCanvas,
  onTextChange
}: TextToolbarProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!fabricCanvas || !selectedTextObject || !isVisible) return

    const objBounds = selectedTextObject.getBoundingRect()
    const zoom = fabricCanvas.getZoom()
    const vpt = fabricCanvas.viewportTransform || [1, 0, 0, 1, 0, 0]
    
    const centerX = objBounds.left + objBounds.width / 2
    const viewportX = centerX * zoom + vpt[4]
    const viewportY = Math.max(40, (objBounds.top - 60) * zoom + vpt[5])
    
    setPosition({ x: viewportX, y: viewportY })
  }, [selectedTextObject, fabricCanvas, isVisible])

  if (!isVisible || !selectedTextObject) return null

  const updateTextProperty = (property: string, value: any) => {
    if (!selectedTextObject || !fabricCanvas) return
    
    selectedTextObject.set(property, value)
    fabricCanvas.renderAll()
    onTextChange()
  }

  const toggleBold = () => {
    const currentWeight = selectedTextObject.fontWeight
    updateTextProperty('fontWeight', currentWeight === 'bold' ? 'normal' : 'bold')
  }

  const toggleItalic = () => {
    const currentStyle = selectedTextObject.fontStyle
    updateTextProperty('fontStyle', currentStyle === 'italic' ? 'normal' : 'italic')
  }

  const toggleUnderline = () => {
    const current = selectedTextObject.underline
    updateTextProperty('underline', !current)
  }

  const setAlignment = (align: string) => {
    updateTextProperty('textAlign', align)
  }

  return (
    <div 
      className="absolute z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translateX(-50%)",
      }}
    >
      <div className="flex flex-row gap-2 rounded-lg bg-card p-2 shadow-lg border">
        {/* Font Size */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Font Size">
              <Type className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-3" side="right">
            <div className="space-y-3">
              <div className="text-sm font-medium">Font Size: {selectedTextObject?.fontSize || 20}px</div>
              <Slider
                value={[selectedTextObject?.fontSize || 20]}
                onValueChange={(value) => updateTextProperty('fontSize', value[0])}
                max={72}
                min={8}
                step={1}
                className="w-full"
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* Font Family */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Font Family">
              <div className="text-xs">Aa</div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-3" side="right">
            <div className="space-y-2">
              {fontFamilies.map((font) => (
                <button
                  key={font}
                  className={cn(
                    "w-full text-left p-2 rounded hover:bg-muted",
                    selectedTextObject?.fontFamily === font && "bg-muted"
                  )}
                  style={{ fontFamily: font }}
                  onClick={() => updateTextProperty('fontFamily', font)}
                >
                  {font}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Text Formatting */}
        <Button
          variant={selectedTextObject?.fontWeight === 'bold' ? "default" : "ghost"}
          size="icon"
          onClick={toggleBold}
          className="h-8 w-8"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          variant={selectedTextObject?.fontStyle === 'italic' ? "default" : "ghost"}
          size="icon"
          onClick={toggleItalic}
          className="h-8 w-8"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          variant={selectedTextObject?.underline ? "default" : "ghost"}
          size="icon"
          onClick={toggleUnderline}
          className="h-8 w-8"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>

        {/* Text Alignment */}
        <Button
          variant={selectedTextObject?.textAlign === 'left' ? "default" : "ghost"}
          size="icon"
          onClick={() => setAlignment('left')}
          className="h-8 w-8"
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>

        <Button
          variant={selectedTextObject?.textAlign === 'center' ? "default" : "ghost"}
          size="icon"
          onClick={() => setAlignment('center')}
          className="h-8 w-8"
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>

        <Button
          variant={selectedTextObject?.textAlign === 'right' ? "default" : "ghost"}
          size="icon"
          onClick={() => setAlignment('right')}
          className="h-8 w-8"
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        {/* Text Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Text Color">
              <div className="flex flex-col items-center">
                <Type className="h-3 w-3" />
                <div 
                  className="w-4 h-1 rounded-full mt-0.5" 
                  style={{ backgroundColor: selectedTextObject?.fill || '#000000' }} 
                />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-3" side="right">
            <div className="grid grid-cols-5 gap-2">
              {textColors.map((color) => (
                <button
                  key={color}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all hover:scale-110",
                    selectedTextObject?.fill === color ? "border-primary" : "border-border"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => updateTextProperty('fill', color)}
                  title={color}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
