import type { Canvas } from "fabric"

export function useDragAndDrop(
  canvas: Canvas,
  handleCanvasChange: () => void,
  handleFileUpload?: (file: File, position?: { x: number; y: number }) => Promise<void>,
) {
  const compressImage = (file: File, maxWidth = 800, maxHeight = 600, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvasEl = document.createElement("canvas")
      const ctx = canvasEl.getContext("2d")
      const img = new Image()

      img.onload = () => {
        let { width, height } = img

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvasEl.width = width
        canvasEl.height = height
        ctx?.drawImage(img, 0, 0, width, height)

        const compressedDataUrl = canvasEl.toDataURL("image/jpeg", quality)
        resolve(compressedDataUrl)
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const addImageToCanvas = async (imageDataUrl: string, position: { x: number; y: number } | null = null) => {
    return new Promise<void>((resolve) => {
      import("fabric").then((FabricModule) => {
        const fabric = FabricModule
        const imgElement = new Image()

        imgElement.onload = () => {
          const fabricImage = new fabric.Image(imgElement, {
            left: position?.x ?? (canvas.width - imgElement.width) / 2,
            top: position?.y ?? (canvas.height - imgElement.height) / 2,
          })

          const maxWidth = 400
          const maxHeight = 400
          const scale = Math.min(maxWidth / fabricImage.width, maxHeight / fabricImage.height, 1)

          fabricImage.set({
            scaleX: scale,
            scaleY: scale,
          })

          canvas.add(fabricImage)
          canvas.setActiveObject(fabricImage)
          canvas.renderAll()
          handleCanvasChange()
          resolve()
        }

        imgElement.src = imageDataUrl
      })
    })
  }

  const setupDragAndDrop = () => {
    if (!canvas) return () => {}

    const canvasElement = canvas.getElement()
    if (!canvasElement) return () => {}

    const canvasContainer = canvasElement.parentElement || canvasElement

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      e.dataTransfer!.dropEffect = "copy"
      canvas.getElement().style.opacity = "0.8"
    }

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      canvas.getElement().style.opacity = "0.8"
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!canvasElement.contains(e.relatedTarget as Node)) {
        canvas.getElement().style.opacity = "1"
      }
    }

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      canvas.getElement().style.opacity = "1"

      const files = Array.from(e.dataTransfer?.files || [])
      const imageFiles = files.filter((file) => file.type.startsWith("image/"))

      const rect = canvasElement.getBoundingClientRect()
      const dropX = e.clientX - rect.left
      const dropY = e.clientY - rect.top

      for (const file of imageFiles) {
        try {
          if (handleFileUpload) {
            await handleFileUpload(file, { x: dropX - 200, y: dropY - 200 })
          } else {
            // Fallback to old method if no centralized handler
            const shouldCompress = file.size > 2 * 1024 * 1024
            let imageDataUrl: string

            if (shouldCompress) {
              imageDataUrl = await compressImage(file, 800, 600, 0.8)
            } else {
              imageDataUrl = await new Promise<string>((resolve) => {
                const reader = new FileReader()
                reader.onload = (event) => resolve(event.target?.result as string)
                reader.readAsDataURL(file)
              })
            }

            await addImageToCanvas(imageDataUrl, {
              x: dropX - 200,
              y: dropY - 200,
            })
          }
        } catch (error) {
          console.error("Error processing dropped file:", error)
        }
      }
    }

    const handlePaste = async (e: ClipboardEvent) => {
      e.preventDefault()
      const items = Array.from(e.clipboardData?.items || [])
      const imageItems = items.filter((item) => item.type.startsWith("image/"))

      for (const item of imageItems) {
        const file = item.getAsFile()
        if (!file) continue

        try {
          if (handleFileUpload) {
            await handleFileUpload(file)
          } else {
            // Fallback to old method
            const shouldCompress = file.size > 2 * 1024 * 1024
            let imageDataUrl: string

            if (shouldCompress) {
              imageDataUrl = await compressImage(file, 800, 600, 0.8)
            } else {
              imageDataUrl = await new Promise<string>((resolve) => {
                const reader = new FileReader()
                reader.onload = (event) => resolve(event.target?.result as string)
                reader.readAsDataURL(file)
              })
            }

            await addImageToCanvas(imageDataUrl)
          }
        } catch (error) {
          console.error("Error processing pasted image:", error)
        }
      }
    }

    // Setup event listeners
    canvasContainer.setAttribute("tabindex", "0")
    canvasContainer.style.outline = "none"

    const handleCanvasClick = () => {
      canvasContainer.focus()
    }

    canvasElement.addEventListener("dragover", handleDragOver)
    canvasElement.addEventListener("dragenter", handleDragEnter)
    canvasElement.addEventListener("dragleave", handleDragLeave)
    canvasElement.addEventListener("drop", handleDrop)
    canvasElement.addEventListener("click", handleCanvasClick)
    canvasContainer.addEventListener("dragover", handleDragOver)
    canvasContainer.addEventListener("dragenter", handleDragEnter)
    canvasContainer.addEventListener("dragleave", handleDragLeave)
    canvasContainer.addEventListener("drop", handleDrop)
    canvasContainer.addEventListener("paste", handlePaste)
    canvasContainer.addEventListener("click", handleCanvasClick)

    // Prevent default drag behaviors on document
    const preventDefaults = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    let documentListenersAdded = false
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      document.addEventListener("dragover", preventDefaults)
      document.addEventListener("drop", preventDefaults)
      documentListenersAdded = true
    }

    // Return cleanup function
    return () => {
      canvasElement.removeEventListener("dragover", handleDragOver)
      canvasElement.removeEventListener("dragenter", handleDragEnter)
      canvasElement.removeEventListener("dragleave", handleDragLeave)
      canvasElement.removeEventListener("drop", handleDrop)
      canvasElement.removeEventListener("click", handleCanvasClick)
      canvasContainer.removeEventListener("dragover", handleDragOver)
      canvasContainer.removeEventListener("dragenter", handleDragEnter)
      canvasContainer.removeEventListener("dragleave", handleDragLeave)
      canvasContainer.removeEventListener("drop", handleDrop)
      canvasContainer.removeEventListener("paste", handlePaste)
      canvasContainer.removeEventListener("click", handleCanvasClick)

      if (documentListenersAdded && typeof document !== "undefined") {
        document.removeEventListener("dragover", preventDefaults)
        document.removeEventListener("drop", preventDefaults)
      }
    }
  }

  return {
    setupDragAndDrop,
    addImageToCanvas,
    compressImage,
  }
}
