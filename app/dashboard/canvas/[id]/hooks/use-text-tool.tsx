
"use client"
import { useCallback } from "react"
import type { Canvas } from "fabric"

interface TextToolHookProps {
  fabricCanvasRef: React.MutableRefObject<any>
  handleCanvasChange: () => void
}

export function useTextTool({ fabricCanvasRef, handleCanvasChange }: TextToolHookProps) {

  const createTextObject = useCallback((x: number, y: number, options?: { text?: string; fontSize?: number; fontFamily?: string }) => {
    import("fabric").then((FabricModule) => {
      const fabric = FabricModule
      const canvas = fabricCanvasRef.current
      if (!canvas) return

      const textObj = new fabric.Textbox(options?.text || "Type your text here...", {
        left: x,
        top: y,
        width: 250,
        fontSize: options?.fontSize || 20,
        fontFamily: options?.fontFamily || "Arial",
        fill: "#000000",
        textAlign: "left",
        splitByGrapheme: true,
        editable: true,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        cornerColor: "#2563eb",
        cornerSize: 8,
        transparentCorners: false,
      })

      // Mark as text object for toolbar detection
      textObj.isTextObject = true

      canvas.add(textObj)
      canvas.setActiveObject(textObj)
      canvas.renderAll()
      handleCanvasChange()

      // Auto-enter editing mode
      setTimeout(() => {
        textObj.enterEditing()
        textObj.selectAll()
      }, 100)
    })
  }, [fabricCanvasRef, handleCanvasChange])

  const setupTextInteractions = useCallback(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return null

    const handleDoubleClick = (e: any) => {
      const target = e.target
      if (target && (target.type === "textbox" || target.type === "i-text" || target.isTextObject)) {
        target.enterEditing()
        target.selectAll()
      }
    }

    canvas.on("mouse:dblclick", handleDoubleClick)

    return () => {
      canvas.off("mouse:dblclick", handleDoubleClick)
    }
  }, [fabricCanvasRef])

  return {
    createTextObject,
    setupTextInteractions,
  }
}
