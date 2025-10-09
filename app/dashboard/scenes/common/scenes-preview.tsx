"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Play } from "lucide-react"
import { Scene } from "./scenes-video-editor"

interface ScenesPreviewProps {
  scenes: Scene[];
  selectedSceneId: string | null;
  isGenerating: boolean;
  error: string | null;
  currentTime?: number;
  isPlaying?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
  onTimeUpdate?: (time: number) => void;
  onAddTextToScene?: (sceneId: string, textObject: any) => void;
}

export function ScenesPreview({
  scenes,
  selectedSceneId,
  isGenerating,
  error,
  currentTime = 0,
  isPlaying = false,
  onPlayStateChange,
  onTimeUpdate,
  onAddTextToScene,
}: ScenesPreviewProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<any>(null)
  const [fabricLoaded, setFabricLoaded] = useState(false)

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

  // Show current scene based on timeline position (don't override with selected)
  const displaySceneIndex = currentSceneIndex
  const currentScene = scenes[displaySceneIndex] || scenes[0]

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

    // Calculate time within current scene
    let accumulatedTime = 0
    for (let i = 0; i < currentSceneIndex; i++) {
      accumulatedTime += scenes[i].duration
    }
    const timeInScene = currentTime - accumulatedTime
    const normalizedTime = Math.max(0, Math.min(timeInScene, currentScene.duration))

    // Only seek if time difference is significant to avoid constant seeking
    if (Math.abs(video.currentTime - normalizedTime) > 0.1) {
      video.currentTime = normalizedTime
    }
  }, [currentTime, currentSceneIndex, scenes, currentScene])

  // Initialize Fabric canvas for editing
  useEffect(() => {
    if (!canvasRef.current || fabricLoaded) return

    import("fabric").then((FabricModule) => {
      const fabric = FabricModule

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 450,
        backgroundColor: "white",
      })

      fabricCanvasRef.current = canvas
      setFabricLoaded(true)

      // Load scene background if available
      if (currentScene?.imageUrl) {
        fabric.Image.fromURL(currentScene.imageUrl).then((img) => {
          img.set({
            left: 0,
            top: 0,
            scaleX: canvas.width! / img.width!,
            scaleY: canvas.height! / img.height!,
            selectable: false,
          })
          canvas.add(img)
          canvas.sendToBack(img)
          canvas.renderAll()
        })
      }

      return () => {
        canvas.dispose()
      }
    })
  }, [canvasRef.current, fabricLoaded, currentScene?.imageUrl])

  // Function to add text to canvas
  const addTextToCanvas = useCallback((textType: 'title' | 'subtitle' | 'body') => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current

    const textStyles = {
      title: { fontSize: 32, fontFamily: 'Arial', fontWeight: 'bold' },
      subtitle: { fontSize: 24, fontFamily: 'Arial', fontWeight: 'normal' },
      body: { fontSize: 18, fontFamily: 'Arial', fontWeight: 'normal' }
    }

    const textContent = {
      title: 'Your Title Here',
      subtitle: 'Your Subtitle Here',
      body: 'Your text here'
    }

    import("fabric").then((FabricModule) => {
      const fabric = FabricModule

      const text = new fabric.Textbox(textContent[textType], {
        left: canvas.width! / 2 - 100,
        top: canvas.height! / 2 - 50,
        width: 200,
        fill: '#000000',
        ...textStyles[textType],
      })

      canvas.add(text)
      canvas.setActiveObject(text)
      canvas.renderAll()

      // Notify parent about text addition
      if (onAddTextToScene && selectedSceneId) {
        onAddTextToScene(selectedSceneId, {
          type: textType,
          content: textContent[textType],
          position: { x: text.left, y: text.top },
          style: textStyles[textType]
        })
      }
    })
  }, [selectedSceneId, onAddTextToScene])

  // Expose addTextToCanvas globally so TextPanel can access it
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addTextToCanvas = addTextToCanvas
    }
  }, [addTextToCanvas])


  // Find the currently selected scene for preview
  const currentSceneForPreview = scenes.find(scene => scene.id === selectedSceneId)

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
            {/* Video Preview */}
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative flex items-center justify-center">
              {fabricLoaded ? (
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-full"
                  style={{ border: '1px solid #ccc' }}
                />
              ) : currentSceneForPreview ? (
                currentSceneForPreview.imageUrl ? (
                  <img
                    src={currentSceneForPreview.imageUrl}
                    alt={currentSceneForPreview.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="text-lg font-medium">{currentSceneForPreview.name}</div>
                      <div className="text-sm opacity-70">{currentSceneForPreview.duration}s duration</div>
                    </div>
                  </div>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="text-lg font-medium">No Scene Selected</div>
                    <div className="text-sm opacity-70">Select a scene to preview</div>
                  </div>
                </div>
              )}
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