"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { documentService } from "@/services/documentService"
import type { Document } from "@/types/firebase"
import type { Canvas } from "fabric"

type Tool = "select" | "square" | "circle" | "pan" | "pen" | "text" | "sticky-note"

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
  const [selectedStickyNote, setSelectedStickyNote] = useState<any>(null)
  const [selectedTextObject, setSelectedTextObject] = useState<any>(null)

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
    console.log("🔧 Setting up canvas events and interactions...")

    canvas.on("object:added", () => handleCanvasChange())
    canvas.on("object:modified", () => handleCanvasChange())
    canvas.on("object:removed", () => handleCanvasChange())

    // Text editing events - CRITICAL for saving text changes
    canvas.on("text:changed", () => handleCanvasChange())
    canvas.on("text:editing:exited", () => handleCanvasChange())

    const updateSelection = (selected: any[]) => {
      // Ensure sticky note properties are preserved during selection
      selected.forEach((obj: any) => {
        if (obj.type === "group" && obj.stickyNoteGroup) {
          // Preserve sticky note properties
          Object.defineProperty(obj, 'stickyNoteGroup', {
            value: true,
            writable: true,
            enumerable: true,
            configurable: false
          })
        }
      })
      
      setSelectedObjects(selected)

      // Track specific object types
      const stickyNote = selected.find((obj: any) => obj.type === "group" && obj.stickyNoteGroup)
      const textObject = selected.find((obj: any) => obj.isTextObject || obj.type === 'textbox' || obj.type === 'i-text')

      setSelectedStickyNote(stickyNote || null)
      setSelectedTextObject(textObject || null)
      
      if (onSelectedImagesChange) {
        const selectedImages = selected
          .filter((obj: any) => obj && obj.type === "image")
          .map((obj: any) => obj.getSrc ? obj.getSrc() : obj.src)
        onSelectedImagesChange(selectedImages)
      }
    }

    canvas.on("selection:created", (e: any) => {
      const selected = (e.selected || (e.target ? [e.target] : [])).filter((obj: any) => obj != null)
      updateSelection(selected)
    })

    canvas.on("selection:updated", (e: any) => {
      const selected = (e.selected || canvas.getActiveObjects()).filter((obj: any) => obj != null)
      updateSelection(selected)
    })

    canvas.on("selection:cleared", () => {
      setSelectedObjects([])
      setSelectedStickyNote(null)
      setSelectedTextObject(null)
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
      const rawCanvasData = fabricCanvasRef.current.toJSON()

      // Debug logs for text objects
      console.log("🔍 Saving canvas state - Raw data:", rawCanvasData)
      const textObjects = rawCanvasData.objects?.filter(obj => obj.type === 'i-text' || obj.type === 'textbox' || obj.type === 'text')
      console.log("📝 Text objects found:", textObjects)
      textObjects?.forEach((textObj, index) => {
        console.log(`📝 Text ${index + 1}:`, {
          text: textObj.text,
          type: textObj.type,
          fontSize: textObj.fontSize,
          fontFamily: textObj.fontFamily
        })
      })

      // Clean the canvas data for Firestore
      const cleanCanvasData = JSON.parse(JSON.stringify(rawCanvasData))

      // Generate thumbnail
      const thumbnail = fabricCanvasRef.current.toDataURL({
        format: "png",
        quality: 0.6,
        multiplier: 0.2,
      })

      console.log("💾 Saving to Firebase with data:", {
        canvasData: cleanCanvasData,
        thumbnail: thumbnail ? "Generated" : "None",
        textObjectsCount: cleanCanvasData.objects?.filter(obj => obj.type === 'i-text' || obj.type === 'textbox' || obj.type === 'text').length
      })

      await documentService.updateDocument(documentId, {
        content: {
          ...document.content,
          canvasData: cleanCanvasData,
          thumbnail: thumbnail,
        },
      })

      console.log("✅ Canvas saved to Firebase successfully")
      const now = new Date()
      setLastSaved(now)
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
    const newZoom = Math.min(zoomLevel * 1.5, 10)
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
    const newZoom = Math.max(zoomLevel / 1.5, 0.1)
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
      } else if (tool === "text") {
        canvas.defaultCursor = "text"
        canvas.hoverCursor = "text"
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


  const updateSelectedObjects = useCallback((canvas: any, onSelectedImagesChange?: (images: string[]) => void) => {
    const activeObjects = canvas.getActiveObjects()

    // Ensure sticky note properties are properly preserved
    activeObjects.forEach((obj: any) => {
      if (obj.type === "group" && obj.stickyNoteGroup) {
        obj.stickyNoteGroup = true
      }
    })

    setSelectedObjects(activeObjects)

    if (onSelectedImagesChange) {
      const imageUrls = activeObjects
        .filter((obj: any) => obj.type === "image" && obj.src)
        .map((obj: any) => obj.src)
      onSelectedImagesChange(imageUrls)
    }
  }, [])


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

  // Placeholder for delete action
  const handleDelete = useCallback(() => {
    if (!fabricCanvasRef.current) return
    const canvas = fabricCanvasRef.current
    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length > 0) {
      activeObjects.forEach((obj: any) => {
        canvas.remove(obj)
      })
      canvas.discardActiveObject()
      canvas.renderAll()
      handleCanvasChange()
    }
  }, [handleCanvasChange])

  // Placeholder for copy action
  const handleCopy = useCallback(() => {
    if (!fabricCanvasRef.current) return
    const canvas = fabricCanvasRef.current
    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length > 0) {
      // Fabric.js has a built-in copy/paste mechanism if you can manage clipboard access
      // For simplicity here, we'll just clone and slightly offset
      activeObjects.forEach((obj: any) => {
        obj.clone((cloned: any) => {
          cloned.set({
            left: cloned.left + 10,
            top: cloned.top + 10,
          })
          canvas.add(cloned)
          canvas.setActiveObject(cloned)
        })
      })
      canvas.renderAll()
      handleCanvasChange()
    }
  }, [handleCanvasChange])


  const handleUndo = useCallback(() => {
    if (!fabricCanvasRef.current || !fabricCanvasRef.current.undo) return
    fabricCanvasRef.current.undo()
  }, [])

  const handleRedo = useCallback(() => {
    if (!fabricCanvasRef.current || !fabricCanvasRef.current.redo) return
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
    canvasRef,
    fabricCanvasRef,
    fabricLoaded,
    setFabricLoaded,
    activeTool,
    setActiveTool,
    brushSize,
    setBrushSize,
    brushColor,
    setBrushColor,
    drawingMode,
    setDrawingMode,
    selectedObjects,
    selectedStickyNote,
    selectedTextObject,
    zoomLevel,
    lastSaved,
    isSaving,
    isDrawingRef,
    setIsDrawing,
    activeToolRef,
    handleCanvasChange,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    setupUndoRedo,
    setupCanvasEvents,
    setupResizeHandler,
    saveCanvasState,
    handleDuplicate,
    handleDelete,
    handleCopy,
    handleUndo: handleUndo,
    handleRedo: handleRedo,
    canUndo,
    canRedo,
  }
}