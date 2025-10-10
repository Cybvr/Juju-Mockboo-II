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

    const canvas = new Canvas(canvasRef.current, {
      width: 1920,
      height: 1080,
      backgroundColor: 'transparent',
      preserveObjectStacking: true,
      selection: activeTool === 'select',
    })

    fabricCanvasRef.current = canvas

    // Resize canvas to fit container
    const resizeCanvas = () => {
      if (!containerRef.current) return
      const container = containerRef.current
      const rect = container.getBoundingClientRect()

      const scale = Math.min(rect.width / 1920, rect.height / 1080)
      canvas.setZoom(scale)
      canvas.setWidth(1920 * scale)
      canvas.setHeight(1080 * scale)
      canvas.renderAll()
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      canvas.dispose()
      fabricCanvasRef.current = null
    }
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

  const addShape = (type: 'rect' | 'circle' | 'triangle') => {
    if (!fabricCanvasRef.current) return

    let shape: FabricObject

    switch (type) {
      case 'rect':
        shape = new Rect({
          left: 860,
          top: 440,
          width: 200,
          height: 200,
          fill: '#ff0000',
          opacity: 0.8
        })
        break
      case 'circle':
        shape = new Circle({
          left: 860,
          top: 440,
          radius: 100,
          fill: '#00ff00',
          opacity: 0.8
        })
        break
      case 'triangle':
        shape = new Triangle({
          left: 860,
          top: 440,
          width: 200,
          height: 200,
          fill: '#0000ff',
          opacity: 0.8
        })
        break
    }

    fabricCanvasRef.current.add(shape)
    fabricCanvasRef.current.setActiveObject(shape)
    fabricCanvasRef.current.renderAll()
    setActiveTool('select')
  }

  // Expose functions for parent component
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).sceneEditor = {
        addText,
        addShape,
        canvas: fabricCanvasRef.current
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
                  {/* Video/Image Layer */}
                  {currentScene.type === 'video' && currentScene.videoUrl ? (
                    <video
                      ref={videoRef}
                      src={currentScene.videoUrl}
                      className="absolute inset-0 w-full h-full object-contain"
                      muted
                      autoPlay={isPlaying}
                      loop
                    />
                  ) : currentScene.imageUrl ? (
                    <img
                      src={currentScene.imageUrl}
                      alt={currentScene.name}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <Play className="w-16 h-16 mx-auto mb-2" />
                        <p>{currentScene.name}</p>
                      </div>
                    </div>
                  )}

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