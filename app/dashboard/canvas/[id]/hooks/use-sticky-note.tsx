"use client"
import { useCallback } from "react"

interface StickyNoteHookProps {
 fabricCanvasRef: React.MutableRefObject<any>
 handleCanvasChange: () => void
}

export function useStickyNote({ fabricCanvasRef, handleCanvasChange }: StickyNoteHookProps) {

  const createStickyNote = useCallback(async (x: number, y: number, options?: { text?: string; color?: string }) => {
    const { StickyNote } = await import("../fabric/stickyNote")
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    const note = new StickyNote(options?.text || "Type your note here...", {
      left: x,
      top: y,
      stickyColor: options?.color || "yellow",
    })

    console.log("🟡 CREATING STICKY NOTE:", {
      type: note.type,
      stickyColor: note.stickyColor,
      isTextObject: note.isTextObject,
      text: note.getText()
    })

    canvas.add(note)
    canvas.setActiveObject(note)
    canvas.renderAll()
    handleCanvasChange()

    // Auto-enter editing mode for the text
    setTimeout(() => {
      canvas.setActiveObject(note)
      note.textbox.enterEditing()
      note.textbox.hiddenTextarea?.focus()
      note.textbox.selectAll()
    }, 100)
  }, [fabricCanvasRef, handleCanvasChange])

  return {
    createStickyNote,
  }
}