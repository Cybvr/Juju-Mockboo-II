"use client"

import { useState, useEffect, useRef } from "react"
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
  const videoRef = useRef<HTMLVideoElement>(null)

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
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-6">
              {currentScene && (
                <>
                  {currentScene.type === 'video' && currentScene.videoUrl ? (
                    <video
                      ref={videoRef}
                      src={currentScene.videoUrl}
                      className="w-full h-full object-contain"
                      muted
                      autoPlay={isPlaying}
                      loop
                    />
                  ) : currentScene.imageUrl ? (
                    <img
                      src={currentScene.imageUrl}
                      alt={currentScene.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <Play className="w-16 h-16 mx-auto mb-2" />
                        <p>{currentScene.name}</p>
                      </div>
                    </div>
                  )}


                </>
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