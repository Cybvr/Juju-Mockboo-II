"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RotateCw, FlipHorizontal, FlipVertical, Trash2 } from "lucide-react"

interface PropertiesPanelProps {
  selectedObject: any
  onUpdateProperty: (property: string, value: any) => void
}

export function PropertiesPanel({ selectedObject, onUpdateProperty }: PropertiesPanelProps) {
  const [colorValue, setColorValue] = useState(selectedObject?.fill || "#164e63")

  const handlePropertyChange = (property: string, value: any) => {
    onUpdateProperty(property, value)
    if (property === "fill") {
      setColorValue(value)
    }
  }

  return (
    <div className="w-full bg-card border-b border-border p-3">
      {selectedObject ? (
        <div className="flex items-center gap-6 text-xs">
          {/* Object Type */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-muted-foreground font-medium">Type:</span>
            <span className="text-foreground">{selectedObject.type || "Unknown"}</span>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Position Controls */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Position:</span>
            <div className="flex items-center gap-1">
              <Label htmlFor="pos-x" className="text-muted-foreground">
                X
              </Label>
              <Input
                id="pos-x"
                type="number"
                value={Math.round(selectedObject.left || 0)}
                onChange={(e) => handlePropertyChange("left", Number.parseInt(e.target.value))}
                className="w-16 h-7"
              />
            </div>
            <div className="flex items-center gap-1">
              <Label htmlFor="pos-y" className="text-muted-foreground">
                Y
              </Label>
              <Input
                id="pos-y"
                type="number"
                value={Math.round(selectedObject.top || 0)}
                onChange={(e) => handlePropertyChange("top", Number.parseInt(e.target.value))}
                className="w-16 h-7"
              />
            </div>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Size Controls */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Size:</span>
            <div className="flex items-center gap-1">
              <Label htmlFor="size-w" className="text-muted-foreground">
                W
              </Label>
              <Input
                id="size-w"
                type="number"
                value={Math.round(selectedObject.width || selectedObject.radius * 2 || 0)}
                onChange={(e) => {
                  const value = Number.parseInt(e.target.value)
                  if (selectedObject.radius !== undefined) {
                    handlePropertyChange("radius", value / 2)
                  } else {
                    handlePropertyChange("width", value)
                  }
                }}
                className="w-16 h-7"
              />
            </div>
            <div className="flex items-center gap-1">
              <Label htmlFor="size-h" className="text-muted-foreground">
                H
              </Label>
              <Input
                id="size-h"
                type="number"
                value={Math.round(selectedObject.height || selectedObject.radius * 2 || 0)}
                onChange={(e) => {
                  const value = Number.parseInt(e.target.value)
                  if (selectedObject.radius !== undefined) {
                    handlePropertyChange("radius", value / 2)
                  } else {
                    handlePropertyChange("height", value)
                  }
                }}
                className="w-16 h-7"
              />
            </div>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Color Control */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Color:</span>
            <div
              className="w-6 h-6 rounded border cursor-pointer"
              style={{ backgroundColor: colorValue }}
              onClick={() => {
                const input = document.createElement("input")
                input.type = "color"
                input.value = colorValue
                input.onchange = (e) => {
                  const newColor = (e.target as HTMLInputElement).value
                  setColorValue(newColor)
                  handlePropertyChange("fill", newColor)
                }
                input.click()
              }}
            />
            <Input
              type="text"
              value={colorValue}
              onChange={(e) => {
                setColorValue(e.target.value)
                handlePropertyChange("fill", e.target.value)
              }}
              className="w-20 h-7"
            />
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Transform Controls */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Transform:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePropertyChange("angle", (selectedObject.angle || 0) + 90)}
              className="h-7 w-8 p-0"
            >
              <RotateCw className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePropertyChange("flipX", !(selectedObject.flipX || false))}
              className="h-7 w-8 p-0"
            >
              <FlipHorizontal className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePropertyChange("flipY", !(selectedObject.flipY || false))}
              className="h-7 w-8 p-0"
            >
              <FlipVertical className="w-3 h-3" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Delete Control */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => window.dispatchEvent(new CustomEvent("deleteSelected"))}
            className="h-7 flex items-center gap-1 px-3"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete</span>
          </Button>
        </div>
      ) : (
        <div className="text-xs text-muted-foreground py-2">Select an object to see its properties</div>
      )}
    </div>
  )
}
