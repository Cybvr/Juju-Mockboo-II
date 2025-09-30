"use client"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { CanvasDocument } from "@/types/canvas"

interface CanvasSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  zoom: number;
}

interface BottomToolbarProps {
  canvas: CanvasDocument;
  settings: CanvasSettings;
  onSettingsChange: (key: keyof CanvasSettings, value: number) => void;
}

export function BottomToolbar({ canvas, settings, onSettingsChange }: BottomToolbarProps) {
  return (
    <div className="bg-card border-t border-border px-2 md:px-4 py-2 md:py-3 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-1 md:gap-2">
        {/* Shape tools moved to Tools tab in AdjustPanel */}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{settings.zoom}%</span>
          <div className="w-24">
            <Slider
              value={[settings.zoom]}
              onValueChange={(value) => onSettingsChange('zoom', value[0])}
              min={10}
              max={500}
              step={10}
              data-testid="slider-zoom"
            />
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {canvas.canvasData.width}×{canvas.canvasData.height} px
        </div>
      </div>
    </div>
  )
}
