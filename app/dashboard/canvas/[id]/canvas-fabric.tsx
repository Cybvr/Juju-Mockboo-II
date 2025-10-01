"use client"
import { useEffect, useState, useCallback } from "react"
import type { Document } from "@/types/firebase"
import { useInteractionHook } from "./hooks/use-interaction-hook"
import { useCanvasCore } from "./hooks/use-canvas-core"
import { useImageOperations } from "./hooks/use-image-operations"
import { useSnapGrid } from "./hooks/use-snap-grid"
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

  // Wire up snap grid functionality
  const snapGrid = useSnapGrid({
    fabricCanvasRef,
    gridSize: 20,
    enabled: true
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
    
    // Dispose existing canvas
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose()
      fabricCanvasRef.current = null
    }

    import("fabric").then((FabricModule) => {
      const fabric = FabricModule
      
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: "white",
      })

      fabricCanvasRef.current = canvas
      setFabricLoaded(true)

      // Setup drawing brush
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
      canvas.freeDrawingBrush.width = brushSize
      canvas.freeDrawingBrush.color = brushColor

      // Simple event handlers
      canvas.on('object:modified', canvasCore.handleCanvasChange)
      canvas.on('object:added', canvasCore.handleCanvasChange)
      canvas.on('object:removed', canvasCore.handleCanvasChange)
      
      // Text editing handlers
      canvas.on('text:changed', canvasCore.handleCanvasChange)
      canvas.on('text:editing:entered', () => {
        console.log('Text editing started')
      })
      canvas.on('text:editing:exited', () => {
        console.log('Text editing ended, saving changes')
        canvasCore.handleCanvasChange()
      })

      // Handle double-click to enter text editing
      canvas.on('mouse:dblclick', (e) => {
        if (e.target && (e.target.type === 'textbox' || e.target.type === 'text')) {
          e.target.enterEditing()
          e.target.selectAll()
        }
      })

      // Handle single click for text objects when text tool is active
      canvas.on('mouse:down', (e) => {
        if (e.target && (e.target.type === 'textbox' || e.target.type === 'text')) {
          // If clicking on existing text with text tool, enter editing mode
          if (canvasCore.activeTool === "text") {
            setTimeout(() => {
              e.target.enterEditing()
              e.target.selectAll()
            }, 100)
          }
        }
      })

      // Load canvas data if exists
      if (documentData.content?.canvasData && Object.keys(documentData.content.canvasData).length > 0) {
        canvas.loadFromJSON(documentData.content.canvasData, () => {
          canvas.renderAll()
        })
      }

      // Resize handler
      const handleResize = () => {
        canvas.setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        })
        canvas.renderAll()
      }

      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        canvas.dispose()
      }
    })
  }, [documentData, canvasRef])

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
    canvasRef,
    // Return all canvas core functionality
    ...canvasCore,
  }
}