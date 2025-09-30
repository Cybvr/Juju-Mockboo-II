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
      console.log('Uploading image to Firebase Storage...')
      const uploadedUrls = await storageService.uploadImages([imageUrl], userId)
      console.log('Image uploaded successfully:', uploadedUrls[0])
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

    try {
      // Always upload large data URLs to storage AND compress for canvas
      let persistentImageUrl = imageUrl
      if (imageUrl.startsWith('data:') && imageUrl.length > 100000) {
        console.log('Uploading large image to storage to prevent canvas corruption');
        persistentImageUrl = await uploadImageToStorage(imageUrl)
      } else if (imageUrl.startsWith('data:') && imageUrl.length > 50000) {
        console.log('Compressing medium-sized image for canvas');
        persistentImageUrl = await compressImage(new File([imageUrl], 'image.jpg'), 800, 600, 0.7);
      }

      return new Promise<void>((resolve, reject) => {
        import("fabric").then((FabricModule) => {
          const fabric = FabricModule
          const imgElement = new Image()
          imgElement.crossOrigin = "anonymous"

          const loadImage = (src: string) => {
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
              })

              if (replaceObjects) {
                if (replaceObjects.placeholder) canvas.remove(replaceObjects.placeholder)
                if (replaceObjects.text) canvas.remove(replaceObjects.text)
              }

              canvas.add(fabricImage)
              canvas.setActiveObject(fabricImage)
              canvas.renderAll()

              // Trigger canvas change to save state immediately
              if (handleCanvasChange) {
                console.log('ImageOps: Triggering canvas save after adding image');
                handleCanvasChange();

                // Fire canvas events to ensure persistence
                canvas.fire('path:created', { path: fabricImage });
                canvas.fire('object:added', { target: fabricImage });
              }

              resolve()
            }

            imgElement.onerror = () => {
              if (src === persistentImageUrl && src !== imageUrl) {
                // Fallback to original URL
                loadImage(imageUrl)
              } else {
                console.error('Failed to load image')
                reject(new Error('Failed to load image'))
              }
            }

            imgElement.src = src
          }

          loadImage(persistentImageUrl)
        }).catch(reject)
      })
    } catch (error) {
      console.error('Error adding image to canvas:', error)
      throw error
    }
  }, [fabricCanvasRef, handleCanvasChange, uploadImageToStorage, compressImage])

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

  const downloadSelectedImages = useCallback(() => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current
    const activeObjects = canvas.getActiveObjects()
    const imageObjects = activeObjects.filter((obj: any) => obj.type === 'image')

    if (imageObjects.length === 0) {
      // Download entire canvas if no images selected
      const dataURL = canvas.toDataURL({ format: "png" })
      const link = document.createElement('a')
      link.href = dataURL
      link.download = `canvas-export-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    }

    // Download selected images
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

  const duplicateSelectedImages = useCallback(async () => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current
    const activeObjects = canvas.getActiveObjects()

    for (const obj of activeObjects) {
      try {
        const cloned = await new Promise((resolve) => {
          obj.clone(resolve)
        })
        cloned.set({
          left: cloned.left + 20,
          top: cloned.top + 20,
        })
        canvas.add(cloned)
        canvas.setActiveObject(cloned)
      } catch (error) {
        console.warn('Failed to clone object:', error)
      }
    }

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
        // Add variations directly to canvas - canvas saves state automatically
        for (let i = 0; i < data.multiplies.length; i++) {
          const multiply = data.multiplies[i]
          await addImageToCanvas(multiply.url, {
            position: {
              x: firstImage.left + (i + 1) * 50,
              y: firstImage.top + (i + 1) * 50
            }
          })
        }
        // Canvas auto-saves - no need to create separate documents
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
        // Canvas auto-saves - no need to create separate documents
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
      // Always convert to PNG format for clipboard compatibility
      const dataURL = firstImage.toDataURL({ format: 'png' })
      const response = await fetch(dataURL)
      const blob = await response.blob()

      // Ensure we're using PNG format for clipboard
      const pngBlob = new Blob([blob], { type: 'image/png' })

      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': pngBlob
        })
      ])

      console.log('Image copied to clipboard successfully')
    } catch (error) {
      console.error('Failed to copy image to clipboard:', error)

      // Fallback: copy image URL as text
      try {
        await navigator.clipboard.writeText(firstImage.getSrc())
        console.log('Image URL copied to clipboard as fallback')
      } catch (fallbackError) {
        console.error('Failed to copy image URL:', fallbackError)
      }
    }
  }, [fabricCanvasRef])

  // Variations are saved as part of canvas state, not separate documents

  return {
    addImageToCanvas,
    handleFileUpload,
    compressImage,
    uploadImageToStorage,
    downloadSelectedImages,
    duplicateSelectedImages,
    generateImageVariations,
    applyStyleToImage,
    copyImageToClipboard
  }
}