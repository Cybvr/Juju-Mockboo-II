"use client"

import type React from "react"

import { useCallback } from "react"
import { useStickyNotes } from "./use-sticky-notes"

interface InteractionHookProps {
  fabricCanvasRef: React.MutableRefObject<any>
  handleCanvasChange: () => void
  activeToolRef: React.MutableRefObject<any>
  isDrawingRef: React.MutableRefObject<boolean>
  setIsDrawing: (drawing: boolean) => void
  setActiveTool: (tool: string) => void
  brushSize?: number // Added brush size prop
  brushColor?: string // Added brush color prop
  drawingMode?: "draw" | "erase" // Added drawing mode prop
  stickyNotes?: any // Accept sticky notes functions
}

export function useInteractionHook({
  fabricCanvasRef,
  handleCanvasChange,
  activeToolRef,
  isDrawingRef,
  setIsDrawing,
  setActiveTool,
  brushSize = 5, // Added brush size with default
  brushColor = "#000000", // Added brush color with default
  drawingMode = "draw", // Added drawing mode with default
  stickyNotes, // Use passed sticky notes functions
}: InteractionHookProps) {
  const setupInteractions = useCallback(() => {
    if (!fabricCanvasRef.current) return null

    const canvas = fabricCanvasRef.current

    // Drawing handlers
    let startX = 0
    let startY = 0
    let activeShape: any = null

    const handleMouseDown = (e: any) => {
      if (activeToolRef.current === "pen") {
        canvas.isDrawingMode = true
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.width = brushSize
          canvas.freeDrawingBrush.color = drawingMode === "erase" ? "rgba(0,0,0,0)" : brushColor

          // Set up eraser mode
          if (drawingMode === "erase") {
            canvas.freeDrawingBrush.globalCompositeOperation = "destination-out"
          } else {
            canvas.freeDrawingBrush.globalCompositeOperation = "source-over"
          }
        }

        return
      }

      if (activeToolRef.current === "sticky") {
        const pointer = canvas.getPointer(e.e)
        stickyNotes.createStickyNote(pointer)
        return
      }

      if (activeToolRef.current === "text") {
        const pointer = canvas.getPointer(e.e)

        import("fabric").then((FabricModule) => {
          const fabric = FabricModule
          const textbox = new fabric.Textbox("Type here...", {
            left: pointer.x,
            top: pointer.y,
            width: 200,
            fontSize: 16,
            fill: "#000000",
            fontFamily: "Arial",
            editable: true,
          })
          canvas.add(textbox)
          canvas.setActiveObject(textbox)
          textbox.enterEditing()
          handleCanvasChange()
        })
        return
      }

      if (activeToolRef.current === "select" || activeToolRef.current === "pan") return

      const pointer = canvas.getPointer(e.e)
      startX = pointer.x
      startY = pointer.y
      setIsDrawing(true)

      import("fabric").then((FabricModule) => {
        const fabric = FabricModule

        if (activeToolRef.current === "square") {
          activeShape = new fabric.Rect({
            left: startX,
            top: startY,
            width: 0,
            height: 0,
            fill: "transparent",
            stroke: "#000000",
            strokeWidth: 2,
          })
        } else if (activeToolRef.current === "circle") {
          activeShape = new fabric.Circle({
            left: startX,
            top: startY,
            radius: 0,
            fill: "transparent",
            stroke: "#000000",
            strokeWidth: 2,
          })
        }

        if (activeShape) {
          canvas.add(activeShape)
        }
      })
    }

    const handleMouseMove = (e: any) => {
      if (
        !isDrawingRef.current ||
        !activeShape ||
        activeToolRef.current === "select" ||
        activeToolRef.current === "pan"
      )
        return

      const pointer = canvas.getPointer(e.e)
      const width = Math.abs(pointer.x - startX)
      const height = Math.abs(pointer.y - startY)

      if (activeToolRef.current === "square") {
        activeShape.set({
          width: width,
          height: height,
          left: Math.min(startX, pointer.x),
          top: Math.min(startY, pointer.y),
        })
      } else if (activeToolRef.current === "circle") {
        const radius = Math.sqrt(width * width + height * height) / 2
        activeShape.set({
          radius: radius,
          left: startX - radius,
          top: startY - radius,
        })
      }

      canvas.renderAll()
    }

    const handleMouseUp = () => {
      if (isDrawingRef.current && activeShape) {
        canvas.setActiveObject(activeShape)
        setActiveTool("select")
        handleCanvasChange()
      }
      setIsDrawing(false)
      activeShape = null
    }

    canvas.on("mouse:down", handleMouseDown)
    canvas.on("mouse:move", handleMouseMove)
    canvas.on("mouse:up", handleMouseUp)

    canvas.on("path:created", (e: any) => {
      if (activeToolRef.current === "pen") {
        handleCanvasChange()
      }
    })

    return () => {
      canvas.off("mouse:down", handleMouseDown)
      canvas.off("mouse:move", handleMouseMove)
      canvas.off("mouse:up", handleMouseUp)
      canvas.off("path:created") // Clean up path created listener
    }
  }, [
    fabricCanvasRef,
    handleCanvasChange,
    activeToolRef,
    isDrawingRef,
    setIsDrawing,
    setActiveTool,
    brushSize,
    brushColor,
    drawingMode,
  ]) // Added new dependencies

  const setupKeyboardHandlers = useCallback(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard events when canvas is focused or no input elements are focused
      const activeElement = document.activeElement
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA" || activeElement.isContentEditable)
      ) {
        return // Don't handle if user is typing in an input
      }

      const canvas = fabricCanvasRef.current
      if (!canvas) return

      // Handle Ctrl+Z (undo) and Ctrl+Y (redo)
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        canvas.undo()
        return
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        canvas.redo()
        return
      }

      // Handle delete keys - comprehensive detection for cross-platform support
      const isDeleteKey =
        e.key === "Delete" ||
        e.key === "Backspace" ||
        e.code === "Backspace" ||
        e.code === "Delete" ||
        e.keyCode === 8 ||
        e.keyCode === 46

      if (isDeleteKey) {
        e.preventDefault()

        const activeObjects = canvas.getActiveObjects()
        if (activeObjects && activeObjects.length > 0) {
          // Handle multiple selected objects
          activeObjects.forEach((obj: any) => {
            canvas.remove(obj)
          })

          // Clear selection after deletion
          canvas.discardActiveObject()
          canvas.renderAll()
          handleCanvasChange()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [fabricCanvasRef, handleCanvasChange])

  const setupPanAndZoom = useCallback(() => {
    if (!fabricCanvasRef.current) return null

    const canvas = fabricCanvasRef.current

    // Zoom handling
    const handleMouseWheel = (opt: any) => {
      const delta = opt.e.deltaY
      let zoom = canvas.getZoom()
      zoom *= 0.999 ** delta
      zoom = Math.max(0.2, Math.min(5, zoom))

      import("fabric").then((FabricModule) => {
        const fabric = FabricModule
        // Use canvas center point instead of mouse position for consistent zoom
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        canvas.zoomToPoint(new fabric.Point(centerX, centerY), zoom)
      })

      opt.e.preventDefault()
      opt.e.stopPropagation()
    }

    // Pan handling
    let isPanning = false
    let lastPanX = 0
    let lastPanY = 0

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
      if (!isPanning) return
      canvas.setViewportTransform(canvas.viewportTransform)
      isPanning = false
      canvas.selection = true
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

    let isPanning = false
    let isZooming = false
    let lastPanX = 0
    let lastPanY = 0
    let lastDistance = 0
    let startTime = 0
    let lastTouchEnd = 0

    const getDistance = (touch1: Touch, touch2: Touch) => {
      const dx = touch1.clientX - touch2.clientX
      const dy = touch1.clientY - touch2.clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const handleTouchStart = (e: TouchEvent) => {
      startTime = Date.now()

      if (e.touches.length === 1) {
        // Single touch - prepare for potential pan or selection
        const touch = e.touches[0]
        lastPanX = touch.clientX
        lastPanY = touch.clientY
      } else if (e.touches.length === 2) {
        // Two finger gesture - disable selection and prepare for pan/zoom
        e.preventDefault()
        isPanning = true
        isZooming = true
        canvas.selection = false
        canvas.defaultCursor = "grab"

        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        lastPanX = (touch1.clientX + touch2.clientX) / 2
        lastPanY = (touch1.clientY + touch2.clientY) / 2
        lastDistance = getDistance(touch1, touch2)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && !isPanning) {
        // Single finger drag - check if we should start panning
        const touch = e.touches[0]
        const deltaX = Math.abs(touch.clientX - lastPanX)
        const deltaY = Math.abs(touch.clientY - lastPanY)

        // If moved significantly, start panning
        if (deltaX > 10 || deltaY > 10) {
          e.preventDefault()
          isPanning = true
          canvas.selection = false
        }
      }

      if (e.touches.length === 1 && isPanning) {
        // Single finger pan
        e.preventDefault()
        const touch = e.touches[0]
        const deltaX = touch.clientX - lastPanX
        const deltaY = touch.clientY - lastPanY

        const vpt = canvas.viewportTransform
        vpt[4] += deltaX
        vpt[5] += deltaY
        canvas.requestRenderAll()

        lastPanX = touch.clientX
        lastPanY = touch.clientY
      } else if (e.touches.length === 2 && (isPanning || isZooming)) {
        // Two finger pan and zoom
        e.preventDefault()

        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const centerX = (touch1.clientX + touch2.clientX) / 2
        const centerY = (touch1.clientY + touch2.clientY) / 2
        const currentDistance = getDistance(touch1, touch2)

        // Pan
        if (isPanning) {
          const deltaX = centerX - lastPanX
          const deltaY = centerY - lastPanY

          const vpt = canvas.viewportTransform
          vpt[4] += deltaX
          vpt[5] += deltaY
          canvas.requestRenderAll()
        }

        // Zoom
        if (isZooming && Math.abs(currentDistance - lastDistance) > 5) {
          const zoom = canvas.getZoom()
          const zoomDelta = (currentDistance - lastDistance) / 200
          const newZoom = Math.max(0.2, Math.min(5, zoom + zoomDelta))

          import("fabric").then((FabricModule) => {
            const fabric = FabricModule
            const rect = canvasElement.getBoundingClientRect()
            const point = new fabric.Point(centerX - rect.left, centerY - rect.top)
            canvas.zoomToPoint(point, newZoom)
          })
        }

        lastPanX = centerX
        lastPanY = centerY
        lastDistance = currentDistance
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndTime = Date.now()

      if (e.touches.length === 0) {
        // All touches ended
        if (isPanning || isZooming) {
          canvas.setViewportTransform(canvas.viewportTransform)
        }

        // Reset states
        setTimeout(() => {
          isPanning = false
          isZooming = false
          canvas.selection = true
          canvas.defaultCursor = "default"
        }, 100)

        // Handle double tap for reset zoom
        if (touchEndTime - lastTouchEnd < 300 && touchEndTime - startTime < 300) {
          canvas.setZoom(1)
          canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
          canvas.renderAll()
        }

        lastTouchEnd = touchEndTime
      } else if (e.touches.length === 1) {
        // One finger left, disable two-finger gestures
        isZooming = false

        // Continue single finger pan if already panning
        const touch = e.touches[0]
        lastPanX = touch.clientX
        lastPanY = touch.clientY
      }
    }

    // Prevent context menu on long press
    const handleContextMenu = (e: Event) => {
      e.preventDefault()
    }

    canvasElement.addEventListener("touchstart", handleTouchStart, { passive: false })
    canvasElement.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvasElement.addEventListener("touchend", handleTouchEnd, { passive: false })
    canvasElement.addEventListener("contextmenu", handleContextMenu)

    return () => {
      canvasElement.removeEventListener("touchstart", handleTouchStart)
      canvasElement.removeEventListener("touchmove", handleTouchMove)
      canvasElement.removeEventListener("touchend", handleTouchEnd)
      canvasElement.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [fabricCanvasRef])

  return {
    setupInteractions,
    setupKeyboardHandlers,
    setupPanAndZoom,
    setupTouchHandlers,
  }
}
