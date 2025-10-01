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
        // These properties are handled by the double-click interaction now
        // hasControls: true,
        // hasBorders: true,
        // evented: true
      })

      console.log("📝 Text object created:", text)
      
      fabricCanvasRef.current.add(text)
      fabricCanvasRef.current.setActiveObject(text)
      fabricCanvasRef.current.renderAll()
      
      // The enterEditing and selectAll are now handled by the double-click interaction
      // text.enterEditing()
      // text.selectAll()
      
      console.log("✏️ Text entered editing mode")
      
      handleCanvasChange()
    })
  }, [fabricCanvasRef, handleCanvasChange, activeTool])

  const setupTextInteractions = useCallback(() => {
    if (!fabricCanvasRef.current) return null

    const canvas = fabricCanvasRef.current

    const handleDoubleClick = (e: any) => {
      const target = e.target
      
      // Check if double-clicked on a text object (same logic as sticky notes)
      if (target && (target.type === "textbox" || target.type === "i-text" || target.type === "text")) {
        console.log("🖱️ Double-clicked on text object")
        
        // Make text editable directly (same as sticky notes)
        target.set({
          editable: true,
          selectable: true
        })

        // Set as active and enter editing (same as sticky notes)
        canvas.setActiveObject(target)
        target.enterEditing()
        target.selectAll()

        console.log("✏️ Text object entered editing mode")

        // Save changes when editing exits (same as sticky notes)
        const onEditExit = () => {
          target.off("editing:exited", onEditExit)
          handleCanvasChange()
          console.log("💾 Text changes saved")
        }

        target.on("editing:exited", onEditExit)
      }
    }

    canvas.on("mouse:dblclick", handleDoubleClick)

    return () => {
      canvas.off("mouse:dblclick", handleDoubleClick)
    }
  }, [fabricCanvasRef, handleCanvasChange])

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
    setupTextInteractions,
    addTextAtPosition
  }
}