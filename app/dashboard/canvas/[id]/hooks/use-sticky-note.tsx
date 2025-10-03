"use client"
import { useCallback } from "react"
import type { Canvas } from "fabric"

interface StickyNoteHookProps {
 fabricCanvasRef: React.MutableRefObject<any>
 handleCanvasChange: () => void
}

export function useStickyNote({ fabricCanvasRef, handleCanvasChange }: StickyNoteHookProps) {

  const createStickyNote = useCallback((x: number, y: number, options?: { text?: string; color?: string }) => {
    import("fabric").then((FabricModule) => {
      const fabric = FabricModule
      const canvas = fabricCanvasRef.current
      if (!canvas) return

      const stickyColors = [
        { name: "yellow", bg: "#FEF3C7", border: "#F59E0B" },
        { name: "pink", bg: "#FCE7F3", border: "#EC4899" },
        { name: "blue", bg: "#DBEAFE", border: "#3B82F6" },
        { name: "green", bg: "#D1FAE5", border: "#10B981" },
        { name: "orange", bg: "#FED7AA", border: "#F97316" },
        { name: "purple", bg: "#E9D5FF", border: "#8B5CF6" },
      ]

      const selectedColor = stickyColors.find(c => c.name === (options?.color || "yellow")) || stickyColors[0]

      // Create main note background
      const noteBackground = new fabric.Rect({
        width: 200,
        height: 160,
        fill: selectedColor.bg,
        rx: 4,
        ry: 4,
        left: 0,
        top: 0,
      })

      // Create text area
      const textObj = new fabric.Textbox(options?.text || "Type your note here...", {
        left: 15,
        top: 15,
        width: 170,
        fontSize: 16,
        fontFamily: "Arial, sans-serif",
        fill: "#374151",
        textAlign: "left",
        splitByGrapheme: true,
        editable: true,
      })

      // Group all elements
      const stickyGroup = new fabric.Group([noteBackground, textObj], {
        left: x,
        top: y,
        selectable: true,
        hasControls: true,
        hasBorders: false,
        lockRotation: true,
        shadow: {
          color: "rgba(0, 0, 0, 0.15)",
          blur: 8,
          offsetX: 0,
          offsetY: 2,
        },
      })

      // Mark as sticky note for toolbar detection - MUST be preserved and serializable
      stickyGroup.stickyNoteGroup = true
      stickyGroup.stickyColor = options?.color || "yellow"

      // Override toObject to ensure custom properties are serialized
      stickyGroup.toObject = function() {
        return fabric.util.object.extend(fabric.Group.prototype.toObject.call(this), {
          stickyNoteGroup: this.stickyNoteGroup,
          stickyColor: this.stickyColor
        })
      }

      canvas.add(stickyGroup)
      canvas.setActiveObject(stickyGroup)
      canvas.renderAll()
      handleCanvasChange()
    })
  }, [fabricCanvasRef, handleCanvasChange])

  const setupStickyNoteInteractions = useCallback(() => {
    // This is now handled centrally in useInteractionHook
    return () => {}
  }, [])

  return {
    createStickyNote,
    setupStickyNoteInteractions,
  }
}