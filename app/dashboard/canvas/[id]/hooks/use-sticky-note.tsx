
"use client"
import { useCallback } from "react"

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
        { name: "yellow", bg: "#FEF3C7" },
        { name: "pink", bg: "#FCE7F3" },
        { name: "blue", bg: "#DBEAFE" },
        { name: "green", bg: "#D1FAE5" },
        { name: "orange", bg: "#FED7AA" },
        { name: "purple", bg: "#E9D5FF" },
      ]

      const selectedColor = stickyColors.find(c => c.name === (options?.color || "yellow")) || stickyColors[0]

      const textObj = new fabric.Textbox(options?.text || "Type your note here...", {
        left: x,
        top: y,
        width: 200,
        fontSize: 16,
        fontFamily: "Arial",
        fill: "#374151",
        textAlign: "left",
        splitByGrapheme: true,
        editable: true,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        backgroundColor: selectedColor.bg,
        padding: 15,
        cornerColor: "#2563eb",
        cornerSize: 8,
        transparentCorners: false,
      })

      // Mark as text object (same as regular text)
      textObj.isTextObject = true
      textObj.stickyColor = options?.color || "yellow"

      canvas.add(textObj)
      canvas.setActiveObject(textObj)
      canvas.renderAll()
      handleCanvasChange()
    })
  }, [fabricCanvasRef, handleCanvasChange])

  return {
    createStickyNote,
  }
}
