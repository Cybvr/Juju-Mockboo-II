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

        // Center content in viewport helper
        const centerContentInViewport = (canvas: any) => {
          const objects = canvas.getObjects()
          if (objects.length === 0) return

          // Calculate bounding box of all objects
          let minLeft = Number.POSITIVE_INFINITY
          let minTop = Number.POSITIVE_INFINITY
          let maxRight = Number.NEGATIVE_INFINITY
          let maxBottom = Number.NEGATIVE_INFINITY

          objects.forEach((obj: any) => {
            const bounds = obj.getBoundingRect()
            minLeft = Math.min(minLeft, bounds.left)
            minTop = Math.min(minTop, bounds.top)
            maxRight = Math.max(maxRight, bounds.left + bounds.width)
            maxBottom = Math.max(maxBottom, bounds.top + bounds.height)
          })

          const contentCenterX = (minLeft + maxRight) / 2
          const contentCenterY = (minTop + maxBottom) / 2
          const viewportCenterX = canvas.width / 2
          const viewportCenterY = canvas.height / 2

          const vpt = canvas.viewportTransform
          vpt[4] = viewportCenterX - contentCenterX
          vpt[5] = viewportCenterY - contentCenterY
          
          canvas.setViewportTransform(vpt)
          canvas.renderAll()
        }

        // Load existing canvas data
        if (documentData.content?.canvasData && Object.keys(documentData.content.canvasData).length > 0) {
          console.log("🔄 STARTING FIREBASE LOAD - Canvas data exists")
          console.log("🔄 Raw Firebase data:", documentData.content.canvasData)

          canvas.loadFromJSON(documentData.content.canvasData, () => {
            // Restore sticky note properties after loading
            const allObjects = canvas.getObjects()
            console.log("🔄 LOADING FROM FIREBASE - Total objects:", allObjects.length)

            allObjects.forEach((obj: any, index) => {
              console.log(`🔄 Object ${index + 1} LOADED:`, {
                type: obj.type,
                text: obj.text,
                backgroundColor: obj.backgroundColor,
                stickyColor: obj.stickyColor,
                isTextObject: obj.isTextObject,
                stickyNoteGroup: obj.stickyNoteGroup,
                isSticky: !!(obj.backgroundColor && obj.stickyColor)
              })

              // Restore sticky note properties after loading
              if (obj.stickyNoteGroup || (obj.backgroundColor && obj.stickyColor)) {
                // Use Object.defineProperty for better persistence
                Object.defineProperty(obj, 'isTextObject', {
                  value: true,
                  writable: true,
                  enumerable: true,
                  configurable: true
                })
                Object.defineProperty(obj, 'stickyNoteGroup', {
                  value: true,
                  writable: true,
                  enumerable: true,
                  configurable: true
                })
                console.log(`🟡 STICKY NOTE ${index + 1} RESTORED WITH PROPERTIES:`, {
                  isTextObject: obj.isTextObject,
                  stickyNoteGroup: obj.stickyNoteGroup,
                  canEdit: true
                })
              }
            })
            
            console.log("🔄 CANVAS LOADED - All objects with sticky detection:", 
              allObjects.map((obj, i) => ({
                index: i + 1,
                type: obj.type,
                isSticky: !!(obj.backgroundColor && obj.stickyColor),
                hasText: !!obj.text
              }))
            )

            console.log("🔄 CANVAS LOADED - Final object count:", canvas.getObjects().length)
            console.log("🔄 All objects after loading:", canvas.getObjects().map((obj: any, i) => ({
              index: i + 1,
              type: obj.type,
              stickyNoteGroup: obj.stickyNoteGroup,
              stickyColor: obj.stickyColor
            })))

            // Center content in viewport after loading
            centerContentInViewport(canvas)
          })
        } else {
          console.log("🔄 NO FIREBASE DATA TO LOAD")
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

  // Auto-save is already handled in useCanvasCore

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
      <StickyNoteToolbar
        isVisible={canvasCore.selectedObjects.length === 1 && canvasCore.selectedObjects[0]?.backgroundColor && canvasCore.selectedObjects[0]?.stickyColor}
        selectedTextObject={canvasCore.selectedObjects.find(obj => obj.backgroundColor && obj.stickyColor)}
        fabricCanvas={canvasCore.fabricCanvasRef.current}
        onNoteChange={canvasCore.handleCanvasChange}
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