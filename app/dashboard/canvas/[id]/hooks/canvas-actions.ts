import type { Canvas } from "fabric"

export function useCanvasActions(
  canvas: Canvas,
  handleCanvasChange: () => void
) {
  const handleDuplicate = () => {
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
  }

  const handleDownloadSelected = () => {
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
  }

  const handleGenerateVariations = async () => {
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
        // Save variations to documents first
        await saveVariationsToDocuments(data.multiplies)
        
        // Add variations to canvas
        data.multiplies.forEach((multiply: any, index: number) => {
          const imgElement = new Image()
          imgElement.onload = () => {
            import("fabric").then((FabricModule) => {
              const fabric = FabricModule
              const fabricImage = new fabric.Image(imgElement, {
                left: firstImage.left + (index + 1) * 50,
                top: firstImage.top + (index + 1) * 50,
                scaleX: firstImage.scaleX,
                scaleY: firstImage.scaleY,
              })
              
              canvas.add(fabricImage)
              canvas.renderAll()
              handleCanvasChange()
              canvas.fire('object:added', { target: fabricImage })
            })
          }
          imgElement.src = multiply.url
        })
      }
    } catch (error) {
      console.error('Error generating variations:', error)
    }
  }

  // Variations are saved as part of canvas state automatically - no separate documents needed

  return {
    handleDuplicate,
    handleDownloadSelected,
    handleGenerateVariations
  }
}