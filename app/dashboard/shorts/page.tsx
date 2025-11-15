"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowUp, Play, Loader2, Volume2, VolumeX } from "lucide-react"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { shortsService, ShortVideo } from "@/services/shortsService"

export default function ShortsPage() {
  const [videos, setVideos] = useState<ShortVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [prompt, setPrompt] = useState("")
  const [generating, setGenerating] = useState(false)
  const [generatingVideoId, setGeneratingVideoId] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState('sora-2')
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null)
  const [mutedVideos, setMutedVideos] = useState<Record<string, boolean>>({})
  const [videoSettings, setVideoSettings] = useState({
    duration: '8',
    size: '1280x720',
    aspectRatio: '16:9'
  })
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadVideos()
    }
  }, [user?.uid])

  const loadVideos = async () => {
    if (!user) return

    try {
      // Load shorts from Firebase and filter out failed ones immediately
      const userShorts = await shortsService.getUserShorts(user.uid)
      const activeVideos = userShorts.filter(video => video.status !== 'failed')
      setVideos(activeVideos)
    } catch (error) {
      console.error('Failed to load videos:', error)
      toast.error('Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim() || !user) return

    setGeneratingVideoId('generating')

    try {
      console.log('🎬 Generating video with model:', selectedModel)
      console.log('📝 Prompt:', prompt)
      console.log('⚙️ Settings:', { duration: videoSettings.duration, size: videoSettings.size, aspectRatio: videoSettings.aspectRatio })

      // Create short in Firebase first
      const shortId = await shortsService.createShort(user.uid, {
        title: `AI Short ${Date.now().toString().slice(-8)}`,
        prompt: prompt.trim(),
        model: selectedModel,
        duration: videoSettings.duration,
        size: videoSettings.size,
        aspectRatio: videoSettings.aspectRatio,
        status: 'in_progress',
        progress: 0
      })

      // Reload videos to show the new one
      await loadVideos()

      // Create video using API
      const response = await fetch('/api/shorts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({
          action: 'generateVideo',
          model: selectedModel,
          prompt: prompt.trim(),
          size: videoSettings.size,
          seconds: videoSettings.duration,
          aspectRatio: videoSettings.aspectRatio
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create video')
      }

      const createData = await response.json()
      console.log('Video creation started:', createData)

      // Update status in Firebase
      await shortsService.updateShortStatus(
        shortId,
        createData.data?.status || 'in_progress',
        createData.data?.progress || 0
      )

      // Handle video completion based on model
      let currentVideo = createData.data
      let videoUrl = ''

      if (selectedModel.startsWith('sora')) {
        // Sora via Replicate returns completed video immediately
        if (currentVideo?.output) {
          if (typeof currentVideo.output === 'string') {
            videoUrl = currentVideo.output
          } else if (currentVideo.output.url) {
            videoUrl = typeof currentVideo.output.url === 'function' 
              ? currentVideo.output.url() 
              : currentVideo.output.url
          }
        }
        currentVideo = { ...currentVideo, status: 'completed' }
      } else {
        // For Kling and Veo, extract URL from output
        if (currentVideo.output) {
          if (typeof currentVideo.output === 'string') {
            videoUrl = currentVideo.output
          } else if (currentVideo.output.url) {
            videoUrl = typeof currentVideo.output.url === 'function' 
              ? currentVideo.output.url() 
              : currentVideo.output.url
          }
        }
        currentVideo = { ...currentVideo, status: 'completed' }
      }

      if (currentVideo?.status === 'completed') {
        await shortsService.updateShortStatus(
          shortId,
          'completed',
          100,
          videoUrl
        )
        console.log('Video generation completed')
      } else if (currentVideo?.status === 'failed') {
        await shortsService.updateShortStatus(
          shortId,
          'failed',
          undefined,
          undefined,
          currentVideo.error || { message: 'Video generation failed' }
        )
        throw new Error(currentVideo.error?.message || 'Video generation failed')
      }

      // Reload videos to show updated status
      await loadVideos()
      setPrompt("")
    } catch (error) {
      console.error('Error generating video:', error)

      // Update status to failed so it gets removed from UI
      if (generatingVideoId !== 'generating') {
        try {
          const userShorts = await shortsService.getUserShorts(user.uid)
          const lastShort = userShorts[0] // Get most recent short
          if (lastShort && lastShort.status === 'in_progress') {
            await shortsService.updateShortStatus(
              lastShort.id,
              'failed',
              undefined,
              undefined,
              { message: error instanceof Error ? error.message : 'Generation failed' }
            )
            await loadVideos() // Reload to remove failed video from UI
          }
        } catch (updateError) {
          console.error('Failed to update video status:', updateError)
        }
      }

      toast.error(`Error generating video: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setGeneratingVideoId(null)
    }
  }

  const handleVideoClick = (videoId: string) => {
    router.push(`/dashboard/shorts/${videoId}`)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'in_progress':
        return 'text-yellow-600'
      case 'queued':
        return 'text-blue-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-600'
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

  return (
    <div className="min-h-screen p-6 pb-32">
      <div className="max-w-7xl mx-auto">
        {/* Videos Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <Card key={video.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <div
                onMouseEnter={() => setHoveredVideoId(video.id)}
                onMouseLeave={() => setHoveredVideoId(null)}
              >
                <div 
                  className="aspect-[9/16] bg-muted rounded-t-lg flex items-center justify-center relative overflow-hidden"
                  onClick={() => handleVideoClick(video.id)}
                >
                  {video.videoUrl ? (
                    <>
                      <video
                        className="w-full h-full object-contain rounded-t-lg"
                        src={video.videoUrl}
                        muted={mutedVideos[video.id] !== false}
                        loop
                        preload="metadata"
                        onMouseEnter={(e) => {
                          e.stopPropagation();
                          (e.target as HTMLVideoElement).play();
                        }}
                        onMouseLeave={(e) => {
                          e.stopPropagation();
                          const videoElement = e.target as HTMLVideoElement;
                          videoElement.pause();
                          videoElement.currentTime = 0;
                        }}
                      />

                      {/* Mute/Unmute Toggle - appears on hover */}
                      {hoveredVideoId === video.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMutedVideos(prev => ({
                              ...prev,
                              [video.id]: prev[video.id] === false ? true : false
                            }));
                          }}
                          className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black/80 p-2 rounded-full transition-colors"
                        >
                          {mutedVideos[video.id] !== false ? (
                            <VolumeX className="w-4 h-4 text-white" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-white" />
                          )}
                        </button>
                      )}
                    </>
                  ) : video.status === 'in_progress' || video.status === 'queued' ? (
                    <div className="relative w-full h-full bg-black/80 flex flex-col items-center justify-center rounded-t-lg">
                      <Loader2 className="w-8 h-8 animate-spin mb-2 text-white" />
                      <p className="text-xs text-white mb-2">Generating...</p>
                      {video.progress !== undefined && (
                        <div className="w-20 bg-white/20 rounded-full h-1">
                          <div
                            className="bg-white h-1 rounded-full transition-all duration-300"
                            style={{ width: `${video.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  
                  ) : (
                    <Play className="w-12 h-12 text-muted-foreground" />
                  )}

                  {video.videoUrl && (
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-t-lg flex items-center justify-center pointer-events-none">
                      <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>


              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Fixed Prompt Box */}
      <div className="fixed bottom-4 md:bottom-4 bottom-20 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-3xl px-4">
        <div className="relative rounded-2xl border border-border bg-background shadow-lg focus-within:shadow-xl transition-shadow">
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Describe your video...`}
              rows={3}
              className="resize-none text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[100px] pl-3 pr-14 pb-12"
            />

            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="h-6 text-xs bg-muted border-none w-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sora-2">Sora 2</SelectItem>
                  <SelectItem value="sora-2-pro">Sora 2 Pro</SelectItem>
                  <SelectItem value="kling">Kling</SelectItem>
                  <SelectItem value="veo">Veo</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={videoSettings.duration}
                onValueChange={(value) => setVideoSettings(prev => ({...prev, duration: value}))}
              >
                <SelectTrigger className="h-6 text-xs bg-muted border-none w-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5s</SelectItem>
                  <SelectItem value="8">8s</SelectItem>
                  <SelectItem value="10">10s</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={videoSettings.aspectRatio}
                onValueChange={(value) => setVideoSettings(prev => ({...prev, aspectRatio: value}))}
              >
                <SelectTrigger className="h-6 text-xs bg-muted border-none w-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9</SelectItem>
                  <SelectItem value="9:16">9:16</SelectItem>
                  <SelectItem value="1:1">1:1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Button
                onClick={handleGenerate}
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-foreground hover:bg-foreground/90 text-background disabled:opacity-50"
                disabled={generatingVideoId !== null || !prompt.trim()}
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  )
}