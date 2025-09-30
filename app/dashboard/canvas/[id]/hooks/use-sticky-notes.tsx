
"use client"

import { useCallback } from "react"
import type React from "react"

interface StickyNotesHookProps {
  fabricCanvasRef: React.MutableRefObject<any>
  handleCanvasChange: () => void
}

export function useStickyNotes({
  fabricCanvasRef,
  handleCanvasChange,
}: StickyNotesHookProps) {
  const createStickyNote = useCallback((pointer: { x: number; y: number }) => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current

    import("fabric").then((FabricModule) => {
      const fabric = FabricModule

      const stickyColors = [
        { bg: "#ffeb3b", border: "#fbc02d", name: "yellow" },
        { bg: "#4caf50", border: "#388e3c", name: "green" },
        { bg: "#2196f3", border: "#1976d2", name: "blue" },
        { bg: "#ff9800", border: "#f57c00", name: "orange" },
        { bg: "#e91e63", border: "#c2185b", name: "pink" },
        { bg: "#9c27b0", border: "#7b1fa2", name: "purple" },
      ]

      // Randomly select a color for variety
      const randomColor = stickyColors[Math.floor(Math.random() * stickyColors.length)]

      // Create sticky note background with authentic styling
      const stickyBg = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        width: 200,
        height: 150,
        fill: randomColor.bg,
        stroke: randomColor.border,
        strokeWidth: 1,
        rx: 3,
        ry: 3,
        selectable: false,
        evented: false,
        shadow: {
          color: "rgba(0,0,0,0.15)",
          blur: 8,
          offsetX: 2,
          offsetY: 4,
        },
        // Add custom properties to identify as sticky note
        stickyNote: true,
        stickyColor: randomColor.name,
      })

      // Add subtle fold effect in top-right corner
      const fold = new fabric.Polygon(
        [
          { x: 170, y: 0 },
          { x: 200, y: 0 },
          { x: 200, y: 30 },
          { x: 185, y: 15 },
        ],
        {
          left: pointer.x,
          top: pointer.y,
          fill: randomColor.border,
          opacity: 0.3,
          selectable: false,
          evented: false,
          stickyNoteFold: true,
          stickyColor: randomColor.name,
        },
      )

      // Create editable text with better styling
      const stickyText = new fabric.Textbox("Click to edit your note...", {
        left: pointer.x + 15,
        top: pointer.y + 20,
        width: 170,
        fontSize: 14,
        fill: "#2c2c2c",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
        editable: true,
        textAlign: "left",
        lineHeight: 1.4,
        charSpacing: 0,
        // Add custom properties
        stickyNoteText: true,
        stickyColor: randomColor.name,
      })

      const stickyGroup = new fabric.Group([stickyBg, fold, stickyText], {
        left: pointer.x,
        top: pointer.y,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        lockScalingFlip: true,
        // Custom properties for the group
        stickyNoteGroup: true,
        stickyColor: randomColor.name,
      })

      stickyGroup.on("mousedblclick", () => {
        // Temporarily ungroup for text editing
        const objects = stickyGroup.getObjects()
        const textObj = objects.find((obj: any) => obj.stickyNoteText)

        if (textObj) {
          // Store group position
          const groupLeft = stickyGroup.left || 0
          const groupTop = stickyGroup.top || 0

          // Remove group and add individual objects
          canvas.remove(stickyGroup)
          objects.forEach((obj: any) => {
            // Adjust positions relative to group
            obj.left = (obj.left || 0) + groupLeft
            obj.top = (obj.top || 0) + groupTop
            canvas.add(obj)
          })

          // Make text editable and enter editing mode
          textObj.selectable = true
          textObj.evented = true
          canvas.setActiveObject(textObj)
          textObj.enterEditing()

          // Re-group when editing is done
          const handleEditingExit = () => {
            textObj.off("editing:exited", handleEditingExit)

            // Make objects non-selectable again
            objects.forEach((obj: any) => {
              if (obj !== textObj) {
                obj.selectable = false
                obj.evented = false
              }
            })

            // Create new group
            const newGroup = new fabric.Group(objects, {
              left: groupLeft,
              top: groupTop,
              selectable: true,
              hasControls: true,
              hasBorders: true,
              lockScalingFlip: true,
              stickyNoteGroup: true,
              stickyColor: randomColor.name,
            })

            // Add double-click handler to new group
            newGroup.on("mousedblclick", () => {
              stickyGroup.fire("mousedblclick")
            })

            // Remove individual objects and add group
            objects.forEach((obj: any) => {
              canvas.remove(obj)
            })
            canvas.add(newGroup)
            canvas.setActiveObject(newGroup)
            handleCanvasChange()
          }

          textObj.on("editing:exited", handleEditingExit)
        }
      })

      canvas.add(stickyGroup)
      canvas.setActiveObject(stickyGroup)
      handleCanvasChange()
    })
  }, [fabricCanvasRef, handleCanvasChange])

  const changeStickyColor = useCallback((stickyObject: any, newColorName: string) => {
    if (!fabricCanvasRef.current || !stickyObject.stickyNoteGroup) return

    const canvas = fabricCanvasRef.current

    const stickyColors = [
      { bg: "#ffeb3b", border: "#fbc02d", name: "yellow" },
      { bg: "#4caf50", border: "#388e3c", name: "green" },
      { bg: "#2196f3", border: "#1976d2", name: "blue" },
      { bg: "#ff9800", border: "#f57c00", name: "orange" },
      { bg: "#e91e63", border: "#c2185b", name: "pink" },
      { bg: "#9c27b0", border: "#7b1fa2", name: "purple" },
    ]

    const newColor = stickyColors.find(c => c.name === newColorName)
    if (!newColor) return

    const objects = stickyObject.getObjects()
    const background = objects.find((obj: any) => obj.stickyNote)
    const fold = objects.find((obj: any) => obj.stickyNoteFold)

    if (background) {
      background.set({
        fill: newColor.bg,
        stroke: newColor.border,
      })
    }

    if (fold) {
      fold.set({
        fill: newColor.border,
      })
    }

    stickyObject.stickyColor = newColorName
    canvas.renderAll()
    handleCanvasChange()
  }, [fabricCanvasRef, handleCanvasChange])

  const changeStickyFontSize = useCallback((stickyObject: any, fontSize: number) => {
    if (!fabricCanvasRef.current || !stickyObject.stickyNoteGroup) return

    const canvas = fabricCanvasRef.current
    const objects = stickyObject.getObjects()
    const textObj = objects.find((obj: any) => obj.stickyNoteText)

    if (textObj) {
      textObj.set({ fontSize })
      canvas.renderAll()
      handleCanvasChange()
    }
  }, [fabricCanvasRef, handleCanvasChange])

  const deleteStickyNote = useCallback((stickyObject: any) => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current
    canvas.remove(stickyObject)
    canvas.discardActiveObject()
    canvas.renderAll()
    handleCanvasChange()
  }, [fabricCanvasRef, handleCanvasChange])

  const updateHandleCanvasChange = useCallback((newHandleCanvasChange: () => void) => {
    // This allows updating the handleCanvasChange function after initialization
    handleCanvasChange = newHandleCanvasChange
  }, [])

  return {
    createStickyNote,
    changeStickyColor,
    changeStickyFontSize,
    deleteStickyNote,
    updateHandleCanvasChange,
  }
}
