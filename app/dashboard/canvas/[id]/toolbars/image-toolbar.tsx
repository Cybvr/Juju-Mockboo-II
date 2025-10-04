"use client"
import { Button } from "@/components/ui/button"
import { Download, RefreshCcw, CircleFadingPlus, Flower2, Video, Scaling } from "lucide-react"
import { useState, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { VisualRestylePanel } from "../../common/visual-restyle-panel"

interface FloatingToolbarProps {
  selectedObjects: any[]
  fabricCanvas: any
  onDownload: () => void
  onRegenerate: () => void
  onVariations: () => void
  onStyleApply: (style: string) => void
  onVideo: () => void
  onUpscale: () => void
  isGeneratingVariations?: boolean
}

export function FloatingToolbar({
  selectedObjects,
  fabricCanvas,
  onDownload,
  onRegenerate,
  onVariations,
  onStyleApply,
  onVideo,
  onUpscale,
  isGeneratingVariations = false,
}: FloatingToolbarProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)
  const [showRestyleModal, setShowRestyleModal] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<string>("")

  const hasImages = selectedObjects.some((obj: any) => obj.type === "image")

  useEffect(() => {
    if (!fabricCanvas || selectedObjects.length === 0 || !hasImages) {
      setVisible(false)
      return
    }

    let minTop = Number.POSITIVE_INFINITY
    let centerX = 0
    selectedObjects.forEach((obj: any) => {
      const objBounds = obj.getBoundingRect()
      const objTop = objBounds.top
      const objCenterX = objBounds.left + objBounds.width / 2
      if (objTop < minTop) {
        minTop = objTop
      }
      centerX += objCenterX
    })
    centerX = centerX / selectedObjects.length
    const zoom = fabricCanvas.getZoom()
    const vpt = fabricCanvas.viewportTransform || [1, 0, 0, 1, 0, 0]
    const viewportX = centerX * zoom + vpt[4]
    const viewportY = Math.max(40, (minTop - 60) * zoom + vpt[5])
    setPosition({ x: viewportX, y: viewportY })
    setVisible(true)
  }, [selectedObjects, fabricCanvas, hasImages])

  const handleRestyleApply = () => {
    if (!selectedStyle) return
    onStyleApply(selectedStyle)
    setShowRestyleModal(false)
    setSelectedStyle("")
  }

  if (!visible) return null

  return (
    <TooltipProvider>
      <div
        className="absolute z-50 flex gap-1 bg-card border rounded-lg p-1 shadow-lg"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: "translateX(-50%)",
        }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onDownload} className="h-8 w-8">
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onRegenerate} className="h-8 w-8">
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Regenerate</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onVariations}
              disabled={isGeneratingVariations}
              className="h-8 w-8"
            >
              <CircleFadingPlus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Variations</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => setShowRestyleModal(true)} className="h-8 w-8">
              <Flower2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Styles</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onVideo} className="h-8 w-8">
              <Video className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Make Video</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onUpscale} className="h-8 w-8">
              <Scaling className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Upscale</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Dialog open={showRestyleModal} onOpenChange={setShowRestyleModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Apply Style</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <VisualRestylePanel selectedStyle={selectedStyle} onStyleSelect={setSelectedStyle} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRestyleModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleRestyleApply} disabled={!selectedStyle}>
                Apply Style
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}