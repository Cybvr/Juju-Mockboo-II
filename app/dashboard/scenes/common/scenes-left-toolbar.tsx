"use client"
import { Button } from "@/components/ui/button"
import { Edit3, Image, Video, Layers, Settings, Type, LucideIcon } from "lucide-react"

interface ScenesLeftToolbarProps {
  showEditingPanel: boolean
  onToggleEditingPanel: () => void
  showAIImagePanel: boolean
  onToggleAIImagePanel: () => void
  showTextPanel: boolean
  onToggleTextPanel: () => void
}

interface ToolbarButtonProps {
  icon: LucideIcon
  label: string
  isActive?: boolean
  onClick?: () => void
}

function ToolbarButton({ icon: Icon, label, isActive = false, onClick }: ToolbarButtonProps) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Button
        variant={isActive ? "default" : "ghost"}
        size="sm"
        className="w-8 h-8 p-0"
        onClick={onClick}
        title={label}
      >
        <Icon className="w-4 h-4" />
      </Button>
      <span className="text-center text-xs">{label}</span>
    </div>
  )
}

export function ScenesLeftToolbar({ 
  showEditingPanel, 
  onToggleEditingPanel,
  showAIImagePanel,
  onToggleAIImagePanel,
  showTextPanel,
  onToggleTextPanel
}: ScenesLeftToolbarProps) {
  const handleEditClick = () => {
    if (showAIImagePanel) onToggleAIImagePanel()
    if (showTextPanel) onToggleTextPanel()
    onToggleEditingPanel()
  }

  const handleAstraClick = () => {
    if (showEditingPanel) onToggleEditingPanel()
    if (showTextPanel) onToggleTextPanel()
    onToggleAIImagePanel()
  }

  const handleTextClick = () => {
    if (showEditingPanel) onToggleEditingPanel()
    if (showAIImagePanel) onToggleAIImagePanel()
    onToggleTextPanel()
  }

  return (
    <div className="w-12 border-r border-border bg-card/30 flex flex-col items-center py-3 gap-2">
      <ToolbarButton 
        icon={Edit3} 
        label="Edit" 
        isActive={showEditingPanel}
        onClick={handleEditClick}
      />
      <ToolbarButton 
        icon={Image} 
        label="Astra" 
        isActive={showAIImagePanel}
        onClick={handleAstraClick}
      />
      <ToolbarButton 
        icon={Type} 
        label="Text" 
        isActive={showTextPanel}
        onClick={handleTextClick}
      />
      <ToolbarButton 
        icon={Video} 
        label="Videos" 
      />
      <ToolbarButton 
        icon={Layers} 
        label="Layers" 
      />
      <div className="flex-1" />
      <ToolbarButton 
        icon={Settings} 
        label="Settings" 
      />
    </div>
  )
}