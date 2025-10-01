// @/app/dashboard/canvas/[id]/canvas-hooks.tsx

"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { documentService } from "@/services/documentService"
import type { Document } from "@/types/firebase"

type Tool = "select" | "square" | "circle" | "pan" | "pen"

export function useCanvasState() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<any>(null)
  const [activeTool, setActiveTool] = useState<Tool>("select")
  const [isDrawing, setIsDrawing] = useState(false)
  const [fabricLoaded, setFabricLoaded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [brushSize, setBrushSize] = useState(5) // Added brush size state
  const [brushColor, setBrushColor] = useState("#000000") // Added brush color state
  const [drawingMode, setDrawingMode] = useState<"draw" | "erase">("draw") // Added drawing mode state

  const activeToolRef = useRef<Tool>("select")
  const isDrawingRef = useRef(false)
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    activeToolRef.current = activeTool
  }, [activeTool])

  useEffect(() => {
    isDrawingRef.current = isDrawing
  }, [isDrawing])

  return {
    canvasRef,
    fabricCanvasRef,
    activeTool,
    setActiveTool,
    isDrawing,
    setIsDrawing,
    fabricLoaded,
    setFabricLoaded,
    isSaving,
    setIsSaving,
    lastSaved,
    setLastSaved,
    zoomLevel,
    setZoomLevel,
    activeToolRef,
    isDrawingRef,
    autoSaveIntervalRef,
    canUndo,
    canRedo,
    setCanUndo,
    setCanRedo,
    brushSize,
    setBrushSize,
    brushColor,
    setBrushColor,
    drawingMode,
    setDrawingMode,
  }
}

