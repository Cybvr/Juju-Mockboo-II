"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause } from "lucide-react"
import { Scene } from "./scenes-video-editor"
import { Button } from "@/components/ui/button"

interface ScenesPreviewProps {
  scenes: Scene[];
  selectedSceneId: string | null;
  isGenerating: boolean;
  error: string | null;
  currentTime?: number;
  isPlaying?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
  onTimeUpdate?: (time: number) => void;
  onUpdateScene?: (sceneId: string, updates: Partial<Scene>) => void;
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
  onUpdateScene
}: ScenesPreviewProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
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

  // Use selected scene if available, otherwise use current scene from timeline
  const displayScene = selectedSceneId 
    ? scenes.find(s => s.id === selectedSceneId) || scenes[currentSceneIndex]
    : scenes[currentSceneIndex]

  // Handle video playback and sync with timeline
  useEffect(() => {
    const video = videoRef.current
    if (!video || !displayScene || displayScene.type !== 'video') return

    // Wait for video metadata to load to get actual duration
    const handleLoadedMetadata = () => {
      const actualVideoDuration = video.duration
      
      // Update scene duration if it doesn't match actual video duration
      if (Math.abs(displayScene.duration - actualVideoDuration) > 0.1 && onUpdateScene) {
        onUpdateScene(displayScene.id, { duration: actualVideoDuration })
      }

      const sceneStartTime = scenes.slice(0, currentSceneIndex).reduce((sum, scene) => sum + scene.duration, 0)
      const sceneTime = Math.max(0, Math.min(currentTime - sceneStartTime, actualVideoDuration))

      // Set video time
      video.currentTime = sceneTime

      if (isPlaying && sceneTime < actualVideoDuration) {
        video.play().catch(console.error)
      } else {
        video.pause()
      }
    }

    // Listen for video time updates
    const handleTimeUpdate = () => {
      if (onTimeUpdate && isPlaying) {
        const sceneStartTime = scenes.slice(0, currentSceneIndex).reduce((sum, scene) => sum + scene.duration, 0)
        const newGlobalTime = sceneStartTime + video.currentTime
        onTimeUpdate(newGlobalTime)
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)

    // If metadata already loaded
    if (video.readyState >= 1) {
      handleLoadedMetadata()
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [isPlaying, displayScene, currentTime, currentSceneIndex, scenes, onTimeUpdate])

  const getMediaUrl = (scene: Scene) => {
    if (scene.type === 'video') {
      return scene.videoUrl || scene.imageUrl
    }
    return scene.imageUrl
  }

  const handlePlayToggle = () => {
    if (onPlayStateChange) {
      onPlayStateChange(!isPlaying)
    }
  }

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Preview Area */}
      <div className="flex-1 relative">
        {scenes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-white/60">
            <div className="text-center">
              <div className="w-32 h-18 bg-white/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Play className="w-8 h-8" />
              </div>
              <p className="text-lg mb-2">No scenes added</p>
              <p className="text-sm opacity-60">Add media from the library to start editing</p>
            </div>
          </div>
        ) : displayScene ? (
          <div className="absolute inset-0">
            {displayScene.type === 'video' && getMediaUrl(displayScene) ? (
              <video
                ref={videoRef}
                src={getMediaUrl(displayScene)}
                className="w-full h-full object-contain"
                muted
                playsInline
                onLoadedData={() => {
                  // Video loaded successfully
                }}
                onError={(e) => {
                  console.error('Video load error:', e)
                }}
              />
            ) : displayScene.type === 'image' && getMediaUrl(displayScene) ? (
              <img
                ref={imageRef}
                src={getMediaUrl(displayScene)}
                alt="Scene media"
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error('Image load error:', e)
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/60">
                <div className="text-center">
                  <div className="w-32 h-18 bg-white/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Play className="w-8 h-8" />
                  </div>
                  <p className="text-lg mb-2">{displayScene.name}</p>
                  <p className="text-sm opacity-60">Media not available</p>
                </div>
              </div>
            )}

            {/* Canvas overlay for object selection */}
            <canvas
              ref={containerRef}
              className="absolute inset-0 w-full h-full cursor-crosshair"
              width={1920}
              height={1080}
              onMouseDown={(e) => {
                const canvas = containerRef.current
                if (!canvas) return
                
                const rect = canvas.getBoundingClientRect()
                const scaleX = canvas.width / rect.width
                const scaleY = canvas.height / rect.height
                
                const x = (e.clientX - rect.left) * scaleX
                const y = (e.clientY - rect.top) * scaleY
                
                // Simple object selection (you can expand this)
                console.log('Canvas clicked at:', x, y)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Delete' || e.key === 'Backspace') {
                  console.log('Delete selected object')
                }
              }}
              tabIndex={0}
            />
            
            {/* Play/Pause Overlay */}
            <div 
              className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 pointer-events-none"
              onClick={(e) => {
                e.stopPropagation()
                handlePlayToggle()
              }}
              style={{ pointerEvents: 'auto' }}
            >
              <Button
                variant="ghost"
                size="lg"
                onClick={handlePlayToggle}
                className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 text-white"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8" />
                )}
              </Button>
            </div>

            
          </div>
        ) : null}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 border-t border-white/10">
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-2 rounded">
            {error}
          </div>
        </div>
      )}
    </div>
  )
}