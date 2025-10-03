"use client"
import { useEffect, useState, useCallback, useRef } from "react"
import type { Document } from "@/types/firebase"
import { useCanvasCore } from "./hooks/use-canvas-core"
import { useImageOperations } from "./hooks/use-image-operations"
import { useSnapGrid } from "./hooks/use-snap-grid"
import { FloatingToolbar } from "./toolbars/image-toolbar"
import { DrawingToolbar } from "./toolbars/drawing-toolbar"
import { StickyNoteToolbar } from "./toolbars/sticky-note-toolbar"

export function useFabricCanvas(
  documentData: Document | null,
  documentId: string,
  onSelectedImagesChange?: (images: string[]) => void,
) {
  const canvasCore = useCanvasCore(documentId, documentData)
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false)

  const imageOps = useImageOperations({
    fabricCanvasRef: canvasCore.fabricCanvasRef,
    handleCanvasChange: canvasCore.handleCanvasChange,
    userId: undefined,
  })

  const snapGrid = useSnapGrid({
    fabricCanvasRef: canvasCore.fabricCanvasRef,
    gridSize: 20,
    enabled: true
  })

  // SINGLE canvas initialization
  useEffect(() => {
    if (!canvasCore.canvasRef.current || !documentData || canvasCore.fabricLoaded) return

    // Wait for DOM to be fully ready and window to be properly sized
    const initCanvas = () => {
      import("fabric").then((FabricModule) => {
        const fabric = FabricModule

        const canvas = new fabric.Canvas(canvasCore.canvasRef.current, {
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundColor: "white",
          allowTouchScrolling: false,
          stopContextMenu: true,
        })

        canvasCore.fabricCanvasRef.current = canvas
        canvasCore.setFabricLoaded(true)

        // Force immediate render
        canvas.renderAll()

        // Setup drawing brush
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
        canvas.freeDrawingBrush.width = canvasCore.brushSize
        canvas.freeDrawingBrush.color = canvasCore.brushColor

        // Setup undo/redo ONCE
        const undoRedoManager = canvasCore.setupUndoRedo(canvas)
        
        // Make sure undo/redo methods are accessible
        if (undoRedoManager && undoRedoManager.saveState) {
          // Save initial state
          undoRedoManager.saveState()
        }

        // Setup canvas events ONCE
        canvasCore.setupCanvasEvents(canvas, canvasCore.handleCanvasChange, onSelectedImagesChange)

        // Setup resize handler ONCE
        const cleanupResize = canvasCore.setupResizeHandler(canvas)

        // Load existing canvas data
        if (documentData.content?.canvasData && Object.keys(documentData.content.canvasData).length > 0) {
          canvas.loadFromJSON(documentData.content.canvasData, () => {
            canvas.renderAll()
          })
        } else {
          // Force render even if no data to load
          canvas.renderAll()
        }

        // Force one more render after everything is set up
        setTimeout(() => {
          if (canvas) {
            canvas.renderAll()
          }
        }, 10)

        return () => {
          cleanupResize()
          canvas.dispose()
        }
      })
    }

    // Use a small timeout to ensure everything is loaded
    const timer = setTimeout(initCanvas, 100)

    return () => clearTimeout(timer)
  }, [documentData, canvasCore.fabricLoaded])

  // Auto-save interval
  useEffect(() => {
    if (canvasCore.fabricLoaded && documentData) {
      const interval = setInterval(canvasCore.saveCanvasState, 60000)
      return () => clearInterval(interval)
    }
  }, [canvasCore.fabricLoaded, documentData])

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

  const FloatingToolbarComponent = () => (
    <>
      <FloatingToolbar
        selectedObjects={canvasCore.selectedObjects}
        fabricCanvas={canvasCore.fabricCanvasRef.current}
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
        onBrushSizeChange={canvasCore.setBrushSize}
        onColorChange={canvasCore.setBrushColor}
        onModeChange={canvasCore.setDrawingMode}
        brushSize={canvasCore.brushSize}
        currentColor={canvasCore.brushColor}
        currentMode={canvasCore.drawingMode}
      />
      
    </>
  )

  return {
    FloatingToolbarComponent,
    addImageToCanvas,
    snapGrid,
    canvasRef: canvasCore.canvasRef,
    canvasCore,
  }
}