'use client'

import { use } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import { shortsService, ShortVideo } from "@/services/shortsService"
import { toast } from "sonner"
import AuthModal from "@/components/AuthModal"
import { ShortsComments } from "@/components/ShortsComments"

interface PublicShortsPageProps {
  params: Promise<{ id: string }>
}

export default function PublicShortsPage({ params }: PublicShortsPageProps) {
  const { id } = use(params)
  const [video, setVideo] = useState<ShortVideo | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isPortrait, setIsPortrait] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadVideo()
  }, [id])

  const loadVideo = async () => {
    try {
      const existingVideo = await shortsService.getShortById(id)
      if (existingVideo && (existingVideo.shareSettings?.accessLevel === 'view' || existingVideo.shareSettings?.accessLevel === 'edit')) {
        setVideo(existingVideo)
      } else {
        toast.error('Video not found or not public')
        router.push('/')
      }
    } catch (error) {
      console.error('Failed to load video:', error)
      toast.error('Failed to load video')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const videoEl = e.currentTarget
    setIsPortrait(videoEl.videoHeight > videoEl.videoWidth)
  }

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Video not found</h2>
          <Button onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-background overflow-hidden">
      <div className="flex h-full">
        {/* Left Side - Video */}
        <div className="flex-1 flex items-center justify-center bg-black">
          <div className="w-full h-full flex items-center justify-center p-4">
            {video.videoUrl ? (
              <video 
                controls 
                className={`rounded-xl ${isPortrait ? 'h-full w-auto' : 'w-full h-auto'}`}
                src={video.videoUrl} 
                preload="metadata" 
                playsInline
                onLoadedMetadata={handleVideoLoad}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="text-center">
                <Play className="w-16 h-16 text-white mb-4 mx-auto" />
                <p className="text-white">Video not available</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Content */}
        <div className="w-96 bg-background border-l flex flex-col h-full">
          {/* Prompt Section */}
          <div className="p-6 border-b flex-shrink-0">
            {video.prompt ? (
              <div>
                <h3 className="font-semibold mb-2">Prompt</h3>
                <p className="text-sm text-muted-foreground">{video.prompt}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No prompt available</p>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="p-6 border-b space-y-3 flex-shrink-0">
            <Button 
              variant="default" 
              size="sm" 
              className="w-full"
              onClick={() => setShowAuthModal(true)}
            >
              Sign Up to Create Videos
            </Button>
          </div>

          {/* Comments Section */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <ShortsComments videoId={id} />
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
      />
    </div>
  )
}