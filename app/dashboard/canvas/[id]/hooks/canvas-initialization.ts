import type { Canvas } from "fabric"

export function setupUndoRedo(canvas: Canvas, canvasState: any) {
  let undoStack: string[] = []
  let redoStack: string[] = []
  let isUndoRedoing = false

  const saveState = () => {
    if (isUndoRedoing) return
    const state = JSON.stringify(canvas.toJSON())
    undoStack.push(state)
    redoStack = []
    canvasState.setCanUndo(undoStack.length > 1)
    canvasState.setCanRedo(false)
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
      canvasState.setCanUndo(undoStack.length > 1)
      canvasState.setCanRedo(redoStack.length > 0)
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
        canvasState.setCanUndo(undoStack.length > 1)
        canvasState.setCanRedo(redoStack.length > 0)
        setTimeout(() => {
          isUndoRedoing = false
        }, 0)
      })
    }
  }

  canvas.canUndo = () => undoStack.length > 1
  canvas.canRedo = () => redoStack.length > 0

  // Initialize with first state
  saveState()

  return { saveState }
}

export function setupCanvasEvents(
  canvas: Canvas, 
  handleCanvasChange: () => void,
  setSelectedObjects: (objects: any[]) => void,
  onSelectedImagesChange?: (images: string[]) => void,
  saveState?: () => void
) {
  // Object modification events - only call handleCanvasChange to avoid conflicts
  canvas.on("object:added", () => {
    handleCanvasChange()
  })

  canvas.on("object:modified", () => {
    handleCanvasChange()
  })

  canvas.on("object:removed", () => {
    handleCanvasChange()
  })

  // Handle object selection
  canvas.on("selection:created", (e: any) => {
    setSelectedObjects(e.selected || [])
    if (onSelectedImagesChange) {
      const selectedImages = (e.selected || [])
        .filter((obj: any) => obj.type === "image")
        .map((obj: any) => obj.src)
      onSelectedImagesChange(selectedImages)
    }
    saveState()
  })

  

  canvas.on("selection:updated", (e) => {
    const activeObjects = canvas.getActiveObjects()
    setSelectedObjects(activeObjects)
    const imageUrls = activeObjects
      .filter((obj: any) => obj.type === 'image' && obj.getSrc)
      .map((obj: any) => obj.getSrc())
    if (onSelectedImagesChange) {
      onSelectedImagesChange(imageUrls)
    }
  })

  canvas.on("selection:cleared", () => {
    setSelectedObjects([])
    if (onSelectedImagesChange) {
      onSelectedImagesChange([])
    }
  })
}

export function setupResizeHandler(canvas: Canvas) {
  const handleResize = () => {
    if (canvas && canvas.getElement()) {
      // Use full viewport dimensions instead of container
      canvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
      canvas.renderAll()
    }
  }

  // Set initial size to viewport
  handleResize()

  window.addEventListener("resize", handleResize)

  return () => {
    window.removeEventListener("resize", handleResize)
  }
}