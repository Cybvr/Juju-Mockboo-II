"use client"

import { useCallback } from "react"

interface UseTextToolProps {
 fabricCanvasRef: React.MutableRefObject<any>
 handleCanvasChange: () => void
}

export function useTextTool({
 fabricCanvasRef,
 handleCanvasChange
}: UseTextToolProps) {

  const createTextBox = useCallback((x: number, y: number, options?: { text?: string; fontSize?: number; color?: string }) => {
    import("fabric").then((FabricModule) => {
      const fabric = FabricModule.fabric || FabricModule
      const canvas = fabricCanvasRef.current
      if (!canvas) return

      const text = new fabric.Textbox(options?.text || "Type here...", {
        left: x,
        top: y,
        width: 200,
        fontSize: options?.fontSize || 20,
        fontFamily: "Arial",
        fill: options?.color || "#000000",
        editable: true,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        cornerColor: "#4285f4",
        cornerStrokeColor: "#4285f4",
        borderColor: "#4285f4",
        transparentCorners: false
      })

      // Mark as text tool for toolbar detection
      text.textToolBox = true

      canvas.add(text)
      canvas.setActiveObject(text)
      canvas.renderAll()
      handleCanvasChange()
    })
  }, [fabricCanvasRef, handleCanvasChange])

  const setupTextInteractions = useCallback(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return null

    const handleDoubleClick = (e: any) => {
      const target = e.target
      if (target && target.textToolBox) {
        // Enter editing mode
        target.set({
          editable: true,
          selectable: true
        })

        canvas.setActiveObject(target)
        target.enterEditing()
        target.selectAll()

        const onEditExit = () => {
          target.off("editing:exited", onEditExit)
          handleCanvasChange()
        }

        target.on("editing:exited", onEditExit)
      }
    }

    canvas.on("mouse:dblclick", handleDoubleClick)

    return () => {
      canvas.off("mouse:dblclick", handleDoubleClick)
    }
  }, [fabricCanvasRef, handleCanvasChange])

  return {
    createTextBox,
    setupTextInteractions,
  }
}