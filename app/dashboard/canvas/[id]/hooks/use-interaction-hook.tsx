"use client"
import type React from "react"
import { useCallback } from "react"
declare global {
  interface Window {
    copiedObjects?: any
    stickyNoteHook?: any
    textToolHook?: any
    canvasCore?: {
      handleUndo?: () => void
      handleRedo?: () => void
      handleCopy?: () => void
      handlePaste?: () => void
      handleDelete?: () => void
    }
  }
}
interface InteractionHookProps {
  fabricCanvasRef: React.MutableRefObject<any>
  handleCanvasChange: () => void
  activeToolRef: React.MutableRefObject<any>
  isDrawingRef: React.MutableRefObject<boolean>
  setIsDrawing: (drawing: boolean) => void
  setActiveTool: (tool: string) => void
  brushSize?: number
  brushColor?: string
  drawingMode?: "draw" | "erase"
}
export function useInteractionHook({
  fabricCanvasRef,
  handleCanvasChange,
  activeToolRef,
  isDrawingRef,
  setIsDrawing,
  brushSize = 5,
  brushColor = "#000000",
  drawingMode = "draw",
}: InteractionHookProps) {
  const setupInteractions = useCallback(() => {
    if (!fabricCanvasRef.current) return null
    const canvas = fabricCanvasRef.current
    let startX = 0, startY = 0, activeShape: any = null
    const handleMouseDown = (e: any) => {
      const tool = activeToolRef.current
      const pointer = canvas.getPointer(e.e)

      // Handle tool-specific creation
      if (tool === "sticky-note") {
        window.stickyNoteHook?.createStickyNote?.(pointer.x, pointer.y)
        return
      }
      if (tool === "text") {
        window.textToolHook?.createTextObject?.(pointer.x, pointer.y)
        return
      }
      if (tool === "pen") {
        canvas.isDrawingMode = true
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.width = brushSize
          canvas.freeDrawingBrush.color = drawingMode === "erase" ? "rgba(0,0,0,0)" : brushColor
          canvas.freeDrawingBrush.globalCompositeOperation = drawingMode === "erase" ? "destination-out" : "source-over"
        }
        return
      }
      if (tool === "select" || tool === "pan") return

      // Only create shapes if clicking on empty canvas (no target)
      if (e.target) return

      // Handle shape drawing
      startX = pointer.x
      startY = pointer.y
      setIsDrawing(true)

      // Disable selection while drawing
      canvas.selection = false
      canvas.forEachObject((obj: any) => {
        obj.selectable = false
      })

      import("fabric").then((FabricModule) => {
        const fabric = FabricModule
        if (tool === "square") {
          activeShape = new fabric.Rect({
            left: startX, top: startY, width: 0, height: 0,
            fill: "rgba(59, 130, 246, 0.2)", stroke: "#3b82f6", strokeWidth: 2,
          })
        } else if (tool === "circle") {
          activeShape = new fabric.Circle({
            left: startX, top: startY, radius: 0,
            fill: "rgba(59, 130, 246, 0.2)", stroke: "#3b82f6", strokeWidth: 2,
          })
        }
        if (activeShape) canvas.add(activeShape)
      })
    }
    // Handle double-click for sticky note and text editing
    const handleDoubleClick = (e: any) => {
      const target = e.target
      if (!target) return

      console.log("🖱️ DOUBLE CLICK on:", {
        type: target.type,
        stickyColor: target.stickyColor,
        backgroundColor: target.backgroundColor,
        stickyNoteGroup: target.stickyNoteGroup,
        isTextObject: target.isTextObject
      })

      // Handle sticky note double-click editing (now single textbox objects)
      if ((target.type === "textbox" || target.type === "i-text") && target.stickyColor) {
        console.log("🟡 STICKY NOTE TEXTBOX CLICKED")
        target.enterEditing()
        target.hiddenTextarea?.focus()
        const onEditExit = () => {
          target.off("editing:exited", onEditExit)
          handleCanvasChange()
        }
        target.on("editing:exited", onEditExit)
        console.log("🟡 STICKY NOTE EDITING STARTED")
      }
      // Handle regular text object double-click editing
      else if ((target.type === "textbox" || target.type === "i-text") && !target.stickyColor && !target.group) {
        console.log("📝 REGULAR TEXT EDITING")
        target.enterEditing()
        target.hiddenTextarea?.focus()
        target.selectAll()
      }
    }
    const handleMouseMove = (e: any) => {
      if (!isDrawingRef.current || !activeShape) return
      const pointer = canvas.getPointer(e.e)
      const width = Math.abs(pointer.x - startX)
      const height = Math.abs(pointer.y - startY)
      if (activeToolRef.current === "square") {
        activeShape.set({
          width, height,
          left: Math.min(startX, pointer.x),
          top: Math.min(startY, pointer.y),
        })
      } else if (activeToolRef.current === "circle") {
        const radius = Math.sqrt(width * width + height * height) / 2
        activeShape.set({ radius, left: startX - radius, top: startY - radius })
      }
      canvas.renderAll()
    }
    const handleMouseUp = () => {
      if (isDrawingRef.current && activeShape) {
        // Re-enable selection and make objects selectable
        canvas.selection = true
        canvas.forEachObject((obj: any) => {
          obj.selectable = true
        })
        canvas.setActiveObject(activeShape)
        handleCanvasChange()
      }
      setIsDrawing(false)
      activeShape = null
    }
    canvas.on("mouse:down", handleMouseDown)
    canvas.on("mouse:move", handleMouseMove)
    canvas.on("mouse:up", handleMouseUp)
    canvas.on("mouse:dblclick", handleDoubleClick)
    canvas.on("path:created", () => {
      if (activeToolRef.current === "pen") handleCanvasChange()
    })
    return () => {
      canvas.off("mouse:down", handleMouseDown)
      canvas.off("mouse:move", handleMouseMove)
      canvas.off("mouse:up", handleMouseUp)
      canvas.off("mouse:dblclick", handleDoubleClick)
      canvas.off("path:created")
    }
  }, [fabricCanvasRef, handleCanvasChange, activeToolRef, isDrawingRef, setIsDrawing, brushSize, brushColor, drawingMode])
  const setupKeyboardHandlers = useCallback(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const canvas = fabricCanvasRef.current
      if (!canvas) return
      const activeElement = document.activeElement
      const isEditingText = canvas.getActiveObject()?.isEditing
      if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA" || activeElement.isContentEditable) || isEditingText) {
        return
      }
      // Undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        window.canvasCore?.handleUndo?.()
        return
      }
      // Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        window.canvasCore?.handleRedo?.()
        return
      }
      // Copy
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.preventDefault()
        window.canvasCore?.handleCopy?.()
        return
      }
      // Paste
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault()
        window.canvasCore?.handlePaste?.()
        return
      }
      // Delete
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault()
        window.canvasCore?.handleDelete?.()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])
  const setupPanAndZoom = useCallback(() => {
    if (!fabricCanvasRef.current) return null
    const canvas = fabricCanvasRef.current
    let isPanning = false, lastPanX = 0, lastPanY = 0
    const handleMouseWheel = (opt: any) => {
      const evt = opt.e
      evt.preventDefault()
      // Trackpad pinch zoom (ctrlKey indicates pinch gesture)
      if (evt.ctrlKey) {
        const delta = evt.deltaY
        const zoom = canvas.getZoom()
        let newZoom = zoom * (1 - delta / 100)
        newZoom = Math.max(0.001, Math.min(1000, newZoom))
        import("fabric").then((FabricModule) => {
          const fabric = FabricModule
          const canvasElement = canvas.getElement()
          const rect = canvasElement.getBoundingClientRect()
          const pointer = new fabric.Point(evt.clientX - rect.left, evt.clientY - rect.top)
          canvas.zoomToPoint(pointer, newZoom)
        })
        return
      }

      // Two-finger pan (horizontal movement dominates OR shift key held)
      if (Math.abs(evt.deltaX) > Math.abs(evt.deltaY) || evt.shiftKey) {
        const vpt = canvas.viewportTransform
        vpt[4] -= evt.deltaX * 0.5 // Reduce sensitivity
        vpt[5] -= evt.deltaY * 0.5
        canvas.requestRenderAll()
        return
      }
    }
    const handleMouseDown = (opt: any) => {
      const evt = opt.e as MouseEvent
      if (evt.altKey || evt.ctrlKey || activeToolRef.current === "pan") {
        isPanning = true
        canvas.selection = false
        lastPanX = evt.clientX
        lastPanY = evt.clientY
      }
    }
    const handleMouseMove = (opt: any) => {
      if (isPanning && !opt.e.touches) {
        const e = opt.e as MouseEvent
        const vpt = canvas.viewportTransform
        vpt[4] += e.clientX - lastPanX
        vpt[5] += e.clientY - lastPanY
        canvas.requestRenderAll()
        lastPanX = e.clientX
        lastPanY = e.clientY
      }
    }
    const handleMouseUp = () => {
      if (isPanning) {
        canvas.setViewportTransform(canvas.viewportTransform)
        isPanning = false
        canvas.selection = true
      }
    }
    canvas.on("mouse:wheel", handleMouseWheel)
    canvas.on("mouse:down", handleMouseDown)
    canvas.on("mouse:move", handleMouseMove)
    canvas.on("mouse:up", handleMouseUp)
    return () => {
      canvas.off("mouse:wheel", handleMouseWheel)
      canvas.off("mouse:down", handleMouseDown)
      canvas.off("mouse:move", handleMouseMove)
      canvas.off("mouse:up", handleMouseUp)
    }
  }, [fabricCanvasRef, activeToolRef])
  const setupTouchHandlers = useCallback(() => {
    if (!fabricCanvasRef.current) return null
    const canvas = fabricCanvasRef.current
    const canvasElement = canvas.getElement()
    let isPanning = false, lastPanX = 0, lastPanY = 0, lastDistance = 0
    const getDistance = (touch1: Touch, touch2: Touch) => {
      const dx = touch1.clientX - touch2.clientX
      const dy = touch1.clientY - touch2.clientY
      return Math.sqrt(dx * dx + dy * dy)
    }
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0]
        lastPanX = touch.clientX
        lastPanY = touch.clientY
      } else if (e.touches.length === 2) {
        e.preventDefault()
        e.stopPropagation()
        isPanning = true
        canvas.selection = false
        canvas.discardActiveObject()
        canvas.isDrawingMode = false
        const touch1 = e.touches[0], touch2 = e.touches[1]
        lastPanX = (touch1.clientX + touch2.clientX) / 2
        lastPanY = (touch1.clientY + touch2.clientY) / 2
        lastDistance = getDistance(touch1, touch2)
      }
    }
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && isPanning) {
        e.preventDefault()
        e.stopPropagation()
        const touch1 = e.touches[0], touch2 = e.touches[1]
        const centerX = (touch1.clientX + touch2.clientX) / 2
        const centerY = (touch1.clientY + touch2.clientY) / 2
        const distance = getDistance(touch1, touch2)
        // Pan
        const vpt = canvas.viewportTransform
        vpt[4] += centerX - lastPanX
        vpt[5] += centerY - lastPanY
        // Zoom
        if (lastDistance > 0) {
          const scale = distance / lastDistance
          const zoom = canvas.getZoom() * scale
          const clampedZoom = Math.min(Math.max(zoom, 0.1), 10)
          import("fabric").then((FabricModule) => {
            const fabric = FabricModule
            const rect = canvasElement.getBoundingClientRect()
            const localX = centerX - rect.left
            const localY = centerY - rect.top
            const point = new fabric.Point(localX, localY)
            canvas.zoomToPoint(point, clampedZoom)
          })
        }
        canvas.requestRenderAll()
        lastPanX = centerX
        lastPanY = centerY
        lastDistance = distance
      }
    }
    const handleTouchEnd = () => {
      setTimeout(() => {
        isPanning = false
        canvas.selection = true
      }, 100)
    }
    canvasElement.addEventListener("touchstart", handleTouchStart, { passive: false, capture: true })
    canvasElement.addEventListener("touchmove", handleTouchMove, { passive: false, capture: true })
    canvasElement.addEventListener("touchend", handleTouchEnd, { passive: false, capture: true })
    return () => {
      canvasElement.removeEventListener("touchstart", handleTouchStart)
      canvasElement.removeEventListener("touchmove", handleTouchMove)
      canvasElement.removeEventListener("touchend", handleTouchEnd)
    }
  }, [fabricCanvasRef])
  return { setupInteractions, setupKeyboardHandlers, setupPanAndZoom, setupTouchHandlers }
}