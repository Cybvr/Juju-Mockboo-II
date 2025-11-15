
"use client"
import { use } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Play, X, Download, Share, Loader2, Sparkles, MoreHorizontal, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { shortsService, ShortVideo } from "@/services/shortsService"
import { toast } from "sonner"
import { ShareModal } from "@/components/ShareModal"

interface ShortsPageProps {
  params: Promise<{ id: string }>
}

export default function ShortsPage({ params }: ShortsPageProps) {
  const { id } = use(params)
  const [video, setVideo] = useState<ShortVideo | null>(null)
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [model, setModel] = useState("sora-2")
  const [duration, setDuration] = useState("8")
  const [size, setSize] = useState("1280x720")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isNewVideo, setIsNewVideo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    loadVideo()
  }, [id, user])

  const loadVideo = async () => {
    try {
      const existingVideo = await shortsService.getShortById(id)
      if (existingVideo) {
        setVideo(existingVideo)
        setTitle(existingVideo.title || "")
        setPrompt(existingVideo.prompt || "")
        setModel(existingVideo.model || "sora-2")
        setDuration(existingVideo.duration || "8")
        setSize(existingVideo.size || "1280x720")
      } else if (user) {
        // New video - only if user is logged in
        setIsNewVideo(true)
        const newVideo: Omit<ShortVideo, 'createdAt' | 'updatedAt'> = {
          id,
          userId: user.uid,
          title: "",
          prompt: "",
          status: 'queued',
          duration: "8",
          size: "1280x720",
          model: "sora-2"
        }
        setVideo(newVideo as ShortVideo)
      } else {
        toast.error('Video not found')
        router.push('/')
        return
      }
    } catch (error) {
      console.error('Failed to load video:', error)
      toast.error('Failed to load video')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim() || !user) return
    setIsGenerating(true)
    
    try {
      console.log('Creating Sora video with params:', { model, prompt, size, duration })
      
      let shortId = id
      
      if (isNewVideo) {
        // Create new short in Firebase
        shortId = await shortsService.createShort(user.uid, {
          title: title || `AI Short ${id.slice(-8)}`,
          prompt: prompt.trim(),
          model,
          duration,
          size,
          status: 'in_progress',
          progress: 0
        })
      } else {
        // Update existing short
        await shortsService.updateShort(id, {
          title: title || `AI Short ${id.slice(-8)}`,
          prompt: prompt.trim(),
          model,
          duration,
          size,
          status: 'in_progress',
          progress: 0
        })
      }
      
      // Create video using API
      const response = await fetch('/api/shorts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({ action: 'generateVideo', model, prompt: prompt.trim(), size, seconds: duration, aspectRatio: size === '720x1280' ? '9:16' : '16:9' }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create video')
      }
      
      const createData = await response.json()
      console.log('Video creation started:', createData)

      // Update video status
      await shortsService.updateShortStatus(
        shortId,
        createData.status,
        createData.progress || 0
      )

      // Poll for completion
      let currentVideo = createData
      while (currentVideo.status === 'in_progress' || currentVideo.status === 'queued') {
        await new Promise(resolve => setTimeout(resolve, 3000))
        const statusResponse = await fetch(`/api/videos/sora/${currentVideo.id}`, {
          headers: {
            'x-user-id': user.uid,
          }
        })
        currentVideo = await statusResponse.json()
        console.log('Video status:', currentVideo.status, 'Progress:', currentVideo.progress)

        // Update progress in Firebase
        await shortsService.updateShortStatus(
          shortId,
          currentVideo.status,
          currentVideo.progress || 0
        )
      }

      if (currentVideo.status === 'completed') {
        // Download the video content
        const downloadResponse = await fetch(`/api/videos/sora/${currentVideo.id}/content`, {
          headers: {
            'x-user-id': user.uid,
          }
        })
        
        if (downloadResponse.ok) {
          const videoBlob = await downloadResponse.blob()
          const videoUrl = URL.createObjectURL(videoBlob)
          
          // Update with completed video
          await shortsService.updateShortStatus(
            shortId,
            'completed',
            100,
            videoUrl
          )
          
          console.log('Video generation completed')
        } else {
          throw new Error('Failed to download video content')
        }
      } else if (currentVideo.status === 'failed') {
        await shortsService.updateShortStatus(
          shortId,
          'failed',
          undefined,
          undefined,
          currentVideo.error || { message: 'Video generation failed' }
        )
        throw new Error(currentVideo.error?.message || 'Video generation failed')
      }
      
      // Reload the video to show updates
      await loadVideo()
      
    } catch (error) {
      console.error('Error generating video:', error)
      toast.error(`Error generating video: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (video?.videoUrl) {
      const link = document.createElement('a')
      link.href = video.videoUrl
      link.download = `${video.title || 'sora-video'}.mp4`
      link.click()
    }
  }

  const handleShare = async () => {
    if (navigator.share && video?.videoUrl) {
      try {
        await navigator.share({
          title: video.title || 'AI Generated Video',
          text: video.prompt,
          url: video.videoUrl
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(video?.videoUrl || window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      if (video && !isNewVideo) {
        await shortsService.deleteShort(video.id)
      }
      router.push('/dashboard/shorts')
    } catch (error) {
      console.error('Failed to delete video:', error)
      toast.error('Failed to delete video')
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <p className="text-foreground">Video not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/shorts')} className="flex items-center gap-2" >
            <X className="w-4 h-4" />
          </Button>
          <div className="flex-1" />
          {video.status === 'completed' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShareModalOpen(true)}>
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive" >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Preview */}
          <div className="border rounded-lg shadow-sm">
            <div className="">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                {video.videoUrl ? (
                  <video controls className="w-full h-full rounded-lg" src={video.videoUrl} preload="metadata" playsInline>
                    Your browser does not support the video tag.
                  </video>
                ) : isGenerating ? (
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mb-4 mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Generating with Sora...
                    </p>
                    {video.progress !== undefined && (
                      <div className="w-48 bg-muted rounded-full h-2 mt-2">
                        <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${video.progress}%` }} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <Play className="w-16 h-16 text-muted-foreground mb-4 mx-auto" />
                    <p className="text-muted-foreground">Your video will appear here</p>
                  </div>
                )}
              </div>
              {video.status === 'failed' && (
                <div className="text-center text-red-600">
                  <p className="text-sm">
                    {video.error?.message || 'Generation failed'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Generation Controls */}
          <div className="border rounded-lg shadow-sm">
            <div className="p-6 space-y-6 pt-6">
              {/* Prompt */}
              <div className="space-y-2">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your video in detail. Include shot type, subject, action, setting, and lighting..."
                  disabled={isGenerating}
                  className="min-h-[120px] resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        document={video}
        type="video"
      />

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop - clicking closes dialog */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setDeleteDialogOpen(false)}
          />

          {/* Dialog Content */}
          <div className="relative bg-background border rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Delete Video</h3>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete "{video?.title || 'this video'}"? This action cannot be undone.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
