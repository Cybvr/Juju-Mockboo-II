
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

      const textObj = new fabric.Textbox(options?.text || "Type your note here...", {
        left: x,
        top: y,
        width: 200,
        height: 160,
        fontSize: 16,
        fontFamily: "Arial, sans-serif",
        fill: "#374151",
        textAlign: "left",
        splitByGrapheme: true,
        editable: true,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        backgroundColor: selectedColor.bg,
        padding: 15,
        rx: 4,
        ry: 4,
        shadow: {
          color: "rgba(0, 0, 0, 0.15)",
          blur: 8,
          offsetX: 0,
          offsetY: 2,
        },
      })

      // Mark as both sticky note and text object
      textObj.name = `sticky-note-${options?.color || "yellow"}`
      textObj.isTextObject = true

      canvas.add(textObj)
      canvas.setActiveObject(textObj)
      canvas.renderAll()
      handleCanvasChange()

      // Auto-enter editing mode
      setTimeout(() => {
        textObj.enterEditing()
        textObj.hiddenTextarea?.focus()
        textObj.selectAll()
      }, 100)
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
