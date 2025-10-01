
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
        stroke: selectedColor.border,
        strokeWidth: 1,
        rx: 4,
        ry: 4,
        left: 0,
        top: 0,
      })

      // Create folded corner
      const foldTriangle = new fabric.Polygon([
        { x: 170, y: 0 },
        { x: 200, y: 0 },
        { x: 200, y: 30 }
      ], {
        fill: selectedColor.border,
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
      const stickyGroup = new fabric.Group([noteBackground, foldTriangle, textObj], {
        left: x,
        top: y,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        lockRotation: true,
      })

      // Mark as sticky note for toolbar detection
      stickyGroup.stickyNoteGroup = true
      stickyGroup.stickyColor = options?.color || "yellow"

      canvas.add(stickyGroup)
      canvas.setActiveObject(stickyGroup)
      canvas.renderAll()
      handleCanvasChange()
    })
  }, [fabricCanvasRef, handleCanvasChange])

  const setupStickyNoteInteractions = useCallback(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return null

    const handleDoubleClick = (e: any) => {
      const target = e.target
      if (target && target.stickyNoteGroup) {
        // Find the text object in the group and enter edit mode
        const textObj = target.getObjects().find((obj: any) => obj.type === "textbox")
        if (textObj) {
          canvas.setActiveObject(textObj)
          textObj.enterEditing()
          textObj.selectAll()
        }
      }
    }

    canvas.on("mouse:dblclick", handleDoubleClick)

    return () => {
      canvas.off("mouse:dblclick", handleDoubleClick)
    }
  }, [fabricCanvasRef])

  return {
    createStickyNote,
    setupStickyNoteInteractions,
  }
}
