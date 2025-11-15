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

  const [selectedTextObject, setSelectedTextObject] = useState<any>(null)
  const activeToolRef = useRef<Tool>("select")
  const isDrawingRef = useRef(false)
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null)
  // Undo/Redo setup
  const undoStackRef = useRef<string[]>([])
  const redoStackRef = useRef<string[]>([])
  const isUndoRedoingRef = useRef(false)

  const saveState = useCallback((canvas: Canvas) => {
    if (isUndoRedoingRef.current) return

    const state = JSON.stringify(canvas.toJSON(['name', 'isTextObject', 'text', 'stickyColor', 'backgroundColor']))
    undoStackRef.current.push(state)
    redoStackRef.current = []

    setCanUndo(undoStackRef.current.length > 1)
    setCanRedo(false)

    if (undoStackRef.current.length > 50) {
      undoStackRef.current.shift()
    }
  }, [])

  const setupUndoRedo = useCallback((canvas: Canvas) => {
    canvas.undo = () => {
      if (undoStackRef.current.length <= 1) return

      isUndoRedoingRef.current = true
      const currentState = undoStackRef.current.pop()
      if (currentState) redoStackRef.current.push(currentState)

      const previousState = undoStackRef.current[undoStackRef.current.length - 1]

      canvas.loadFromJSON(previousState, () => {
        canvas.requestRenderAll()
        setCanUndo(undoStackRef.current.length > 1)
        setCanRedo(redoStackRef.current.length > 0)
        isUndoRedoingRef.current = false
      })
    }

    canvas.redo = () => {
      if (redoStackRef.current.length === 0) return

      isUndoRedoingRef.current = true
      const nextState = redoStackRef.current.pop()
      if (nextState) {
        undoStackRef.current.push(nextState)
        canvas.loadFromJSON(nextState, () => {
          canvas.requestRenderAll()
          setCanUndo(undoStackRef.current.length > 1)
          setCanRedo(redoStackRef.current.length > 0)
          isUndoRedoingRef.current = false
        })
      }
    }

    // Save initial state
    saveState(canvas)

    return { saveState: () => saveState(canvas) }
  }, [saveState])
  // Canvas events setup
  const setupCanvasEvents = useCallback((canvas: Canvas, handleCanvasChange: () => void, onSelectedImagesChange?: (images: string[]) => void) => {
    canvas.on("object:added", () => handleCanvasChange())
    canvas.on("object:modified", () => handleCanvasChange())
    canvas.on("object:removed", () => handleCanvasChange())
    // Text editing events - CRITICAL for saving text changes
    canvas.on("text:changed", () => handleCanvasChange())
    canvas.on("text:editing:exited", () => handleCanvasChange())
    const updateSelection = (selected: any[]) => {
      setSelectedObjects(selected)
      // Track text objects (including sticky notes)
      const textObject = selected.find((obj: any) => obj.isTextObject || obj.type === 'textbox' || obj.type === 'i-text')
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
      const rawCanvasData = fabricCanvasRef.current.toJSON(['name', 'isTextObject', 'text', 'stickyColor', 'backgroundColor', 'stickyNoteGroup'])
      
      // ✅ Recursive extractor for text + sticky notes
      const extractTextObjects = (objs: any[]): any[] => {
        if (!objs) return []
        return objs.flatMap((obj: any) => {
          if (!obj) return []
          if (
            obj.type === 'textbox' || 
            obj.type === 'i-text' || 
            obj.isTextObject ||
            (obj.backgroundColor && obj.stickyColor)
          ) {
            return [obj]
          }
          if (obj.type === 'group' && obj.objects?.length) {
            const inner = extractTextObjects(obj.objects)
            // Mark parent group as sticky if its children are sticky
            if (inner.some(o => o.stickyColor)) obj.stickyNoteGroup = true
            return [obj, ...inner]
          }
          return []
        })
      }

      const textObjects = extractTextObjects(rawCanvasData.objects || [])
      console.log("📝 ALL TEXT/STICKY OBJECTS FOUND:", textObjects.length)
      textObjects.forEach((obj: any, index: number) => {
        console.log(`📝 Object ${index + 1}:`, {
          type: obj.type,
          text: obj.text,
          sticky: !!obj.stickyColor,
          stickyNoteGroup: obj.stickyNoteGroup,
        })
      })

      const cleanCanvasData = JSON.parse(JSON.stringify(rawCanvasData))

      const thumbnail = fabricCanvasRef.current.toDataURL({
        format: "png",
        quality: 0.6,
        multiplier: 0.2,
      })

      await documentService.updateDocument(documentId, {
        content: {
          ...document.content,
          canvasData: cleanCanvasData,
          thumbnail,
        },
      })

      console.log("✅ Canvas (with groups/sticky notes) saved to Firebase successfully")
      setLastSaved(new Date())
    } catch (error) {
      console.error("Error saving canvas:", error)
    } finally {
      setIsSaving(false)
    }
  }, [documentId, document, isSaving])
  const handleCanvasChange = useCallback(() => {
    if (!fabricCanvasRef.current || !document || isSaving) return

    // Save to undo/redo stack
    if (!isUndoRedoingRef.current) {
      saveState(fabricCanvasRef.current)
    }

    if (autoSaveIntervalRef.current) {
      clearTimeout(autoSaveIntervalRef.current)
    }

    autoSaveIntervalRef.current = setTimeout(() => {
      if (!isSaving) {
        saveCanvasState()
      }
    }, 2000)
  }, [saveCanvasState, document, isSaving, saveState])
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
  const handleDelete = useCallback(() => {
    if (!fabricCanvasRef.current) return
    const canvas = fabricCanvasRef.current
    const active = canvas.getActiveObject()
    if (active) {
      if (active.type === "activeSelection") {
        active.getObjects().forEach((o: any) => canvas.remove(o))
      } else {
        canvas.remove(active)
      }
      canvas.discardActiveObject()
      canvas.requestRenderAll()
      handleCanvasChange()
    }
  }, [handleCanvasChange])
  const handleCopy = useCallback(() => {
    if (!fabricCanvasRef.current) return
    const canvas = fabricCanvasRef.current
    const activeObject = canvas.getActiveObject()
    if (!activeObject) return
    activeObject.clone().then((cloned: any) => {
      window.copiedObjects = cloned
    })
  }, [])
  const handlePaste = useCallback(() => {
    if (!fabricCanvasRef.current || !window.copiedObjects) return
    const canvas = fabricCanvasRef.current
    window.copiedObjects.clone().then((clonedObj: any) => {
      canvas.discardActiveObject()
      clonedObj.set({
        left: clonedObj.left + 10,
        top: clonedObj.top + 10,
        evented: true,
      })
      // Preserve custom properties
      if (window.copiedObjects.name?.startsWith('sticky-note-')) {
        clonedObj.name = window.copiedObjects.name
      }
      if (window.copiedObjects.isTextObject) {
        clonedObj.isTextObject = true
      }
      import("fabric").then(({ ActiveSelection }) => {
        if (clonedObj instanceof ActiveSelection) {
          clonedObj.canvas = canvas
          clonedObj.forEachObject((obj: any) => {
            canvas.add(obj)
          })
          clonedObj.setCoords()
        } else {
          canvas.add(clonedObj)
        }
        window.copiedObjects.top += 10
        window.copiedObjects.left += 10
        canvas.setActiveObject(clonedObj)
        canvas.requestRenderAll()
        handleCanvasChange()
      })
    })
  }, [handleCanvasChange])
  const handleUndo = useCallback(() => {
    if (!fabricCanvasRef.current || !fabricCanvasRef.current.undo || !canUndo) return
    fabricCanvasRef.current.undo()
  }, [canUndo])

  const handleRedo = useCallback(() => {
    if (!fabricCanvasRef.current || !fabricCanvasRef.current.redo || !canRedo) return
    fabricCanvasRef.current.redo()
  }, [canRedo])
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
    selectedObjects,

    activeTool,
    setActiveTool,
    activeToolRef,
    brushSize,
    setBrushSize,
    brushColor,
    setBrushColor,
    drawingMode,
    setDrawingMode,
    isDrawing,
    setIsDrawing,
    isDrawingRef,
    zoomLevel,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleCanvasChange,
    saveCanvasState,
    isSaving,
    lastSaved,
    setupUndoRedo,
    setupCanvasEvents,
    setupResizeHandler,
    handleDuplicate,
    handleDelete,
    handleCopy,
    handlePaste,
    handleUndo: handleUndo,
    handleRedo: handleRedo,
    canUndo,
    canRedo,
    selectedTextObject,
  }
}