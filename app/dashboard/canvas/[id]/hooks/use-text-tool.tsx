
"use client"

import { useCallback } from "react"

interface UseTextToolProps {
  fabricCanvasRef: React.MutableRefObject<any>
  handleCanvasChange: () => void
  activeTool: string
}

export function useTextTool({
  fabricCanvasRef,
  handleCanvasChange,
  activeTool
}: UseTextToolProps) {
  
  const addTextAtPosition = useCallback((x: number, y: number) => {
    if (!fabricCanvasRef.current || activeTool !== "text") return

    console.log("🆕 Creating new text at position:", { x, y })

    import("fabric").then((FabricModule) => {
      const fabric = FabricModule.fabric || FabricModule
      
      const text = new fabric.Textbox("Type here...", {
        left: x,
        top: y,
        width: 200,
        fontSize: 20,
        fontFamily: "Arial",
        fill: "#000000",
        editable: true,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        evented: true
      })

      console.log("📝 Text object created:", text)
      
      fabricCanvasRef.current.add(text)
      fabricCanvasRef.current.setActiveObject(text)
      fabricCanvasRef.current.renderAll()
      
      // Enter editing mode immediately
      text.enterEditing()
      text.selectAll()
      
      console.log("✏️ Text entered editing mode")
      
      handleCanvasChange()
    })
  }, [fabricCanvasRef, handleCanvasChange, activeTool])

  const setupTextTool = useCallback(() => {
    if (!fabricCanvasRef.current) return null

    const canvas = fabricCanvasRef.current

    const handleCanvasClick = (e: any) => {
      if (activeTool !== "text") return
      
      // Don't add text if clicking on an existing object - let Fabric handle text editing
      if (e.target && e.target !== canvas) {
        // Let Fabric handle the text object click for editing
        return
      }

      const pointer = canvas.getPointer(e.e)
      addTextAtPosition(pointer.x, pointer.y)
    }

    canvas.on("mouse:down", handleCanvasClick)

    return () => {
      canvas.off("mouse:down", handleCanvasClick)
    }
  }, [fabricCanvasRef, activeTool, addTextAtPosition])

  return {
    setupTextTool,
    addTextAtPosition
  }
}
