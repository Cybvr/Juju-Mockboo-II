
"use client"

import { Button } from "@/components/ui/button"
import { Edit3, Image, Video, Layers, Settings } from "lucide-react"

interface ScenesLeftToolbarProps {
  showEditingPanel: boolean
  onToggleEditingPanel: () => void
  showAIImagePanel: boolean
  onToggleAIImagePanel: () => void
}

export function ScenesLeftToolbar({ 
  showEditingPanel, 
  onToggleEditingPanel,
  showAIImagePanel,
  onToggleAIImagePanel
}: ScenesLeftToolbarProps) {
  return (
    <div className="w-12 border-r border-border bg-card/30 flex flex-col items-center py-3 gap-2">
      <Button
        variant={showEditingPanel ? "default" : "ghost"}
        size="sm"
        className="w-8 h-8 p-0"
        onClick={() => {
          onToggleEditingPanel()
          if (showAIImagePanel) onToggleAIImagePanel()
        }}
        title="Edit"
      >
        <Edit3 className="w-4 h-4" />
      </Button>
      
      <Button
        variant={showAIImagePanel ? "default" : "ghost"}
        size="sm"
        className="w-8 h-8 p-0"
        onClick={() => {
          onToggleAIImagePanel()
          if (showEditingPanel) onToggleEditingPanel()
        }}
        title="AI Image Generator"
      >
        <Image className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="w-8 h-8 p-0"
        title="Videos"
      >
        <Video className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="w-8 h-8 p-0"
        title="Layers"
      >
        <Layers className="w-4 h-4" />
      </Button>
      
      <div className="flex-1" />
      
      <Button
        variant="ghost"
        size="sm"
        className="w-8 h-8 p-0"
        title="Settings"
      >
        <Settings className="w-4 h-4" />
      </Button>
    </div>
  )
}
