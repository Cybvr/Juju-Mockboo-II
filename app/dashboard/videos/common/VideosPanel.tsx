
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Video, Upload, Plus } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { documentService } from "@/services/documentService"
import { Document } from "@/types/firebase"
import { ImageWithHoverActions } from "@/components/ImageWithHoverActions"

interface VideosPanelProps {
  onAddToScene?: (videoUrl: string) => void
}

export function VideosPanel({ onAddToScene }: VideosPanelProps) {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [videos, setVideos] = useState<Document[]>([])
  const [filteredVideos, setFilteredVideos] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVideos()
  }, [user])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = videos.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.metadata?.prompt?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredVideos(filtered)
    } else {
      setFilteredVideos(videos)
    }
  }, [searchQuery, videos])

  const loadVideos = async () => {
    if (!user) return

    try {
      setLoading(true)
      const userVideos = await documentService.getUserDocuments(user.uid, 'video')
      setVideos(userVideos)
      setFilteredVideos(userVideos)
    } catch (error) {
      console.error('Error loading videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToBoard = (documentId: string, videoUrl: string) => {
    const videoData = {
      url: videoUrl,
      name: `Video ${documentId}`,
      documentId: documentId,
      addedAt: new Date().toISOString(),
      type: 'video'
    }
    
    const existingItems = JSON.parse(localStorage.getItem('boardImages') || '[]')
    const alreadyExists = existingItems.some((item: any) => item.url === videoUrl)
    
    if (!alreadyExists) {
      existingItems.push(videoData)
      localStorage.setItem('boardImages', JSON.stringify(existingItems))
    }
  }

  return (
    <div className="w-80 border-r border-border bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Video className="w-4 h-4" />
          <h2 className="font-semibold text-sm">Videos</h2>
        </div>

        {/* Search */}
        <Input
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-3"
        />

        {/* Upload Button */}
        <Button 
          variant="outline" 
          className="w-full border-dashed"
          onClick={() => {
            // Handle video upload
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'video/*'
            input.onchange = (e) => {
              // Handle file upload logic here
              console.log('Upload video:', (e.target as HTMLInputElement).files?.[0])
            }
            input.click()
          }}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Video
        </Button>
      </div>

      {/* Videos Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
            <p className="text-sm">Loading videos...</p>
          </div>
        )}

        {!loading && filteredVideos.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
            <Video className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No videos found</p>
            <p className="text-xs">Upload or generate videos</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors cursor-pointer group relative"
            >
              <div className="relative w-full h-full group">
                {video.url ? (
                  <video
                    src={video.url}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                    onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Video className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                
                <ImageWithHoverActions
                  imageUrl={video.url || ''}
                  imageName={video.title}
                  documentId={video.id}
                  onAddToBoard={handleAddToBoard}
                  mediaType="video"
                />

                {/* Add to Scene Button */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => {
                      if (video.url && onAddToScene) {
                        onAddToScene(video.url)
                      }
                    }}
                  >
                    <Plus className="w-3 w-3 mr-1" />
                    Add to Scene
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
