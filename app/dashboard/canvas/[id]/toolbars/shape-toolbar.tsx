
"use client"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"
import { 
  Palette, 
  Square, 
  Circle,
  Trash2,
  Copy,
  RotateCw,
  FlipHorizontal,
  FlipVertical
} from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ShapeToolbarProps {
  isVisible: boolean
  selectedShapeObject: any
  fabricCanvas: any
  onShapeChange: () => void
}

const shapeColors = [
  "#3b82f6", // Blue (default)
  "#ef4444", // Red
  "#10b981", // Green
  "#f59e0b", // Yellow
  "#8b5cf6", // Purple
  "#f97316", // Orange
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#6b7280", // Gray
  "#000000", // Black
  "#ffffff", // White
]

export function ShapeToolbar({
  isVisible,
  selectedShapeObject,
  fabricCanvas,
  onShapeChange
}: ShapeToolbarProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!fabricCanvas || !selectedShapeObject || !isVisible) return

    const objBounds = selectedShapeObject.getBoundingRect()
    const zoom = fabricCanvas.getZoom()
    const vpt = fabricCanvas.viewportTransform || [1, 0, 0, 1, 0, 0]
    
    const centerX = objBounds.left + objBounds.width / 2
    const viewportX = centerX * zoom + vpt[4]
    const viewportY = Math.max(40, (objBounds.top - 60) * zoom + vpt[5])
    
    setPosition({ x: viewportX, y: viewportY })
  }, [selectedShapeObject, fabricCanvas, isVisible])

  if (!isVisible || !selectedShapeObject) return null

  const isShape = selectedShapeObject.type === 'rect' || selectedShapeObject.type === 'circle'
  if (!isShape) return null

  const updateShapeProperty = (property: string, value: any) => {
    if (!selectedShapeObject || !fabricCanvas) return
    
    selectedShapeObject.set(property, value)
    fabricCanvas.renderAll()
    onShapeChange()
  }

  const handleFillColor = (color: string) => {
    updateShapeProperty('fill', color)
  }

  const handleStrokeColor = (color: string) => {
    updateShapeProperty('stroke', color)
  }

  const handleStrokeWidth = (width: number) => {
    updateShapeProperty('strokeWidth', width)
  }

  const handleOpacity = (opacity: number) => {
    updateShapeProperty('opacity', opacity / 100)
  }

  const handleDuplicate = () => {
    if (!selectedShapeObject || !fabricCanvas) return
    
    selectedShapeObject.clone((cloned: any) => {
      cloned.set({
        left: cloned.left + 20,
        top: cloned.top + 20,
      })
      fabricCanvas.add(cloned)
      fabricCanvas.setActiveObject(cloned)
      fabricCanvas.renderAll()
      onShapeChange()
    })
  }

  const handleDelete = () => {
    if (!selectedShapeObject || !fabricCanvas) return
    fabricCanvas.remove(selectedShapeObject)
    fabricCanvas.renderAll()
    onShapeChange()
  }

  const handleFlipHorizontal = () => {
    if (!selectedShapeObject || !fabricCanvas) return
    selectedShapeObject.set('flipX', !selectedShapeObject.flipX)
    fabricCanvas.renderAll()
    onShapeChange()
  }

  const handleFlipVertical = () => {
    if (!selectedShapeObject || !fabricCanvas) return
    selectedShapeObject.set('flipY', !selectedShapeObject.flipY)
    fabricCanvas.renderAll()
    onShapeChange()
  }

  const handleRotate = () => {
    if (!selectedShapeObject || !fabricCanvas) return
    const currentAngle = selectedShapeObject.angle || 0
    selectedShapeObject.set('angle', currentAngle + 90)
    fabricCanvas.renderAll()
    onShapeChange()
  }

  return (
    <TooltipProvider>
      <div 
        className="absolute z-50"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: "translateX(-50%)",
        }}
      >
        <div className="flex flex-row gap-1 rounded-lg bg-card p-2 shadow-lg border">
          {/* Fill Color */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Fill Color">
                <div className="flex flex-col items-center">
                  <Square className="h-3 w-3" fill={selectedShapeObject?.fill || '#3b82f6'} />
                  <div className="text-xs mt-0.5">Fill</div>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3" side="right">
              <div className="grid grid-cols-4 gap-2">
                {shapeColors.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
                      selectedShapeObject?.fill === color ? "border-primary" : "border-border"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => handleFillColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Stroke Color */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Stroke Color">
                <div className="flex flex-col items-center">
                  <Circle className="h-3 w-3" stroke={selectedShapeObject?.stroke || '#3b82f6'} fill="none" />
                  <div className="text-xs mt-0.5">Line</div>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3" side="right">
              <div className="grid grid-cols-4 gap-2">
                {shapeColors.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
                      selectedShapeObject?.stroke === color ? "border-primary" : "border-border"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => handleStrokeColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Stroke Width */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Line Width">
                <div className="flex flex-col items-center">
                  <div 
                    className="bg-foreground rounded-full"
                    style={{
                      width: '12px',
                      height: `${Math.max(1, Math.min(4, (selectedShapeObject?.strokeWidth || 2) / 2))}px`
                    }}
                  />
                  <div className="text-xs mt-0.5">{selectedShapeObject?.strokeWidth || 2}px</div>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3" side="right">
              <div className="space-y-3">
                <div className="text-sm font-medium">Line Width: {selectedShapeObject?.strokeWidth || 2}px</div>
                <Slider
                  value={[selectedShapeObject?.strokeWidth || 2]}
                  onValueChange={(value) => handleStrokeWidth(value[0])}
                  max={20}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            </PopoverContent>
          </Popover>

          {/* Opacity */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Opacity">
                <div className="flex flex-col items-center">
                  <div className="text-xs">○</div>
                  <div className="text-xs mt-0.5">{Math.round((selectedShapeObject?.opacity || 1) * 100)}%</div>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3" side="right">
              <div className="space-y-3">
                <div className="text-sm font-medium">Opacity: {Math.round((selectedShapeObject?.opacity || 1) * 100)}%</div>
                <Slider
                  value={[Math.round((selectedShapeObject?.opacity || 1) * 100)]}
                  onValueChange={(value) => handleOpacity(value[0])}
                  max={100}
                  min={10}
                  step={5}
                  className="w-full"
                />
              </div>
            </PopoverContent>
          </Popover>

          {/* Transform Actions */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleFlipHorizontal}
              >
                <FlipHorizontal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Flip Horizontal</p></TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleFlipVertical}
              >
                <FlipVertical className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Flip Vertical</p></TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleRotate}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Rotate 90°</p></TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleDuplicate}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Duplicate</p></TooltipContent>
          </Tooltip>

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
            <TooltipContent><p>Delete</p></TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
