"use client"
import { useEffect, useState, useCallback } from "react"
import type { Document } from "@/types/firebase"
import { useInteractionHook } from "./hooks/use-interaction-hook"
import { useCanvasCore } from "./hooks/use-canvas-core"
import { useImageOperations } from "./hooks/use-image-operations"
import { FloatingToolbar } from "./floating-toolbar"
import { DrawingToolbar } from "../common/drawing-toolbar" // Added drawing toolbar import

export function useFabricCanvas(
  documentData: Document | null,
  documentId: string,
  onSelectedImagesChange?: (images: string[]) => void,
) {
  const canvasCore = useCanvasCore(documentId, documentData)
  const {
    canvasRef,
    fabricCanvasRef,
    setFabricLoaded,
    activeToolRef,
    isDrawingRef,
    setIsDrawing,
    brushSize,
    brushColor,
    drawingMode,
    setBrushSize,
    setBrushColor,
    setDrawingMode,
    selectedObjects,
    setSelectedObjects,
    setupUndoRedo,
    setupCanvasEvents,
    setupResizeHandler,
    autoSaveIntervalRef,
    saveCanvasState,
  } = canvasCore

  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false)

  const imageOps = useImageOperations({
    fabricCanvasRef,
    handleCanvasChange: canvasCore.handleCanvasChange,
    userId: canvasCore.userId,
  })

  const interactionHook = useInteractionHook({
    fabricCanvasRef,
    handleCanvasChange: canvasCore.handleCanvasChange,
    activeToolRef,
    isDrawingRef,
    setIsDrawing,
    setActiveTool: canvasCore.setActiveTool,
    brushSize,
    brushColor,
    drawingMode,
  })

  const snapGrid = useSnapGrid({
    fabricCanvasRef,
    gridSize: 20,
    enabled: true,
  })

  const addImageToCanvas = useCallback(
    (imageUrl: string, replaceObjects?: any) => {
      return imageOps.addImageToCanvas(imageUrl, { replaceObjects })
    },
    [imageOps],
  )

  const handleVariations = useCallback(async () => {
    if (isGeneratingVariations) return

    setIsGeneratingVariations(true)
    try {
      await imageOps.generateImageVariations()
    } catch (error) {
      console.error("Error generating variations:", error)
    } finally {
      setIsGeneratingVariations(false)
    }
  }, [imageOps, isGeneratingVariations])

  const handleStyleApply = useCallback(
    async (selectedStyle: string) => {
      try {
        const { getStylePrompt } = require("../common/visual-restyle-panel")
        const stylePrompt = getStylePrompt(selectedStyle)
        if (stylePrompt) {
          await imageOps.applyStyleToImage(stylePrompt)
        }
      } catch (error) {
        console.error("Error applying style:", error)
      }
    },
    [imageOps],
  )

  useEffect(() => {
    if (!canvasRef.current || !documentData) return
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose()
      fabricCanvasRef.current = null
    }

    import("fabric")
      .then((FabricModule) => {
        const fabric = FabricModule
        setFabricLoaded(true)

        if (canvasRef.current.__fabric) {
          canvasRef.current.__fabric = null
        }
        if (!canvasRef.current) return

        const canvas = new fabric.Canvas(canvasRef.current, {
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundColor: "white",
          preserveObjectStacking: true,
          enableRetinaScaling: false,
          renderOnAddRemove: false,
        })

        // Ensure canvas fills viewport immediately
        canvas.setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        })
        fabricCanvasRef.current = canvas

        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
        canvas.freeDrawingBrush.width = brushSize
        canvas.freeDrawingBrush.color = brushColor

        // Setup undo/redo
        const { saveState } = setupUndoRedo(canvas)

        // Setup canvas events
        setupCanvasEvents(canvas, canvasCore.handleCanvasChange, setSelectedObjects, onSelectedImagesChange, saveState)

        // Setup interaction handlers
        const cleanupInteractions = interactionHook.setupInteractions()
        const cleanupKeyboard = interactionHook.setupKeyboardHandlers()
        const cleanupPanZoom = interactionHook.setupPanAndZoom()
        const cleanupTouch = interactionHook.setupTouchHandlers()

        // Setup resize handler
        const cleanupResize = setupResizeHandler(canvas)

        // Setup drag and drop using centralized image operations
        const cleanupDragDrop = imageOps.setupDragAndDrop()

        // Setup canvas actions using centralized image operations
        canvas._duplicateHandler = imageOps.duplicateSelectedImages
        canvas._downloadHandler = imageOps.downloadSelectedImages
        canvas._variationsHandler = imageOps.generateImageVariations

        // Load existing canvas data
        if (documentData.content?.canvasData) {
          try {
            canvas.loadFromJSON(documentData.content.canvasData, () => {
              canvas.renderAll()
            })
          } catch (error) {
            console.error("Error loading canvas data:", error)
            canvas.renderAll()
            setTimeout(() => canvas.renderAll(), 100)
          }
        } else {
          canvas.renderAll()
          setTimeout(() => canvas.renderAll(), 100)
        }

        return () => {
          cleanupResize()
          if (cleanupInteractions) cleanupInteractions()
          if (cleanupKeyboard) cleanupKeyboard()
          if (cleanupPanZoom) cleanupPanZoom()
          if (cleanupTouch) cleanupTouch()
          cleanupDragDrop()
          canvas.dispose()
        }
      })
      .catch((error) => {
        console.error("Error initializing fabric canvas:", error)
      })
  }, [documentData])

  useEffect(() => {
    if (canvasCore.fabricLoaded && documentData) {
      autoSaveIntervalRef.current = setInterval(saveCanvasState, 60000)
      return () => {
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current)
        }
      }
    }
  }, [canvasCore.fabricLoaded, documentData])

  const FloatingToolbarComponent = () => (
    <>
      <FloatingToolbar
        selectedObjects={selectedObjects}
        fabricCanvas={fabricCanvasRef.current}
        onCopy={() => imageOps.copyImageToClipboard()}
        onDuplicate={() => imageOps.duplicateSelectedImages()}
        onDownload={() => imageOps.downloadSelectedImages()}
        onRegenerate={handleVariations}
        onVariations={handleVariations}
        onStyleApply={handleStyleApply}
        onVideo={() => {}}
        onUpscale={() => {}}
        isGeneratingVariations={isGeneratingVariations}
      />
      <DrawingToolbar
        isVisible={canvasCore.activeTool === "pen"}
        onBrushSizeChange={setBrushSize}
        onColorChange={setBrushColor}
        onModeChange={setDrawingMode}
        brushSize={brushSize}
        currentColor={brushColor}
        currentMode={drawingMode}
      />
    </>
  )

  return {
    FloatingToolbarComponent,
    addImageToCanvas,
    snapGrid,
  }
}