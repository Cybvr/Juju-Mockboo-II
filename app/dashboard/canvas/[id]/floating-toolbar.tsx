"use client"
import { Button } from "@/components/ui/button"
import { Copy, Download, RefreshCcw, CircleFadingPlus, Flower2, Video, Scaling, Type, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { VisualRestylePanel } from "../common/visual-restyle-panel"
import { cn } from "@/lib/utils"
import { useStickyNotes } from "./hooks/use-sticky-notes"

interface FloatingToolbarProps {
  selectedObjects: any[]
  fabricCanvas: any
  onCopy: () => void
  onDuplicate: () => void
  onDownload: () => void
  onRegenerate: () => void
  onVariations: () => void
  onStyleApply: (style: string) => void
  onVideo: () => void
  onUpscale: () => void
  isGeneratingVariations?: boolean
}

const stickyColors = [
  { bg: "#ffeb3b", border: "#fbc02d", name: "yellow", label: "Yellow" },
  { bg: "#4caf50", border: "#388e3c", name: "green", label: "Green" },
  { bg: "#2196f3", border: "#1976d2", name: "blue", label: "Blue" },
  { bg: "#ff9800", border: "#f57c00", name: "orange", label: "Orange" },
  { bg: "#e91e63", border: "#c2185b", name: "pink", label: "Pink" },
  { bg: "#9c27b0", border: "#7b1fa2", name: "purple", label: "Purple" },
]

const fontSizes = [12, 14, 16, 18, 20, 24]

export function FloatingToolbar({
  selectedObjects,
  fabricCanvas,
  onCopy,
  onDuplicate,
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
  const [isColorOpen, setIsColorOpen] = useState(false)
  const [isFontOpen, setIsFontOpen] = useState(false)

  const {
    hasStickyNotes,
    currentStickyNote,
    handleStickyColorChange,
    handleStickyFontSizeChange,
    handleStickyDelete,
  } = useStickyNotes(selectedObjects, fabricCanvas, stickyColors)

  const hasImages = selectedObjects.some((obj: any) => obj.type === "image")
  // const hasStickyNotes = selectedObjects.some(
  //   (obj: any) =>
  //     (obj.type === "group" && obj.stickyNoteGroup) || obj.stickyNote || obj.stickyNoteText || obj.stickyNoteFold,
  // )
  // const currentStickyNote = selectedObjects.find(
  //   (obj: any) => (obj.type === "group" && obj.stickyNoteGroup) || obj.stickyNote || obj.stickyNoteText,
  // )

  useEffect(() => {
    if (!fabricCanvas || selectedObjects.length === 0) {
      setVisible(false)
      return
    }

    if (!hasImages && !hasStickyNotes) {
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
  }, [selectedObjects, fabricCanvas, hasImages, hasStickyNotes])

  const handleRestyleApply = () => {
    if (!selectedStyle) return
    onStyleApply(selectedStyle)
    setShowRestyleModal(false)
    setSelectedStyle("")
  }

  // const handleStickyColorChange = (colorName: string) => {
  //   if (!fabricCanvas) return

  //   const color = stickyColors.find((c) => c.name === colorName)
  //   if (!color) return

  //   selectedObjects.forEach((obj: any) => {
  //     if (obj.type === "group" && obj.stickyNoteGroup) {
  //       const objects = obj.getObjects()
  //       if (objects && objects.length >= 2) {
  //         objects[0].set({ fill: color.bg, stroke: color.border })
  //         if (objects[1]) {
  //           objects[1].set({ fill: color.border })
  //         }
  //       }
  //       obj.stickyColor = colorName
  //     } else if (obj.stickyNote) {
  //       obj.set({ fill: color.bg, stroke: color.border })
  //       obj.stickyColor = colorName
  //     } else if (obj.stickyNoteFold) {
  //       obj.set({ fill: color.border })
  //       obj.stickyColor = colorName
  //     }
  //   })

  //   fabricCanvas.renderAll()
  //   setIsColorOpen(false)
  // }

  // const handleStickyFontSizeChange = (size: number) => {
  //   if (!fabricCanvas) return

  //   selectedObjects.forEach((obj: any) => {
  //     if (obj.type === "group" && obj.stickyNoteGroup) {
  //       const objects = obj.getObjects()
  //       if (objects && objects.length >= 3) {
  //         objects[2].set({ fontSize: size })
  //       }
  //     } else if (obj.stickyNoteText) {
  //       obj.set({ fontSize: size })
  //     }
  //   })

  //   fabricCanvas.renderAll()
  //   setIsFontOpen(false)
  // }

  // const handleStickyDelete = () => {
  //   if (!fabricCanvas) return

  //   selectedObjects.forEach((obj: any) => {
  //     if (obj.stickyNote || obj.stickyNoteText || obj.stickyNoteFold || (obj.type === "group" && obj.stickyNoteGroup)) {
  //       fabricCanvas.remove(obj)
  //     }
  //   })

  //   fabricCanvas.renderAll()
  // }

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
        {hasStickyNotes && (
          <>
            {/* Color Picker for Sticky Notes */}
            <Popover open={isColorOpen} onOpenChange={setIsColorOpen}>
              <PopoverTrigger asChild>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{
                          backgroundColor:
                            stickyColors.find((c) => c.name === (currentStickyNote?.stickyColor || "yellow"))?.bg ||
                            "#ffeb3b",
                        }}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Change Color</p>
                  </TooltipContent>
                </Tooltip>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-3">
                <div className="grid grid-cols-3 gap-2">
                  {stickyColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => handleStickyColorChange(color.name)}
                      className={cn(
                        "w-12 h-12 rounded-lg border-2 transition-all hover:scale-105",
                        (currentStickyNote?.stickyColor || "yellow") === color.name
                          ? "border-foreground"
                          : "border-border",
                      )}
                      style={{ backgroundColor: color.bg }}
                      title={color.label}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Font Size for Sticky Notes */}
            <Popover open={isFontOpen} onOpenChange={setIsFontOpen}>
              <PopoverTrigger asChild>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Type className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Font Size</p>
                  </TooltipContent>
                </Tooltip>
              </PopoverTrigger>
              <PopoverContent className="w-32 p-2">
                <div className="space-y-1">
                  {fontSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleStickyFontSizeChange(size)}
                      className="w-full text-left px-2 py-1 rounded hover:bg-accent text-sm"
                    >
                      {size}px
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Delete Sticky Note */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleStickyDelete}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}

        {hasImages && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onCopy} className="h-8 w-8">
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onDuplicate} className="h-8 w-8">
                  <CircleFadingPlus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Duplicate</p>
              </TooltipContent>
            </Tooltip>
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
          </>
        )}
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