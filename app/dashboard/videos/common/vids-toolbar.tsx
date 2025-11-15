// @/app/dashboard/scenes/common/scenes-right-toolbar.tsx

"use client"

import { Settings, Layers, Palette, Music } from "lucide-react"
import { Scene } from "./scenes-video-editor"

interface VidsToolbarProps {
  selectedScene: Scene | undefined
  onUpdateScene?: (sceneId: string, updates: Partial<Scene>) => void
}

export function VidsToolbar({ selectedScene, onUpdateScene }: VidsToolbarProps) {
  return (
    <div className="w-100 border-l border-border bg-card/30 flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm">Properties</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {selectedScene ? (
          <>
            {/* Scene Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Layers className="w-4 h-4" />
                <span>Scene Details</span>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  <div>Name: {selectedScene.name}</div>
                  <div>Type: {selectedScene.type}</div>
                  <div>Duration: {selectedScene.duration}s</div>
                </div>
              </div>
            </div>

            {/* Duration Control */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Settings className="w-4 h-4" />
                <span>Duration</span>
              </div>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={selectedScene.duration}
                  onChange={(e) => 
                    onUpdateScene?.(selectedScene.id, { duration: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground text-center">
                  {selectedScene.duration}s
                </div>
              </div>
            </div>

            {/* Transition */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Palette className="w-4 h-4" />
                <span>Transition</span>
              </div>
              <select
                value={selectedScene.transition || "none"}
                onChange={(e) =>
                  onUpdateScene?.(selectedScene.id, { transition: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md"
              >
                <option value="none">None</option>
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
                <option value="wipe">Wipe</option>
              </select>
            </div>

            {/* Audio (Placeholder) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Music className="w-4 h-4" />
                <span>Audio</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Audio controls coming soon
              </div>
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-8">
            Select a scene to view properties
          </div>
        )}
      </div>
    </div>
  )
}