export function useCanvasOperations(
  fabricCanvasRef: React.MutableRefObject<any>,
  documentId: string,
  document: Document | null,
  canvasState: ReturnType<typeof useCanvasState>,
) {
  const {
    setIsSaving,
    setLastSaved,
    autoSaveIntervalRef,
    setActiveTool: setActiveToolState,
    setCanUndo,
    setCanRedo,
  } = canvasState

  const saveCanvasState = async (immediate = false) => {
    if (!fabricCanvasRef.current || !document || canvasState.isSaving) return

    try {
      setIsSaving(true)
      console.log("Saving canvas state...")
      const rawCanvasData = fabricCanvasRef.current.toJSON()

      // Clean the canvas data for Firestore but PRESERVE essential properties
      const cleanCanvasData = JSON.parse(JSON.stringify(rawCanvasData))

      // Keep canvas dimensions - essential for image positioning
      if (!cleanCanvasData.width) cleanCanvasData.width = 800
      if (!cleanCanvasData.height) cleanCanvasData.height = 600

      // Generate thumbnail only if immediate save (not auto-save)
      let thumbnail = document.content?.thumbnail
      if (immediate) {
        thumbnail = fabricCanvasRef.current.toDataURL({
          format: "png",
          quality: 0.6,
          multiplier: 0.2,
        })
      }

      await documentService.updateDocument(documentId, {
        content: {
          ...document.content,
          canvasData: cleanCanvasData,
          ...(thumbnail && { thumbnail }),
        },
      })

      const now = new Date()
      setLastSaved(now)
      console.log("Canvas saved successfully at", now.toLocaleTimeString())
    } catch (error) {
      console.error("Error saving canvas:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCanvasChange = () => {
    if (!fabricCanvasRef.current || !document || canvasState.isSaving) return

    if (autoSaveIntervalRef.current) {
      clearTimeout(autoSaveIntervalRef.current)
    }
    autoSaveIntervalRef.current = setTimeout(() => {
      if (!canvasState.isSaving) {
        saveCanvasState()
      }
    }, 2000)
  }

  const handleZoomIn = () => {
    if (!fabricCanvasRef.current) return
    const canvas = fabricCanvasRef.current
    const newZoom = Math.min(canvasState.zoomLevel * 1.2, 5)
    canvasState.setZoomLevel(newZoom)

    // Import fabric dynamically and zoom to center
    import("fabric").then((FabricModule) => {
      const fabric = FabricModule
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      canvas.zoomToPoint(new fabric.Point(centerX, centerY), newZoom)
    })
  }

  const handleZoomOut = () => {
    if (!fabricCanvasRef.current) return
    const canvas = fabricCanvasRef.current
    const newZoom = Math.max(canvasState.zoomLevel / 1.2, 0.2)
    canvasState.setZoomLevel(newZoom)

    // Import fabric dynamically and zoom to center
    import("fabric").then((FabricModule) => {
      const fabric = FabricModule
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      canvas.zoomToPoint(new fabric.Point(centerX, centerY), newZoom)
    })
  }

  const handleResetZoom = () => {
    if (!fabricCanvasRef.current) return
    canvasState.setZoomLevel(1)
    fabricCanvasRef.current.setZoom(1)
    fabricCanvasRef.current.setViewportTransform([1, 0, 0, 1, 0, 0])
    fabricCanvasRef.current.renderAll()
  }

  // Update setActiveTool to handle the new 'pen' tool
  const setActiveTool = (tool: Tool) => {
    canvasState.activeToolRef.current = tool
    setActiveToolState(tool)

    // Update canvas interaction based on tool
    if (fabricCanvasRef.current) {
      if (tool === "pan") {
        fabricCanvasRef.current.defaultCursor = "grab"
        fabricCanvasRef.current.hoverCursor = "grab"
        fabricCanvasRef.current.selection = false
        fabricCanvasRef.current.isDrawingMode = false // Disable drawing mode
        fabricCanvasRef.current.forEachObject((obj: any) => {
          obj.selectable = false
        })
      } else if (tool === "select") {
        fabricCanvasRef.current.defaultCursor = "default"
        fabricCanvasRef.current.hoverCursor = "move"
        fabricCanvasRef.current.selection = true
        fabricCanvasRef.current.isDrawingMode = false // Disable drawing mode
        fabricCanvasRef.current.forEachObject((obj: any) => {
          obj.selectable = true
        })
      } else if (tool === "pen") {
        fabricCanvasRef.current.defaultCursor = "crosshair"
        fabricCanvasRef.current.hoverCursor = "crosshair"
        fabricCanvasRef.current.selection = false
        fabricCanvasRef.current.isDrawingMode = true
        if (!fabricCanvasRef.current.freeDrawingBrush) {
          import("fabric").then((FabricModule) => {
            const fabric = FabricModule
            fabricCanvasRef.current.freeDrawingBrush = new fabric.PencilBrush(fabricCanvasRef.current)
          })
        }
        if (fabricCanvasRef.current.freeDrawingBrush) {
          fabricCanvasRef.current.freeDrawingBrush.width = canvasState.brushSize
          fabricCanvasRef.current.freeDrawingBrush.color = canvasState.brushColor
        }
        fabricCanvasRef.current.forEachObject((obj: any) => {
          obj.selectable = false
        })
      } else if (tool === "text") {
        fabricCanvasRef.current.defaultCursor = "text"
        fabricCanvasRef.current.hoverCursor = "text"
        fabricCanvasRef.current.selection = true
        fabricCanvasRef.current.isDrawingMode = false

        // Make all text objects selectable and editable
        fabricCanvasRef.current.forEachObject((obj: any) => {
          if (obj.type === "i-text" || obj.type === "textbox" || obj.type === "text") {
            obj.selectable = true
            obj.editable = true
            obj.lockMovementX = false
            obj.lockMovementY = false
            obj.hasControls = true
            obj.hasBorders = true
          } else {
            obj.selectable = false
          }
        })
      } else {
        fabricCanvasRef.current.defaultCursor = "crosshair"
        fabricCanvasRef.current.hoverCursor = "crosshair"
        fabricCanvasRef.current.selection = false
        fabricCanvasRef.current.isDrawingMode = false
        fabricCanvasRef.current.forEachObject((obj: any) => {
          obj.selectable = false
        })
      }
      fabricCanvasRef.current.renderAll()
    }
  }

  // Add undo/redo handlers
  const handleUndo = () => {
    if (!fabricCanvasRef.current) return
    fabricCanvasRef.current.undo()
    setCanUndo(fabricCanvasRef.current.getObjects().length > 0)
    setCanRedo(true) // Assuming redo is always possible after undo
  }

  const handleRedo = () => {
    if (!fabricCanvasRef.current) return
    fabricCanvasRef.current.redo()
    setCanRedo(fabricCanvasRef.current.getObjects().length > 0)
    setCanUndo(true) // Assuming undo is always possible after redo
  }

  // Add event listener for undo/redo state changes
  useEffect(() => {
    if (!fabricCanvasRef.current) return

    const updateUndoRedoState = () => {
      setCanUndo(fabricCanvasRef.current.canUndo())
      setCanRedo(fabricCanvasRef.current.canRedo())
    }

    fabricCanvasRef.current.on("object:added", updateUndoRedoState)
    fabricCanvasRef.current.on("object:removed", updateUndoRedoState)
    fabricCanvasRef.current.on("object:modified", updateUndoRedoState)

    // Initial state
    updateUndoRedoState()

    return () => {
      fabricCanvasRef.current.off("object:added", updateUndoRedoState)
      fabricCanvasRef.current.off("object:removed", updateUndoRedoState)
      fabricCanvasRef.current.off("object:modified", updateUndoRedoState)
    }
  }, [fabricCanvasRef, setCanUndo, setCanRedo])

  return {
    handleCanvasChange,
    saveCanvasState,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    setActiveTool,
    handleUndo,
    handleRedo,
  }
}
