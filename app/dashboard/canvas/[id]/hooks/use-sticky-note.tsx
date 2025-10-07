
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

      // Create the sticky note background rectangle
      const stickyBackground = new fabric.Rect({
        left: x,
        top: y,
        width: 200,
        height: 200,
        fill: selectedColor.bg,
        stroke: selectedColor.bg,
        strokeWidth: 1,
        rx: 5,
        ry: 5,
        selectable: false,
        evented: false,
      })

      // Create the text on top
      const textObj = new fabric.Textbox(options?.text || "Type your note here...", {
        left: x + 15,
        top: y + 15,
        width: 170,
        height: 170,
        fontSize: 16,
        fontFamily: "Arial",
        fill: "#374151",
        textAlign: "left",
        splitByGrapheme: true,
        editable: true,
        selectable: false,
        hasControls: false,
        hasBorders: false,
        backgroundColor: "transparent",
        padding: 0,
      })

      // Mark both objects with sticky properties but don't group them
      stickyBackground.stickyColor = options?.color || "yellow"
      stickyBackground.backgroundColor = selectedColor.bg
      stickyBackground.stickyNoteGroup = true
      
      textObj.stickyColor = options?.color || "yellow"
      textObj.backgroundColor = selectedColor.bg
      textObj.stickyNoteGroup = true
      textObj.isTextObject = true
      textObj.selectable = true
      textObj.hasControls = true
      textObj.hasBorders = true
      
      console.log("🟡 CREATING STICKY NOTE:", {
        backgroundColor: selectedColor.bg,
        stickyColor: textObj.stickyColor,
        isTextObject: textObj.isTextObject,
        text: textObj.text
      })

      canvas.add(stickyBackground)
      canvas.add(textObj)
      canvas.setActiveObject(textObj)
      canvas.renderAll()
      handleCanvasChange()

      // Auto-enter editing mode for the text
      setTimeout(() => {
        textObj.enterEditing()
        textObj.hiddenTextarea?.focus()
        textObj.selectAll()
      }, 100)
    })
  }, [fabricCanvasRef, handleCanvasChange])

  return {
    createStickyNote,
  }
}
