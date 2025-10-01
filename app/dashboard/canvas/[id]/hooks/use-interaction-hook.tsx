"use client"

import type React from "react"
import { useCallback } from "react"

declare global {
  interface Window {
    copiedObjects?: any[]
    stickyNoteHook?: any
    textToolHook?: any
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

      if (tool === "text") {
        const pointer = canvas.getPointer(e.e)
        window.textToolHook?.createTextBox?.(pointer.x, pointer.y)
        return
      }

      if (tool === "sticky-note") {
        const pointer = canvas.getPointer(e.e)
        window.stickyNoteHook?.createStickyNote?.(pointer.x, pointer.y)
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

      const pointer = canvas.getPointer(e.e)
      startX = pointer.x
      startY = pointer.y
      setIsDrawing(true)

      import("fabric").then((FabricModule) => {
        const fabric = FabricModule
        if (tool === "square") {
          activeShape = new fabric.Rect({
            left: startX, top: startY, width: 0, height: 0,
            fill: "transparent", stroke: "#000000", strokeWidth: 2,
          })
        } else if (tool === "circle") {
          activeShape = new fabric.Circle({
            left: startX, top: startY, radius: 0,
            fill: "transparent", stroke: "#000000", strokeWidth: 2,
          })
        }
        if (activeShape) canvas.add(activeShape)
      })
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
        canvas.setActiveObject(activeShape)
        handleCanvasChange()
      }
      setIsDrawing(false)
      activeShape = null
    }

    canvas.on("mouse:down", handleMouseDown)
    canvas.on("mouse:move", handleMouseMove)
    canvas.on("mouse:up", handleMouseUp)
    canvas.on("path:created", () => {
      if (activeToolRef.current === "pen") handleCanvasChange()
    })

    return () => {
      canvas.off("mouse:down", handleMouseDown)
      canvas.off("mouse:move", handleMouseMove)
      canvas.off("mouse:up", handleMouseUp)
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

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        canvas.undo?.()
        return
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        canvas.redo?.()
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.preventDefault()
        const activeObjects = canvas.getActiveObjects()
        if (activeObjects?.length > 0) {
          window.copiedObjects = activeObjects.map(obj => obj.toObject())
        }
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault()
        if (window.copiedObjects?.length > 0) {
          import("fabric").then((FabricModule) => {
            const fabric = FabricModule.fabric || FabricModule
            
            window.copiedObjects.forEach((objData: any) => {
              fabric.util.enlivenObjects([objData], (objects: any) => {
                const obj = objects[0]
                obj.set({
                  left: obj.left + 20,
                  top: obj.top + 20
                })
                canvas.add(obj)
                canvas.setActiveObject(obj)
                canvas.renderAll()
                handleCanvasChange()
              })
            })
          })
        }
        return
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault()
        const activeObjects = canvas.getActiveObjects()
        if (activeObjects?.length > 0) {
          activeObjects.forEach((obj: any) => canvas.remove(obj))
          canvas.discardActiveObject()
          canvas.renderAll()
          handleCanvasChange()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [fabricCanvasRef, handleCanvasChange])

  const setupPanAndZoom = useCallback(() => {
    if (!fabricCanvasRef.current) return null
    const canvas = fabricCanvasRef.current
    let isPanning = false, lastPanX = 0, lastPanY = 0

    const handleMouseWheel = (opt: any) => {
      const delta = opt.e.deltaY
      let zoom = canvas.getZoom() * (0.999 ** delta)
      zoom = Math.max(0.2, Math.min(5, zoom))

      import("fabric").then((FabricModule) => {
        const fabric = FabricModule
        canvas.zoomToPoint(new fabric.Point(canvas.width / 2, canvas.height / 2), zoom)
      })
      opt.e.preventDefault()
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
    let isPanning = false, isZooming = false, lastPanX = 0, lastPanY = 0, lastDistance = 0

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
        isPanning = isZooming = true
        canvas.selection = false
        const touch1 = e.touches[0], touch2 = e.touches[1]
        lastPanX = (touch1.clientX + touch2.clientX) / 2
        lastPanY = (touch1.clientY + touch2.clientY) / 2
        lastDistance = getDistance(touch1, touch2)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && (isPanning || isZooming)) {
        e.preventDefault()
        const touch1 = e.touches[0], touch2 = e.touches[1]
        const centerX = (touch1.clientX + touch2.clientX) / 2
        const centerY = (touch1.clientY + touch2.clientY) / 2
        const currentDistance = getDistance(touch1, touch2)

        if (isPanning) {
          const vpt = canvas.viewportTransform
          vpt[4] += centerX - lastPanX
          vpt[5] += centerY - lastPanY
          canvas.requestRenderAll()
        }

        if (isZooming && Math.abs(currentDistance - lastDistance) > 5) {
          const zoom = canvas.getZoom() + (currentDistance - lastDistance) / 200
          const newZoom = Math.max(0.2, Math.min(5, zoom))
          import("fabric").then((FabricModule) => {
            const fabric = FabricModule
            const rect = canvasElement.getBoundingClientRect()
            canvas.zoomToPoint(new fabric.Point(centerX - rect.left, centerY - rect.top), newZoom)
          })
        }

        lastPanX = centerX
        lastPanY = centerY
        lastDistance = currentDistance
      }
    }

    const handleTouchEnd = () => {
      setTimeout(() => {
        isPanning = isZooming = false
        canvas.selection = true
      }, 100)
    }

    canvasElement.addEventListener("touchstart", handleTouchStart, { passive: false })
    canvasElement.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvasElement.addEventListener("touchend", handleTouchEnd, { passive: false })

    return () => {
      canvasElement.removeEventListener("touchstart", handleTouchStart)
      canvasElement.removeEventListener("touchmove", handleTouchMove)
      canvasElement.removeEventListener("touchend", handleTouchEnd)
    }
  }, [fabricCanvasRef])

  return { setupInteractions, setupKeyboardHandlers, setupPanAndZoom, setupTouchHandlers }
}