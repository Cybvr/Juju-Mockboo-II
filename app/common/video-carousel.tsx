import { useState, useRef, useEffect } from "react"

interface Video {
  id: string
  src: string
  title?: string
  description?: string
}

interface VideoCarouselProps {
  videos?: Video[]
  autoPlay?: boolean
  autoScrollSpeed?: number
  className?: string
  showTitle?: boolean
}

// Default demo videos
const defaultVideos: Video[] = [
  { id: '1', src: '/assets/videos/1.mp4', title: 'Demo Video 1' },
  { id: '2', src: '/assets/videos/2.mp4', title: 'Demo Video 2' },
  { id: '3', src: '/assets/videos/3.mp4', title: 'Demo Video 3' },
  { id: '4', src: '/assets/videos/4.mp4', title: 'Demo Video 4' },
  { id: '5', src: '/assets/videos/5.mp4', title: 'Demo Video 5' }
]

export function VideoCarousel({
  videos = defaultVideos,
  autoPlay = true,
  autoScrollSpeed = 0.3,
  className = "",
  showTitle = false
}: VideoCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())

  // Triple the videos for seamless infinite scroll
  const duplicatedVideos = [...videos, ...videos, ...videos]

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let animationId: number
    let isAnimating = true

    const animate = () => {
      if (container && isAnimating) {
        container.scrollLeft += autoScrollSpeed

        // Reset scroll position for infinite effect
        const singleSetWidth = container.scrollWidth / 3
        if (container.scrollLeft >= singleSetWidth * 2) {
          container.scrollLeft = singleSetWidth
        }
      }
      animationId = requestAnimationFrame(animate)
    }

    // Start animation after a brief delay to ensure layout is ready
    const timeoutId = setTimeout(() => {
      if (container.scrollWidth > container.clientWidth) {
        // Set initial position to middle set for seamless loop
        container.scrollLeft = container.scrollWidth / 3
        animationId = requestAnimationFrame(animate)
      }
    }, 100)

    return () => {
      isAnimating = false
      clearTimeout(timeoutId)
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [autoScrollSpeed])

  useEffect(() => {
    // Autoplay videos with a delay to ensure they're loaded
    if (autoPlay) {
      const timer = setTimeout(() => {
        videoRefs.current.forEach((video) => {
          video.muted = true
          video.loop = true
          video.play().catch(err => console.log("Autoplay prevented:", err))
        })
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [autoPlay, duplicatedVideos])

  return (
    <div className={`py-16 ${className}`}>
      <div className="relative w-full px-6">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-scroll"
          style={{ 
            scrollbarWidth: "none", 
            msOverflowStyle: "none",
            scrollBehavior: "auto"
          }}
        >
          <style>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {duplicatedVideos.map((video, index) => (
            <div
              key={`${video.id}-${index}`}
              className="flex-none w-[calc(100%-2rem)] sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.667rem)] lg:w-[calc(25%-0.75rem)] xl:w-[calc(20%-0.8rem)]"
            >
              <div className="relative bg-black rounded-lg overflow-hidden group" style={{ aspectRatio: "9/16" }}>
                <video
                  ref={(el) => {
                    if (el) {
                      videoRefs.current.set(`${video.id}-${index}`, el)
                      el.muted = true
                      el.loop = true
                      if (autoPlay) {
                        el.play().catch(err => console.log("Autoplay prevented:", err))
                      }
                    }
                  }}
                  src={video.src}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  playsInline
                  autoPlay
                />
                {showTitle && video.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-white text-sm font-semibold">{video.title}</h3>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VideoCarousel