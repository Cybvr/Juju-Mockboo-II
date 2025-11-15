"use client"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"
import { Square, Circle, FlipHorizontal, FlipVertical, Minus } from "lucide-react"
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

export function ShapeToolbar({ isVisible, selectedShapeObject, fabricCanvas, onShapeChange }: ShapeToolbarProps) {
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

  const isShape = selectedShapeObject.type === "rect" || selectedShapeObject.type === "circle"
  if (!isShape) return null

  const updateShapeProperty = (property: string, value: any) => {
    if (!selectedShapeObject || !fabricCanvas) return

    selectedShapeObject.set(property, value)
    fabricCanvas.renderAll()
    onShapeChange()
  }

  const handleFillColor = (color: string) => {
    updateShapeProperty("fill", color)
  }

  const handleStrokeColor = (color: string) => {
    updateShapeProperty("stroke", color)
  }

  const handleStrokeWidth = (width: number) => {
    updateShapeProperty("strokeWidth", width)
  }

  const handleOpacity = (opacity: number) => {
    updateShapeProperty("opacity", opacity / 100)
  }

  const handleFlipHorizontal = () => {
    if (!selectedShapeObject || !fabricCanvas) return
    const currentFlipX = selectedShapeObject.flipX || false
    selectedShapeObject.set("flipX", !currentFlipX)
    fabricCanvas.renderAll()
    onShapeChange()
  }

  const handleFlipVertical = () => {
    if (!selectedShapeObject || !fabricCanvas) return
    const currentFlipY = selectedShapeObject.flipY || false
    selectedShapeObject.set("flipY", !currentFlipY)
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
        <div className="flex flex-row items-center gap-2 rounded-lg bg-card px-3 py-2 shadow-lg border">
          {/* Fill Color */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Square className="h-5 w-5" fill={selectedShapeObject?.fill || "#3b82f6"} stroke="none" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-3" side="bottom" align="center">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Fill Color</div>
                    <div className="grid grid-cols-4 gap-2">
                      {shapeColors.map((color) => (
                        <button
                          key={color}
                          className={cn(
                            "w-10 h-10 rounded-md border-2 transition-all hover:scale-110",
                            selectedShapeObject?.fill === color
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-border",
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => handleFillColor(color)}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </TooltipTrigger>
            <TooltipContent>
              <p>Fill Color</p>
            </TooltipContent>
          </Tooltip>

          {/* Stroke Color */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Circle
                      className="h-5 w-5"
                      stroke={selectedShapeObject?.stroke || "#3b82f6"}
                      fill="none"
                      strokeWidth={2}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-3" side="bottom" align="center">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Stroke Color</div>
                    <div className="grid grid-cols-4 gap-2">
                      {shapeColors.map((color) => (
                        <button
                          key={color}
                          className={cn(
                            "w-10 h-10 rounded-md border-2 transition-all hover:scale-110",
                            selectedShapeObject?.stroke === color
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-border",
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => handleStrokeColor(color)}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </TooltipTrigger>
            <TooltipContent>
              <p>Stroke Color</p>
            </TooltipContent>
          </Tooltip>

          {/* Stroke Width */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Minus
                      className="h-5 w-5"
                      strokeWidth={Math.max(1, Math.min(4, (selectedShapeObject?.strokeWidth || 2) / 2))}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4" side="bottom" align="center">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Stroke Width</span>
                      <span className="text-sm text-muted-foreground">{selectedShapeObject?.strokeWidth || 2}px</span>
                    </div>
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
            </TooltipTrigger>
            <TooltipContent>
              <p>Stroke Width: {selectedShapeObject?.strokeWidth || 2}px</p>
            </TooltipContent>
          </Tooltip>

          {/* Opacity */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <div
                      className="h-5 w-5 rounded-full bg-foreground"
                      style={{ opacity: selectedShapeObject?.opacity || 1 }}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4" side="bottom" align="center">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Opacity</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((selectedShapeObject?.opacity || 1) * 100)}%
                      </span>
                    </div>
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
            </TooltipTrigger>
            <TooltipContent>
              <p>Opacity: {Math.round((selectedShapeObject?.opacity || 1) * 100)}%</p>
            </TooltipContent>
          </Tooltip>

          <div className="h-6 w-px bg-border mx-1" />

          {/* Transform Actions */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleFlipHorizontal}>
                <FlipHorizontal className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Flip Horizontal</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleFlipVertical}>
                <FlipVertical className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Flip Vertical</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
