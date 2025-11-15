"use client"
import { Button } from "@/components/ui/button"
import { FolderOpen, Image, Video, Layers, Settings, Type, Volume2, LucideIcon } from "lucide-react"

interface ScenesLeftToolbarProps {
  showEditingPanel: boolean
  onToggleEditingPanel: () => void
  showAIImagePanel: boolean
  onToggleAIImagePanel: () => void
  showTextPanel: boolean
  onToggleTextPanel: () => void
  showAudioPanel: boolean
  onToggleAudioPanel: () => void
  // Added: prop for the new Videos panel
  showVideosPanel: boolean
  onToggleVideosPanel: () => void
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
  onToggleTextPanel,
  showAudioPanel,
  onToggleAudioPanel,
  // Added: prop for the new Videos panel
  showVideosPanel,
  onToggleVideosPanel
}: ScenesLeftToolbarProps) {
  const handleEditClick = () => {
    if (showAIImagePanel) onToggleAIImagePanel()
    if (showTextPanel) onToggleTextPanel()
    // Added: close Videos panel if open
    if (showVideosPanel) onToggleVideosPanel()
    onToggleEditingPanel()
  }

  const handleAstraClick = () => {
    if (showEditingPanel) onToggleEditingPanel()
    if (showTextPanel) onToggleTextPanel()
    // Added: close Videos panel if open
    if (showVideosPanel) onToggleVideosPanel()
    onToggleAIImagePanel()
  }

  // Added: handler for the new Videos button
  const handleVideosClick = () => {
    if (showEditingPanel) onToggleEditingPanel()
    if (showAIImagePanel) onToggleAIImagePanel()
    if (showTextPanel) onToggleTextPanel()
    if (showAudioPanel) onToggleAudioPanel() // Added: close Audio panel if open
    onToggleVideosPanel()
  }

  const handleTextClick = () => {
    if (showEditingPanel) onToggleEditingPanel()
    if (showAIImagePanel) onToggleAIImagePanel()
    if (showAudioPanel) onToggleAudioPanel()
    // Added: close Videos panel if open
    if (showVideosPanel) onToggleVideosPanel()
    onToggleTextPanel()
  }

  const handleAudioClick = () => {
    if (showEditingPanel) onToggleEditingPanel()
    if (showAIImagePanel) onToggleAIImagePanel()
    if (showTextPanel) onToggleTextPanel()
    // Added: close Videos panel if open
    if (showVideosPanel) onToggleVideosPanel()
    onToggleAudioPanel()
  }

  // Updated return statement as per the provided changes
  return (
    <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4 gap-6">
      <ToolbarButton
        icon={FolderOpen}
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
      {/* New Videos button */}
      <ToolbarButton
        icon={Video}
        label="Videos"
        isActive={showVideosPanel}
        onClick={handleVideosClick}
      />
      <ToolbarButton
        icon={Type}
        label="Text"
        isActive={showTextPanel}
        onClick={handleTextClick}
      />
      <ToolbarButton
        icon={Volume2}
        label="Audio"
        isActive={showAudioPanel}
        onClick={handleAudioClick}
      />
      {/* Layers and Settings buttons removed as per user request */}
    </div>
  )
}