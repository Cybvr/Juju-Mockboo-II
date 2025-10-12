"use client"

import { useState, useEffect, useRef } from "react"
import { Play } from "lucide-react"
import { Scene } from "./scenes-video-editor"
import { Canvas, FabricObject, Text, Rect, Circle, Triangle } from 'fabric'

interface ScenesPreviewProps {
  scenes: Scene[];
  selectedSceneId: string | null;
  isGenerating: boolean;
  error: string | null;
  currentTime?: number;
  isPlaying?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
  onTimeUpdate?: (time: number) => void;
}

type Tool = "select" | "text" | "rect" | "circle" | "triangle"

export function ScenesPreview({
  scenes,
  selectedSceneId,
  isGenerating,
  error,
  currentTime = 0,
  isPlaying = false,
  onPlayStateChange,
  onTimeUpdate
}: ScenesPreviewProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [activeTool, setActiveTool] = useState<Tool>("select")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<Canvas | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate which scene should be showing based on currentTime
  useEffect(() => {
    let accumulatedTime = 0
    for (let i = 0; i < scenes.length; i++) {
      if (currentTime <= accumulatedTime + scenes[i].duration) {
        setCurrentSceneIndex(i)
        break
      }
      accumulatedTime += scenes[i].duration
    }
  }, [currentTime, scenes, currentSceneIndex])

  const displaySceneIndex = currentSceneIndex
  const currentScene = scenes[displaySceneIndex] || scenes[0]

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return

    const initCanvas = async () => {
      const canvas = new Canvas(canvasRef.current, {
        width: 800,
        height: 450,
        backgroundColor: '#000000',
        preserveObjectStacking: true,
        selection: activeTool === 'select',
      })

      fabricCanvasRef.current = canvas
      canvas.renderAll()

      // Resize canvas to fit container
      const resizeCanvas = () => {
        if (!containerRef.current) return
        const container = containerRef.current
        const rect = container.getBoundingClientRect()

        const maxWidth = rect.width - 40
        const maxHeight = rect.height - 40
        const aspectRatio = 16/9

        let canvasWidth = maxWidth
        let canvasHeight = maxWidth / aspectRatio

        if (canvasHeight > maxHeight) {
          canvasHeight = maxHeight
          canvasWidth = maxHeight * aspectRatio
        }

        canvas.setDimensions({
          width: canvasWidth,
          height: canvasHeight
        })
        canvas.renderAll()
      }

      // Initial resize
      setTimeout(resizeCanvas, 100)
      window.addEventListener('resize', resizeCanvas)

      return () => {
        window.removeEventListener('resize', resizeCanvas)
        if (canvas) {
          canvas.dispose()
        }
        fabricCanvasRef.current = null
      }
    }

    initCanvas()
  }, [])

  // Update canvas selection mode based on active tool
  useEffect(() => {
    if (!fabricCanvasRef.current) return
    fabricCanvasRef.current.selection = activeTool === 'select'
    fabricCanvasRef.current.defaultCursor = activeTool === 'select' ? 'default' : 'crosshair'
  }, [activeTool])

  // Sync video playback with timeline
  useEffect(() => {
    const video = videoRef.current
    if (!video || !currentScene || currentScene.type !== 'video') return

    if (isPlaying) {
      video.play()
    } else {
      video.pause()
    }
  }, [isPlaying, currentScene])

  // Update video time based on scene position
  useEffect(() => {
    const video = videoRef.current
    if (!video || !currentScene || currentScene.type !== 'video') return

    let accumulatedTime = 0
    for (let i = 0; i < currentSceneIndex; i++) {
      accumulatedTime += scenes[i].duration
    }
    const timeInScene = currentTime - accumulatedTime
    const normalizedTime = Math.max(0, Math.min(timeInScene, currentScene.duration))

    if (Math.abs(video.currentTime - normalizedTime) > 0.1) {
      video.currentTime = normalizedTime
    }
  }, [currentTime, currentSceneIndex, scenes, currentScene])

  // Helper functions to add elements to canvas
  const addText = (text: string = 'Text', options?: Partial<Text>) => {
    if (!fabricCanvasRef.current) return

    const textObj = new Text(text, {
      left: 960,
      top: 540,
      fontSize: 60,
      fill: '#ffffff',
      fontFamily: 'Arial',
      ...options
    })

    fabricCanvasRef.current.add(textObj)
    fabricCanvasRef.current.setActiveObject(textObj)
    fabricCanvasRef.current.renderAll()
    setActiveTool('select')
  }

  // Load scene content when scene changes
  useEffect(() => {
    if (!fabricCanvasRef.current || !currentScene) return

    const canvas = fabricCanvasRef.current

    // Clear canvas
    canvas.clear()

    if (currentScene.type === 'image' && currentScene.imageUrl) {
      // Add image as Fabric Image object
      import('fabric').then(async (FabricModule) => {
        try {
          const img = await FabricModule.FabricImage.fromURL(currentScene.imageUrl, {
            crossOrigin: 'anonymous'
          })
          
          // Scale to fit canvas while maintaining aspect ratio
          const canvasAspect = canvas.width! / canvas.height!
          const imageAspect = img.width! / img.height!
          
          let scale
          if (imageAspect > canvasAspect) {
            scale = canvas.width! / img.width!
          } else {
            scale = canvas.height! / img.height!
          }

          img.set({
            left: canvas.width! / 2,
            top: canvas.height! / 2,
            originX: 'center',
            originY: 'center',
            scaleX: scale,
            scaleY: scale,
            selectable: true,
            name: 'scene-media'
          })

          canvas.add(img)
          canvas.renderAll()
        } catch (error) {
          console.error('Failed to load image:', error)
          // Show placeholder
          const rect = new FabricModule.Rect({
            left: canvas.width! / 2,
            top: canvas.height! / 2,
            originX: 'center',
            originY: 'center',
            width: canvas.width! * 0.8,
            height: canvas.height! * 0.8,
            fill: '#333333',
            stroke: '#666666',
            strokeWidth: 2
          })
          canvas.add(rect)
          canvas.renderAll()
        }
      })
    } else if (currentScene.type === 'video' && currentScene.videoUrl) {
      // For videos, show a placeholder for now
      import('fabric').then((FabricModule) => {
        const rect = new FabricModule.Rect({
          left: canvas.width! / 2,
          top: canvas.height! / 2,
          originX: 'center',
          originY: 'center',
          width: canvas.width! * 0.8,
          height: canvas.height! * 0.8,
          fill: '#1a1a1a',
          stroke: '#444444',
          strokeWidth: 2
        })
        
        const text = new FabricModule.Text('VIDEO', {
          left: canvas.width! / 2,
          top: canvas.height! / 2,
          originX: 'center',
          originY: 'center',
          fontSize: 24,
          fill: '#ffffff',
          fontFamily: 'Arial'
        })
        
        canvas.add(rect, text)
        canvas.renderAll()
      })
    } else {
      // Empty scene - show placeholder
      import('fabric').then((FabricModule) => {
        const text = new FabricModule.Text('Empty Scene\nAdd media from the left panel', {
          left: canvas.width! / 2,
          top: canvas.height! / 2,
          originX: 'center',
          originY: 'center',
          fontSize: 20,
          fill: '#666666',
          fontFamily: 'Arial',
          textAlign: 'center'
        })
        
        canvas.add(text)
        canvas.renderAll()
      })
    }
  }, [currentScene])

  const addShape = (type: 'rect' | 'circle' | 'triangle') => {
    if (!fabricCanvasRef.current) return

    let shape: FabricObject

    switch (type) {
      case 'rect':
        shape = new Rect({
          left: 960 - 50,
          top: 540 - 25,
          width: 100,
          height: 50,
          fill: '#3B82F6',
          stroke: '#1D4ED8',
          strokeWidth: 2
        })
        break
      case 'circle':
        shape = new Circle({
          left: 960 - 40,
          top: 540 - 40,
          radius: 40,
          fill: '#EF4444',
          stroke: '#DC2626',
          strokeWidth: 2
        })
        break
      case 'triangle':
        shape = new Triangle({
          left: 960 - 40,
          top: 540 - 40,
          width: 80,
          height: 80,
          fill: '#10B981',
          stroke: '#059669',
          strokeWidth: 2
        })
        break
      default:
        return
    }

    fabricCanvasRef.current.add(shape)
    fabricCanvasRef.current.setActiveObject(shape)
    fabricCanvasRef.current.renderAll()
    setActiveTool('select')
  }

  // Helper to get the scene media object
  const getSceneMediaObject = () => {
    if (!fabricCanvasRef.current) return null
    return fabricCanvasRef.current.getObjects().find((obj: any) => obj.name === 'scene-media')
  }

  // Helper to scale scene media
  const scaleSceneMedia = (scaleX: number, scaleY: number) => {
    const mediaObj = getSceneMediaObject()
    if (mediaObj) {
      mediaObj.set({ scaleX, scaleY })
      fabricCanvasRef.current?.renderAll()
    }
  }

  // Helper to crop scene media (by changing clip path)
  const cropSceneMedia = (left: number, top: number, width: number, height: number) => {
    const mediaObj = getSceneMediaObject()
    if (mediaObj && fabricCanvasRef.current) {
      import('fabric').then((FabricModule) => {
        const fabric = FabricModule
        const clipPath = new fabric.Rect({
          left: left,
          top: top,
          width: width,
          height: height,
          absolutePositioned: true
        })
        mediaObj.set({ clipPath })
        fabricCanvasRef.current?.renderAll()
      })
    }
  }

  // Expose functions for parent component
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).sceneEditor = {
        addText,
        addShape,
        canvas: fabricCanvasRef.current,
        getSceneMediaObject,
        scaleSceneMedia,
        cropSceneMedia
      }
    }
  }, [])

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        {scenes.length === 0 ? (
          <div className="text-center text-muted-foreground">
            <div className="w-64 h-36 bg-muted rounded-lg flex items-center justify-center mb-4">
              <Play className="w-12 h-12" />
            </div>
            <p className="text-lg mb-2">No scenes to preview</p>
            <p className="text-sm">Add scenes from the media library to get started</p>
          </div>
        ) : (
          <div className="max-w-2xl w-full">
            {/* Video/Canvas Preview Container */}
            <div 
              ref={containerRef}
              className="relative bg-black rounded-lg overflow-hidden aspect-video mb-6"
            >
              {currentScene && (
                <>
                  {/* Fabric.js Canvas Layer */}
                  <canvas 
                    ref={canvasRef}
                    className="absolute inset-0 m-auto"
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  />
                </>
              )}
            </div>

            {/* Quick Add Buttons */}
            <div className="flex gap-2 justify-center">
              <button 
                onClick={() => addText()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Add Text
              </button>
              <button 
                onClick={() => addShape('rect')}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
              >
                Add Rectangle
              </button>
              <button 
                onClick={() => addShape('circle')}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
              >
                Add Circle
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 border-t border-border">
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2 rounded">
            {error}
          </div>
        </div>
      )}
    </div>
  )
}