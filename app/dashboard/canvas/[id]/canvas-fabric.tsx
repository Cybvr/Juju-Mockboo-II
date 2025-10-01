"use client"
import { useEffect, useState, useCallback, useRef } from "react"
import type { Document } from "@/types/firebase"
import { useCanvasCore } from "./hooks/use-canvas-core"
import { useImageOperations } from "./hooks/use-image-operations"
import { useSnapGrid } from "./hooks/use-snap-grid"
import { FloatingToolbar } from "./floating-toolbar"
import { DrawingToolbar } from "../common/drawing-toolbar"

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

    import("fabric").then((FabricModule) => {
      const fabric = FabricModule

      const canvas = new fabric.Canvas(canvasCore.canvasRef.current, {
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: "white",
      })

      canvasCore.fabricCanvasRef.current = canvas
      canvasCore.setFabricLoaded(true)

      // Setup drawing brush
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
      canvas.freeDrawingBrush.width = canvasCore.brushSize
      canvas.freeDrawingBrush.color = canvasCore.brushColor

      // Setup undo/redo ONCE
      canvasCore.setupUndoRedo(canvas)

      // Setup canvas events ONCE
      canvasCore.setupCanvasEvents(canvas, canvasCore.handleCanvasChange, onSelectedImagesChange)

      // Setup resize handler ONCE
      const cleanupResize = canvasCore.setupResizeHandler(canvas)

      // Load existing canvas data
      if (documentData.content?.canvasData && Object.keys(documentData.content.canvasData).length > 0) {
        canvas.loadFromJSON(documentData.content.canvasData, () => {
          canvas.renderAll()
        })
      }

      return () => {
        cleanupResize()
        canvas.dispose()
      }
    })
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