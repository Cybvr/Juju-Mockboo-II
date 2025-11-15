
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

      // Create sticky note as a single Textbox with background
      const stickyNote = new fabric.Textbox(options?.text || "Type your note here...", {
        left: x,
        top: y,
        width: 150,
        height: 150,
        fontSize: 14,
        fontFamily: "Arial",
        fill: "#374151",
        textAlign: "left",
        splitByGrapheme: true,
        editable: true,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        cornerColor: "#2563eb",
        cornerSize: 8,
        transparentCorners: false,
        backgroundColor: selectedColor.bg,
        padding: 50,
        borderRadius: 8,
        lineHeight: 1.4,
        charSpacing: 0,
        styles: {},
      })

      // Set custom properties for identification
      Object.defineProperty(stickyNote, 'isTextObject', {
        value: true,
        writable: true,
        enumerable: true,
        configurable: true
      })
      
      Object.defineProperty(stickyNote, 'stickyColor', {
        value: options?.color || "yellow",
        writable: true,
        enumerable: true,
        configurable: true
      })

      Object.defineProperty(stickyNote, 'stickyNoteGroup', {
        value: true,
        writable: true,
        enumerable: true,
        configurable: true
      })

      // Override toObject to include custom properties
      const originalToObject = stickyNote.toObject.bind(stickyNote)
      stickyNote.toObject = function(propertiesToInclude?: string[]) {
        const obj = originalToObject(propertiesToInclude)
        return {
          ...obj,
          isTextObject: this.isTextObject,
          stickyColor: this.stickyColor,
          stickyNoteGroup: this.stickyNoteGroup
        }
      }

      console.log("🟡 CREATING STICKY NOTE:", {
        backgroundColor: selectedColor.bg,
        stickyColor: stickyNote.stickyColor,
        isTextObject: stickyNote.isTextObject,
        text: stickyNote.text
      })

      canvas.add(stickyNote)
      canvas.setActiveObject(stickyNote)
      canvas.renderAll()
      handleCanvasChange()

      // Auto-enter editing mode
      setTimeout(() => {
        stickyNote.enterEditing()
        stickyNote.hiddenTextarea?.focus()
        stickyNote.selectAll()
      }, 100)
    })
  }, [fabricCanvasRef, handleCanvasChange])

  return {
    createStickyNote,
  }
}
