"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, GripVertical, Play, Pause, SkipBack, SkipForward, ZoomIn, ZoomOut } from "lucide-react"
import { Scene } from "./scenes-video-editor"

interface ScenesTimelineProps {
  scenes: Scene[];
  selectedSceneId: string | null;
  onSelectScene: (sceneId: string) => void;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
  onRemoveScene: (sceneId: string) => void;
  onReorderScenes: (fromIndex: number, toIndex: number) => void;
  currentTime?: number;
  onTimeChange?: (time: number) => void;
  isPlaying?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
}

export function ScenesTimeline({
  scenes,
  selectedSceneId,
  onSelectScene,
  onUpdateScene,
  onRemoveScene,
  onReorderScenes,
  currentTime = 0,
  onTimeChange,
  isPlaying = false,
  onPlayStateChange
}: ScenesTimelineProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isDraggingScrubber, setIsDraggingScrubber] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [scrollPosition, setScrollPosition] = useState(0)
  const timelineRef = useRef<HTMLDivElement>(null)
  const scrubberRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const timelineScrollRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()

  // Auto-advance time when playing
  useEffect(() => {
    if (isPlaying && onTimeChange) {
      const startTime = performance.now()
      const initialTime = currentTime

      const updateTime = () => {
        const elapsed = (performance.now() - startTime) / 1000
        const newTime = initialTime + elapsed
        const totalDuration = getTotalDuration()

        if (newTime >= totalDuration) {
          onTimeChange(totalDuration)
          if (onPlayStateChange) onPlayStateChange(false)
        } else {
          onTimeChange(newTime)
          animationFrameRef.current = requestAnimationFrame(updateTime)
        }
      }

      animationFrameRef.current = requestAnimationFrame(updateTime)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, currentTime, onTimeChange, onPlayStateChange])

  // Sync scroll between ruler and timeline
  useEffect(() => {
    const rulerScroll = scrollContainerRef.current
    const timelineScroll = timelineScrollRef.current

    if (!rulerScroll || !timelineScroll) return

    const syncScroll = (source: HTMLElement, target: HTMLElement) => {
      target.scrollLeft = source.scrollLeft
    }

    const handleRulerScroll = () => syncScroll(rulerScroll, timelineScroll)
    const handleTimelineScroll = () => syncScroll(timelineScroll, rulerScroll)

    rulerScroll.addEventListener('scroll', handleRulerScroll)
    timelineScroll.addEventListener('scroll', handleTimelineScroll)

    return () => {
      rulerScroll.removeEventListener('scroll', handleRulerScroll)
      timelineScroll.removeEventListener('scroll', handleTimelineScroll)
    }
  }, [])

  // Auto-scroll to keep scrubber visible
  useEffect(() => {
    if (timelineScrollRef.current && timelineRef.current) {
      const container = timelineScrollRef.current
      const timeline = timelineRef.current
      const containerWidth = container.clientWidth
      const timelineWidth = timeline.scrollWidth
      const scrubberPosition = getScrubberPosition()
      const scrubberPixelPos = (scrubberPosition / 100) * timelineWidth

      const scrollLeft = container.scrollLeft
      const scrollRight = scrollLeft + containerWidth

      if (scrubberPixelPos < scrollLeft + 50) {
        container.scrollLeft = Math.max(0, scrubberPixelPos - 50)
      } else if (scrubberPixelPos > scrollRight - 50) {
        container.scrollLeft = scrubberPixelPos - containerWidth + 50
      }
    }
  }, [currentTime, zoomLevel])

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorderScenes(draggedIndex, dropIndex)
    }
    setDraggedIndex(null)
  }

  const getTotalDuration = () => {
    // Use actual video durations when available, fall back to scene duration
    return scenes.reduce((sum, scene) => {
      if (scene.type === 'video' && scene.videoUrl) {
        // For now use scene duration, but this should ideally get actual video duration
        return sum + scene.duration
      }
      return sum + scene.duration
    }, 0)
  }

  const getSceneStartTime = (sceneIndex: number) => {
    return scenes.slice(0, sceneIndex).reduce((sum, scene) => sum + scene.duration, 0)
  }

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || isDraggingScrubber) return

    const rect = timelineRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const totalDuration = getTotalDuration()
    const newTime = percentage * totalDuration

    if (onTimeChange) {
      onTimeChange(Math.max(0, Math.min(newTime, totalDuration)))
    }

    let accumulatedTime = 0
    for (let i = 0; i < scenes.length; i++) {
      if (newTime <= accumulatedTime + scenes[i].duration) {
        onSelectScene(scenes[i].id)
        break
      }
      accumulatedTime += scenes[i].duration
    }
  }

  // Handle scrubber dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingScrubber || !timelineRef.current) return

      const rect = timelineRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const percentage = Math.max(0, Math.min(1, clickX / rect.width))
      const totalDuration = getTotalDuration()
      const newTime = percentage * totalDuration

      if (onTimeChange) {
        onTimeChange(newTime)
      }
    }

    const handleMouseUp = () => {
      setIsDraggingScrubber(false)
    }

    if (isDraggingScrubber) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDraggingScrubber, onTimeChange])

  const getScrubberPosition = () => {
    const totalDuration = getTotalDuration()
    if (totalDuration === 0) return 0
    const position = (currentTime / totalDuration) * 100
    return Math.max(0, Math.min(100, position))
  }

  const getTimelineWidth = () => {
    const baseWidth = Math.max(scenes.length * 120, 800)
    return baseWidth * zoomLevel
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.5, 10))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.1))
  }

  const handleZoomFit = () => {
    setZoomLevel(1)
  }

  const getTimeMarks = () => {
    const totalDuration = getTotalDuration()
    if (totalDuration === 0) return []

    let interval = 1
    if (zoomLevel > 3) interval = 0.5
    if (zoomLevel > 6) interval = 0.1
    if (totalDuration > 60 && zoomLevel < 2) interval = 5
    if (totalDuration > 300 && zoomLevel < 1) interval = 10

    const marks = []
    for (let i = 0; i <= totalDuration; i += interval) {
      marks.push(i)
    }
    return marks
  }

  const formatTime = (time: number) => {
    if (time >= 60) {
      const minutes = Math.floor(time / 60)
      const seconds = Math.floor(time % 60)
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
    return `${Math.floor(time)}s`
  }

return (
    <div className="h-full flex flex-col bg-card/50">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {/* Zoom Controls - Left */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="h-7 w-7 p-0"
              disabled={zoomLevel <= 0.1}
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomFit}
              className="h-7 px-2 text-xs"
            >
              Fit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="h-7 w-7 p-0"
              disabled={zoomLevel >= 10}
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-12">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>

          {/* Playback Controls - Center */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (onTimeChange) onTimeChange(0)
              }}
              className="h-7 w-7 p-0"
            >
              <SkipBack className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (onPlayStateChange) onPlayStateChange(!isPlaying)
              }}
              className="h-7 w-7 p-0"
            >
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const totalDuration = getTotalDuration()
                if (onTimeChange) onTimeChange(totalDuration)
              }}
              className="h-7 w-7 p-0"
            >
              <SkipForward className="h-3 w-3" />
            </Button>
          </div>

          {/* Timeline Info - Right */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{formatTime(currentTime)} / {formatTime(getTotalDuration())}</span>
            <span>{scenes.length} scenes</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {scenes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <p>No scenes added yet</p>
              <p className="text-xs mt-1">Add media from the panel to get started</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Time Ruler */}
            <div 
              ref={scrollContainerRef}
              className="h-10 border-b border-border bg-muted/20 relative overflow-x-auto"
              style={{ 
                scrollbarWidth: 'thin',
                scrollbarColor: 'hsl(var(--border)) transparent'
              }}
            >
              <div 
                className="h-full relative bg-background/80"
                style={{ width: `${getTimelineWidth()}px` }}
              >
                {getTimeMarks().map((time) => {
                  const totalDuration = getTotalDuration()
                  const position = totalDuration > 0 ? (time / totalDuration) * 100 : 0
                  const isSecond = time % 1 === 0
                  const isMajor = time % (Math.max(1, Math.floor(getTotalDuration() / 10))) === 0

                  return (
                    <div
                      key={time}
                      className="absolute top-0 h-full flex flex-col justify-between"
                      style={{ left: `${position}%` }}
                    >
                      <span className="text-xs text-muted-foreground pt-1 whitespace-nowrap select-none">
                        {(isSecond && (isMajor || zoomLevel > 2)) ? formatTime(time) : ''}
                      </span>
                      <div
                        className={`w-px bg-border ${
                          isMajor ? 'h-6 bg-foreground/20' : 
                          isSecond ? 'h-4 bg-foreground/15' : 'h-2 bg-foreground/10'
                        }`}
                      />
                    </div>
                  )
                })}

                {/* Ruler Scrubber */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-blue-500 z-10 pointer-events-none"
                  style={{ left: `${getScrubberPosition()}%` }}
                >
                  <div className="absolute top-0 -left-1 w-3 h-3 bg-blue-500 rounded-sm" />
                </div>
              </div>
            </div>

            {/* Timeline Track */}
            <div 
              className="flex-1 overflow-x-auto" 
              ref={timelineScrollRef}
              style={{ 
                scrollbarWidth: 'thin',
                scrollbarColor: 'hsl(var(--border)) transparent'
              }}
            >
              <div
                ref={timelineRef}
                className="h-full relative bg-background cursor-pointer select-none"
                style={{ width: `${getTimelineWidth()}px`, minHeight: '100px' }}
                onClick={handleTimelineClick}
              >
                {/* Scenes Track */}
                <div className="h-24 flex relative border-b border-border/30">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-b border-border/20 absolute top-0 left-0 right-0 bg-background/80">
                    Video Scenes
                  </div>
                  <div className="flex mt-6 h-16">
                    {scenes.map((scene, index) => {
                      const isSelected = scene.id === selectedSceneId
                      const thumbnailUrl = scene.imageUrl || scene.videoUrl
                      const startTime = getSceneStartTime(index)
                      const totalDuration = getTotalDuration()
                      const width = totalDuration > 0 ? (scene.duration / totalDuration) * 100 : 100 / scenes.length
                      const minWidth = 100

                      return (
                        <div
                          key={scene.id}
                          className={`
                            relative group cursor-pointer border-r border-border/40
                            ${isSelected ? 'bg-primary/8 ring-1 ring-primary/20' : 'bg-card hover:bg-card/90'}
                            transition-all duration-150 flex-shrink-0
                          `}
                          style={{
                            width: `${Math.max((scene.duration / totalDuration) * 100, minWidth / getTimelineWidth() * 100)}%`,
                            minWidth: `${minWidth}px`
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectScene(scene.id)
                          }}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                        >
                          {/* Thumbnail */}
                          <div className="h-12 mx-2 mt-1 rounded-sm overflow-hidden bg-muted/50 flex items-center justify-center border border-border/50">
                            {thumbnailUrl ? (
                              scene.type === 'video' ? (
                                <video
                                  src={thumbnailUrl}
                                  className="w-full h-full object-cover"
                                  muted
                                />
                              ) : (
                                <img
                                  src={thumbnailUrl}
                                  alt={scene.name}
                                  className="w-full h-full object-cover"
                                />
                              )
                            ) : (
                              <div className="text-xs text-muted-foreground text-center px-2">
                                {scene.name.length > 30 ? `Scene ${index + 1}` : scene.name}
                              </div>
                            )}
                          </div>

                          {/* Duration Control */}
                          <div 
                            className="absolute bottom-1 left-2 text-xs bg-black/70 text-white px-1 rounded cursor-pointer hover:bg-black/90"
                            onClick={(e) => {
                              e.stopPropagation()
                              const newDuration = prompt(`Set duration for ${scene.name} (seconds):`, scene.duration.toString())
                              if (newDuration && !isNaN(Number(newDuration))) {
                                onUpdateScene(scene.id, { duration: Number(newDuration) })
                              }
                            }}
                            title="Click to edit duration"
                          >
                            {scene.duration}s
                          </div>

                          {/* Crop handles */}
                          <div
                            className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/60 cursor-w-resize opacity-0 group-hover:opacity-100 transition-opacity"
                            onMouseDown={(e) => {
                              e.stopPropagation()
                              console.log('Start crop from left')
                            }}
                            title="Crop start"
                          />
                          <div
                            className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500/60 cursor-e-resize opacity-0 group-hover:opacity-100 transition-opacity"
                            onMouseDown={(e) => {
                              e.stopPropagation()
                              console.log('Crop from right')
                            }}
                            title="Crop end"
                          />

                          {/* Controls */}
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-5 w-5 p-0 bg-background/80 hover:bg-background"
                              onClick={(e) => {
                                e.stopPropagation()
                                onRemoveScene(scene.id)
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Drag Handle */}
                          <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="h-3 w-3 text-muted-foreground/60" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Audio Track */}
                <div className="h-16 border-b border-border/30 bg-muted/20">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-b border-border/20">
                    Audio Track
                  </div>
                  <div className="h-10 relative bg-card/50 flex items-center px-2">
                    <div className="text-xs text-muted-foreground">Drop audio files here or use Audio panel</div>
                  </div>
                </div>
                    

                {/* Main Timeline Scrubber */}
                <div
                  ref={scrubberRef}
                  className="absolute top-0 bottom-0 w-px bg-blue-500 z-20 cursor-col-resize"
                  style={{ left: `${getScrubberPosition()}%` }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    setIsDraggingScrubber(true)
                  }}
                >
                  <div 
                    className={`
                      absolute -top-1 -left-2 w-5 h-5 bg-blue-500 rounded-sm 
                      cursor-col-resize hover:bg-blue-400 active:bg-blue-600
                      transition-colors shadow-sm border border-white/20
                      ${isDraggingScrubber ? 'scale-110' : 'hover:scale-105'}
                    `}
                    style={{ transition: 'all 0.15s ease' }}
                  />
                  <div className="absolute top-0 left-0 w-px h-full bg-blue-500/80 shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        ::-webkit-scrollbar {
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--foreground) / 0.3);
        }
      `}</style>
    </div>
  )
}