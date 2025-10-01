
"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { documentService } from "@/services/documentService"
import type { Document } from "@/types/firebase"
import type { Canvas } from "fabric"

type Tool = "select" | "square" | "circle" | "pan" | "pen"

export function useCanvasCore(documentId: string, document: Document | null) {
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
  const [brushSize, setBrushSize] = useState(5)
  const [brushColor, setBrushColor] = useState("#000000")
  const [drawingMode, setDrawingMode] = useState<"draw" | "erase">("draw")
  const [selectedObjects, setSelectedObjects] = useState<any[]>([])

  const activeToolRef = useRef<Tool>("select")
  const isDrawingRef = useRef(false)
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Undo/Redo setup
  const setupUndoRedo = useCallback((canvas: Canvas) => {
    let undoStack: string[] = []
    let redoStack: string[] = []
    let isUndoRedoing = false

    const saveState = () => {
      if (isUndoRedoing) return
      const state = JSON.stringify(canvas.toJSON())
      undoStack.push(state)
      redoStack = []
      setCanUndo(undoStack.length > 1)
      setCanRedo(false)
      if (undoStack.length > 50) {
        undoStack.shift()
      }
    }

    canvas.undo = () => {
      if (undoStack.length <= 1) return
      isUndoRedoing = true
      const currentState = undoStack.pop()
      if (currentState) redoStack.push(currentState)
      const previousState = undoStack[undoStack.length - 1]
      canvas.clear()
      canvas.loadFromJSON(previousState, () => {
        canvas.requestRenderAll()
        setCanUndo(undoStack.length > 1)
        setCanRedo(redoStack.length > 0)
        setTimeout(() => {
          isUndoRedoing = false
        }, 0)
      })
    }

    canvas.redo = () => {
      if (redoStack.length === 0) return
      isUndoRedoing = true
      const nextState = redoStack.pop()
      if (nextState) {
        undoStack.push(nextState)
        canvas.clear()
        canvas.loadFromJSON(nextState, () => {
          canvas.requestRenderAll()
          setCanUndo(undoStack.length > 1)
          setCanRedo(redoStack.length > 0)
          setTimeout(() => {
            isUndoRedoing = false
          }, 0)
        })
      }
    }

    canvas.canUndo = () => undoStack.length > 1
    canvas.canRedo = () => redoStack.length > 0

    saveState()
    return { saveState }
  }, [])

  // Canvas events setup
  const setupCanvasEvents = useCallback((canvas: Canvas, handleCanvasChange: () => void, onSelectedImagesChange?: (images: string[]) => void) => {
    canvas.on("object:added", () => handleCanvasChange())
    canvas.on("object:modified", () => handleCanvasChange())
    canvas.on("object:removed", () => handleCanvasChange())

    canvas.on("selection:created", (e: any) => {
      const selected = e.selected || e.target ? [e.target] : []
      setSelectedObjects(selected)
      if (onSelectedImagesChange) {
        const selectedImages = selected
          .filter((obj: any) => obj.type === "image")
          .map((obj: any) => obj.getSrc ? obj.getSrc() : obj.src)
        onSelectedImagesChange(selectedImages)
      }
    })

    canvas.on("selection:updated", (e: any) => {
      const selected = e.selected || canvas.getActiveObjects()
      setSelectedObjects(selected)
      if (onSelectedImagesChange) {
        const selectedImages = selected
          .filter((obj: any) => obj.type === "image")
          .map((obj: any) => obj.getSrc ? obj.getSrc() : obj.src)
        onSelectedImagesChange(selectedImages)
      }
    })

    canvas.on("selection:cleared", () => {
      setSelectedObjects([])
      if (onSelectedImagesChange) {
        onSelectedImagesChange([])
      }
    })
  }, [])

  // Resize handler
  const setupResizeHandler = useCallback((canvas: Canvas) => {
    const handleResize = () => {
      if (canvas && canvas.getElement()) {
        canvas.setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        })
        canvas.renderAll()
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Canvas operations
  const saveCanvasState = useCallback(async (immediate = false) => {
    if (!fabricCanvasRef.current || !document || isSaving) return

    try {
      setIsSaving(true)
      const canvasData = fabricCanvasRef.current.toJSON()

      await documentService.updateDocument(documentId, {
        content: {
          canvasData: canvasData,
          canvasVersion: "1.0"
        },
      })

      setLastSaved(new Date())
    } catch (error) {
      console.error("Error saving canvas:", error)
    } finally {
      setIsSaving(false)
    }
  }, [documentId, document, isSaving])

  const handleCanvasChange = useCallback(() => {
    if (!fabricCanvasRef.current || !document || isSaving) return

    if (autoSaveIntervalRef.current) {
      clearTimeout(autoSaveIntervalRef.current)
    }
    autoSaveIntervalRef.current = setTimeout(() => {
      if (!isSaving) {
        saveCanvasState()
      }
    }, 2000)
  }, [saveCanvasState, document, isSaving])

  // Zoom operations
  const handleZoomIn = useCallback(() => {
    if (!fabricCanvasRef.current) return
    const canvas = fabricCanvasRef.current
    const newZoom = Math.min(zoomLevel * 1.2, 5)
    setZoomLevel(newZoom)

    import("fabric").then((FabricModule) => {
      const fabric = FabricModule
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      canvas.zoomToPoint(new fabric.Point(centerX, centerY), newZoom)
    })
  }, [zoomLevel])

  const handleZoomOut = useCallback(() => {
    if (!fabricCanvasRef.current) return
    const canvas = fabricCanvasRef.current
    const newZoom = Math.max(zoomLevel / 1.2, 0.2)
    setZoomLevel(newZoom)

    import("fabric").then((FabricModule) => {
      const fabric = FabricModule
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      canvas.zoomToPoint(new fabric.Point(centerX, centerY), newZoom)
    })
  }, [zoomLevel])

  const handleResetZoom = useCallback(() => {
    if (!fabricCanvasRef.current) return
    setZoomLevel(1)
    fabricCanvasRef.current.setZoom(1)
    fabricCanvasRef.current.setViewportTransform([1, 0, 0, 1, 0, 0])
    fabricCanvasRef.current.renderAll()
  }, [])

  // Tool operations
  const setActiveToolState = useCallback((tool: Tool) => {
    activeToolRef.current = tool
    setActiveTool(tool)

    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current
      
      // Reset canvas state
      canvas.isDrawingMode = false
      canvas.selection = true
      canvas.defaultCursor = "default"
      canvas.hoverCursor = "move"
      
      // Make all objects selectable by default
      canvas.forEachObject((obj: any) => {
        obj.selectable = true
      })

      if (tool === "pen") {
        canvas.isDrawingMode = true
        canvas.selection = false
        canvas.defaultCursor = "crosshair"
        canvas.hoverCursor = "crosshair"
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.width = brushSize
          canvas.freeDrawingBrush.color = brushColor
        }
        canvas.forEachObject((obj: any) => {
          obj.selectable = false
        })
      } else if (tool === "pan") {
        canvas.defaultCursor = "grab"
        canvas.hoverCursor = "grab"
        canvas.selection = false
        canvas.forEachObject((obj: any) => {
          obj.selectable = false
        })
      } else if (tool !== "select") {
        canvas.defaultCursor = "crosshair"
        canvas.hoverCursor = "crosshair"
        canvas.selection = false
        canvas.forEachObject((obj: any) => {
          obj.selectable = false
        })
      }
      
      canvas.renderAll()
    }
  }, [brushSize, brushColor])

  // Canvas actions
  const handleDuplicate = useCallback(() => {
    if (!fabricCanvasRef.current) return
    const canvas = fabricCanvasRef.current
    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length === 0) return

    activeObjects.forEach((obj: any) => {
      obj.clone((cloned: any) => {
        cloned.set({
          left: cloned.left + 20,
          top: cloned.top + 20,
        })
        canvas.add(cloned)
        canvas.setActiveObject(cloned)
        canvas.renderAll()
        handleCanvasChange()
      })
    })
  }, [handleCanvasChange])

  const handleUndo = useCallback(() => {
    if (!fabricCanvasRef.current) return
    fabricCanvasRef.current.undo()
  }, [])

  const handleRedo = useCallback(() => {
    if (!fabricCanvasRef.current) return
    fabricCanvasRef.current.redo()
  }, [])

  // Update refs
  useEffect(() => {
    activeToolRef.current = activeTool
  }, [activeTool])

  useEffect(() => {
    isDrawingRef.current = isDrawing
  }, [isDrawing])

  return {
    // State
    canvasRef,
    fabricCanvasRef,
    activeTool,
    isDrawing,
    fabricLoaded,
    setFabricLoaded,
    isSaving,
    lastSaved,
    zoomLevel,
    canUndo,
    canRedo,
    brushSize,
    setBrushSize,
    brushColor,
    setBrushColor,
    drawingMode,
    setDrawingMode,
    selectedObjects,
    
    // Refs
    activeToolRef,
    isDrawingRef,
    autoSaveIntervalRef,
    
    // State setters
    setIsDrawing,
    setCanUndo,
    setCanRedo,
    setSelectedObjects,
    
    // Operations
    saveCanvasState,
    handleCanvasChange,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    setActiveTool: setActiveToolState,
    handleDuplicate,
    handleUndo,
    handleRedo,
    
    // Setup functions
    setupUndoRedo,
    setupCanvasEvents,
    setupResizeHandler
  }
}
