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
  }, [currentTime, scenes])

  const currentScene = scenes[currentSceneIndex] || scenes[0]

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return

    const canvas = new Canvas(canvasRef.current, {
      width: 1920,
      height: 1080,
      backgroundColor: '#000000',
      preserveObjectStacking: true,
      selection: true,
    })

    fabricCanvasRef.current = canvas

    // Resize canvas to fit container
    const resizeCanvas = () => {
      if (!containerRef.current) return

      const container = containerRef.current
      const rect = container.getBoundingClientRect()
      const aspectRatio = 16/9

      let displayWidth = rect.width - 40
      let displayHeight = displayWidth / aspectRatio

      if (displayHeight > rect.height - 40) {
        displayHeight = rect.height - 40
        displayWidth = displayHeight * aspectRatio
      }

      canvas.setDimensions({
        width: displayWidth,
        height: displayHeight
      }, { cssOnly: true })

      canvas.setZoom(displayWidth / 1920)
      canvas.renderAll()
    }

    // Initial resize
    setTimeout(resizeCanvas, 100)
    window.addEventListener('resize', resizeCanvas)

    // Expose canvas globally for tools to use
    if (typeof window !== 'undefined') {
      (window as any).sceneCanvas = canvas
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (canvas) {
        canvas.dispose()
      }
      fabricCanvasRef.current = null
    }
  }, [])

  // Load scene content when scene changes
  useEffect(() => {
    if (!fabricCanvasRef.current || !currentScene) return

    const canvas = fabricCanvasRef.current

    // Clear existing scene media but keep added elements
    const objects = canvas.getObjects()
    objects.forEach(obj => {
      if ((obj as any).name === 'scene-media') {
        canvas.remove(obj)
      }
    })

    if (currentScene.type === 'image' && currentScene.imageUrl) {
      import('fabric').then(async (FabricModule) => {
        try {
          const img = await FabricModule.FabricImage.fromURL(currentScene.imageUrl, {
            crossOrigin: 'anonymous'
          })

          // Scale to fit canvas
          const canvasAspect = 1920 / 1080
          const imageAspect = img.width! / img.height!

          let scale
          if (imageAspect > canvasAspect) {
            scale = 1920 / img.width!
          } else {
            scale = 1080 / img.height!
          }

          img.set({
            left: 1920 / 2,
            top: 1080 / 2,
            originX: 'center',
            originY: 'center',
            scaleX: scale,
            scaleY: scale,
            selectable: true,
            name: 'scene-media'
          })

          canvas.add(img)
          canvas.sendToBack(img)
          canvas.renderAll()
        } catch (error) {
          console.error('Failed to load image:', error)
        }
      })
    } else if (currentScene.type === 'video' && currentScene.videoUrl) {
      import('fabric').then((FabricModule) => {
        const rect = new FabricModule.Rect({
          left: 1920 / 2,
          top: 1080 / 2,
          originX: 'center',
          originY: 'center',
          width: 1920 * 0.8,
          height: 1080 * 0.8,
          fill: '#1a1a1a',
          stroke: '#444444',
          strokeWidth: 4,
          name: 'scene-media'
        })

        const text = new FabricModule.Text('VIDEO', {
          left: 1920 / 2,
          top: 1080 / 2,
          originX: 'center',
          originY: 'center',
          fontSize: 48,
          fill: '#ffffff',
          fontFamily: 'Arial'
        })

        canvas.add(rect, text)
        canvas.sendToBack(rect)
        canvas.renderAll()
      })
    }
  }, [currentScene])

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        {scenes.length === 0 ? (
          <div className="text-center text-muted-foreground">
            <div className="w-64 h-36 bg-muted rounded-lg flex items-center justify-center mb-4">
              <Play className="w-12 h-12" />
            </div>
            <p className="text-lg mb-2">No scenes to preview</p>
            <p className="text-sm">Add scenes from the media library to get started</p>
          </div>
        ) : (
          <div className="w-full h-full">
            <div 
              ref={containerRef}
              className="relative bg-black rounded-lg overflow-hidden w-full h-full flex items-center justify-center"
            >
              <canvas 
                ref={canvasRef}
                className="border border-border/20"
              />
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