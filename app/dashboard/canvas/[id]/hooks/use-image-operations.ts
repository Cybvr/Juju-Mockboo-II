import { useCallback } from "react"
import type { Canvas } from "fabric"

interface ImageOperationsProps {
  fabricCanvasRef: React.MutableRefObject<Canvas | null>
  handleCanvasChange: () => void
  userId?: string
}

export function useImageOperations({
  fabricCanvasRef,
  handleCanvasChange,
  userId
}: ImageOperationsProps) {

  const compressImage = useCallback((
    file: File,
    maxWidth: number = 800,
    maxHeight: number = 600,
    quality: number = 0.8
  ): Promise<string> => {
    return new Promise((resolve) => {
      const canvasEl = document.createElement('canvas')
      const ctx = canvasEl.getContext('2d')
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

        const compressedDataUrl = canvasEl.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const uploadImageToStorage = useCallback(async (imageUrl: string) => {
    if (!userId || (!imageUrl.startsWith('data:') && imageUrl.includes('firebase'))) {
      return imageUrl
    }

    try {
      const { storageService } = require('@/services/storageService')
      const uploadedUrls = await storageService.uploadImages([imageUrl], userId)
      return uploadedUrls[0]
    } catch (uploadError) {
      console.warn('Failed to upload to storage, using original URL:', uploadError)
      return imageUrl
    }
  }, [userId])

  const addImageToCanvas = useCallback(async (
    imageUrl: string,
    options: {
      replaceObjects?: { placeholder?: any; text?: any }
      position?: { x: number; y: number }
      immediate?: boolean
    } = {}
  ) => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current
    const { replaceObjects, position, immediate } = options

    // ALWAYS upload base64 to storage before adding to canvas
    let persistentImageUrl = await uploadImageToStorage(imageUrl)
    

    return new Promise<void>((resolve, reject) => {
      import("fabric").then((FabricModule) => {
        const fabric = FabricModule
        const imgElement = new Image()
        imgElement.crossOrigin = "anonymous"

        imgElement.onload = () => {
          let left = (canvas.width - imgElement.width) / 2
          let top = (canvas.height - imgElement.height) / 2

          if (replaceObjects?.placeholder) {
            left = replaceObjects.placeholder.left
            top = replaceObjects.placeholder.top
          } else if (position) {
            left = position.x
            top = position.y
          }

          const fabricImage = new fabric.Image(imgElement, { left, top })
          const maxWidth = 400
          const maxHeight = 400
          const scale = Math.min(maxWidth / fabricImage.width, maxHeight / fabricImage.height, 1)

          fabricImage.set({
            scaleX: scale,
            scaleY: scale,
            lockUniScaling: true,
            centeredScaling: false,
            centeredRotation: true,
            lockScalingFlip: true,
            lockSkewingX: true,
            lockSkewingY: true
          })

          if (replaceObjects) {
            if (replaceObjects.placeholder) canvas.remove(replaceObjects.placeholder)
            if (replaceObjects.text) canvas.remove(replaceObjects.text)
          }

          canvas.add(fabricImage)
          canvas.setActiveObject(fabricImage)
          canvas.renderAll()

          if (handleCanvasChange) {
            handleCanvasChange()
            canvas.fire('path:created', { path: fabricImage })
            canvas.fire('object:added', { target: fabricImage })
          }

          resolve()
        }

        imgElement.onerror = () => reject(new Error('Failed to load image'))
        imgElement.src = persistentImageUrl
      }).catch(reject)
    })
  }, [fabricCanvasRef, handleCanvasChange, uploadImageToStorage])

  const handleFileUpload = useCallback(async (file: File, position?: { x: number; y: number }) => {
    if (!fabricCanvasRef.current) return

    try {
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

      await addImageToCanvas(imageDataUrl, { position })
    } catch (error) {
      console.error('Error processing uploaded file:', error)
      throw error
    }
  }, [addImageToCanvas, compressImage])

  // Drag and drop setup
  const setupDragAndDrop = useCallback(() => {
    if (!fabricCanvasRef.current) return () => {}

    const canvas = fabricCanvasRef.current
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
          await handleFileUpload(file, { x: dropX - 200, y: dropY - 200 })
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
          await handleFileUpload(file)
        } catch (error) {
          console.error("Error processing pasted image:", error)
        }
      }
    }

    canvasContainer.setAttribute("tabindex", "0")
    canvasContainer.style.outline = "none"

    const handleCanvasClick = () => {
      canvasContainer.focus()
    }

    // Setup event listeners
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
  }, [fabricCanvasRef, handleFileUpload])

  // Image operations
  const downloadSelectedImages = useCallback(() => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current
    const activeObjects = canvas.getActiveObjects()
    const imageObjects = activeObjects.filter((obj: any) => obj.type === 'image')

    if (imageObjects.length === 0) {
      const dataURL = canvas.toDataURL({ format: "png" })
      const link = document.createElement('a')
      link.href = dataURL
      link.download = `canvas-export-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    }

    imageObjects.forEach((obj: any, index: number) => {
      if (obj.getSrc) {
        const link = document.createElement('a')
        link.href = obj.getSrc()
        link.download = `canvas-image-${index + 1}.png`
        link.crossOrigin = 'anonymous'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    })
  }, [fabricCanvasRef])

  const duplicateSelectedImages = useCallback(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length === 0) return

    activeObjects.forEach((obj: any) => {
      obj.clone().then((cloned: any) => {
        cloned.set({
          left: cloned.left + 20,
          top: cloned.top + 20,
          evented: true,
        })

        // Preserve sticky note properties - FORCE preservation
        if (obj.stickyNoteGroup === true || obj.type === "group") {
          Object.defineProperty(cloned, 'stickyNoteGroup', {
            value: true,
            writable: true,
            enumerable: true,
            configurable: false
          })
          Object.defineProperty(cloned, 'stickyColor', {
            value: obj.stickyColor || "yellow",
            writable: true,
            enumerable: true,
            configurable: true
          })
        }

        // Preserve text object properties
        if (obj.isTextObject) {
          cloned.isTextObject = true
        }

        canvas.add(cloned)
      })
    })

    canvas.discardActiveObject()
    canvas.renderAll()
    handleCanvasChange()
  }, [fabricCanvasRef, handleCanvasChange])

  const generateImageVariations = useCallback(async () => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current
    const activeObjects = canvas.getActiveObjects()
    const imageObjects = activeObjects.filter((obj: any) => obj.type === 'image')

    if (imageObjects.length === 0) return

    const firstImage = imageObjects[0]
    if (!firstImage.getSrc) return

    try {
      const response = await fetch('/api/multiply/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: firstImage.getSrc(),
          outputs: 4,
          prompt: 'Create professional design variations maintaining core elements'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate variations')
      }

      const data = await response.json()

      if (data.success && data.multiplies) {
        for (let i = 0; i < data.multiplies.length; i++) {
          const multiply = data.multiplies[i]
          await addImageToCanvas(multiply.url, {
            position: {
              x: firstImage.left + (i + 1) * 50,
              y: firstImage.top + (i + 1) * 50
            }
          })
        }
      }
    } catch (error) {
      console.error('Error generating variations:', error)
      throw error
    }
  }, [fabricCanvasRef, addImageToCanvas])

  const applyStyleToImage = useCallback(async (stylePrompt: string) => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current
    const activeObjects = canvas.getActiveObjects()
    const imageObjects = activeObjects.filter((obj: any) => obj.type === 'image')

    if (imageObjects.length === 0) return

    const firstImage = imageObjects[0]
    if (!firstImage.getSrc) return

    try {
      const response = await fetch('/api/image-editor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: stylePrompt,
          imageData: firstImage.getSrc().split(',')[1],
          model: 'gemini-2.5-flash-image-preview',
          aspectRatio: '1:1',
          outputs: '1'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to restyle image')
      }

      const data = await response.json()

      if (data.success && data.images && data.images.length > 0) {
        await addImageToCanvas(data.images[0].url, {
          position: {
            x: firstImage.left + 50,
            y: firstImage.top + 50
          }
        })
      }
    } catch (error) {
      console.error('Error applying style:', error)
      throw error
    }
  }, [fabricCanvasRef, addImageToCanvas])

  const copyImageToClipboard = useCallback(async () => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current
    const activeObjects = canvas.getActiveObjects()
    const imageObjects = activeObjects.filter((obj: any) => obj.type === 'image')

    if (imageObjects.length === 0) return

    const firstImage = imageObjects[0]
    if (!firstImage.getSrc) return

    try {
      const dataURL = firstImage.toDataURL({ format: 'png' })
      const response = await fetch(dataURL)
      const blob = await response.blob()
      const pngBlob = new Blob([blob], { type: 'image/png' })

      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': pngBlob
        })
      ])
    } catch (error) {
      console.error('Failed to copy image to clipboard:', error)
      try {
        await navigator.clipboard.writeText(firstImage.getSrc())
      } catch (fallbackError) {
        console.error('Failed to copy image URL:', fallbackError)
      }
    }
  }, [fabricCanvasRef])

  return {
    addImageToCanvas,
    handleFileUpload,
    setupDragAndDrop,
    compressImage,
    uploadImageToStorage,
    downloadSelectedImages,
    duplicateSelectedImages,
    generateImageVariations,
    applyStyleToImage,
    copyImageToClipboard
  }
}