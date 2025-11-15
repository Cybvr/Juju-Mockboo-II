"use client"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Palette, Brush, Eraser } from "lucide-react"
import { cn } from "@/lib/utils"

interface DrawingToolbarProps {
  isVisible: boolean
  onBrushSizeChange: (size: number) => void
  onColorChange: (color: string) => void
  onModeChange: (mode: "draw" | "erase") => void
  brushSize: number
  currentColor: string
  currentMode: "draw" | "erase"
}

const drawingColors = [
  "#000000", // Black
  "#ffffff", // White
  "#ff0000", // Red
  "#00ff00", // Green
  "#0000ff", // Blue
  "#ffff00", // Yellow
  "#ff00ff", // Magenta
  "#00ffff", // Cyan
  "#ff8000", // Orange
  "#8000ff", // Purple
  "#808080", // Gray
  "#800000", // Maroon
]

export function DrawingToolbar({
  isVisible,
  onBrushSizeChange,
  onColorChange,
  onModeChange,
  brushSize,
  currentColor,
  currentMode,
}: DrawingToolbarProps) {
  if (!isVisible) return null

  return (
    <div className="absolute left-20 top-1/2 z-10 -translate-y-1/2">
      <div className="flex flex-col gap-2 rounded-lg bg-card p-2 shadow-lg border">
        {/* Drawing Mode Toggle */}
        <div className="flex flex-col gap-1">
          <Button
            variant={currentMode === "draw" ? "default" : "ghost"}
            size="icon"
            onClick={() => onModeChange("draw")}
            className="h-8 w-8"
            title="Draw"
          >
            <Brush className="h-4 w-4" />
          </Button>
          <Button
            variant={currentMode === "erase" ? "default" : "ghost"}
            size="icon"
            onClick={() => onModeChange("erase")}
            className="h-8 w-8"
            title="Erase"
          >
            <Eraser className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-px bg-border my-1"></div>

        {/* Color Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Color">
              <div className="flex items-center gap-1">
                <Palette className="h-3 w-3" />
                <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: currentColor }} />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-3" side="right">
            <div className="grid grid-cols-4 gap-2">
              {drawingColors.map((color) => (
                <button
                  key={color}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
                    currentColor === color ? "border-primary" : "border-border",
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => onColorChange(color)}
                  title={color}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Brush Size */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Brush Size">
              <div className="flex flex-col items-center">
                <Brush className="h-3 w-3" />
                <div
                  className="rounded-full bg-foreground mt-0.5"
                  style={{
                    width: `${Math.max(2, Math.min(8, brushSize / 2))}px`,
                    height: `${Math.max(2, Math.min(8, brushSize / 2))}px`,
                  }}
                />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-3" side="right">
            <div className="space-y-3">
              <div className="text-sm font-medium">Brush Size: {brushSize}px</div>
              <Slider
                value={[brushSize]}
                onValueChange={(value) => onBrushSizeChange(value[0])}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-center">
                <div
                  className="rounded-full bg-foreground"
                  style={{
                    width: `${Math.min(30, brushSize)}px`,
                    height: `${Math.min(30, brushSize)}px`,
                  }}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
