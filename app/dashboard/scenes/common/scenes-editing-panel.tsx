"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Image, Video, Upload } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { documentService } from "@/services/documentService"
import { Document } from "@/types/firebase"
import { Scene } from "./scenes-video-editor"
import { ImageWithHoverActions } from "@/components/ImageWithHoverActions"

interface ScenesEditingPanelProps {
  onAddScene: (scene: Omit<Scene, 'id'>) => void;
  selectedScene?: Scene;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
}

export function ScenesEditingPanel({ onAddScene, selectedScene, onUpdateScene }: ScenesEditingPanelProps) {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all')

  useEffect(() => {
    const loadUserDocuments = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const userDocs = await documentService.getUserRecentDocuments(user.uid, 100)
        setDocuments(userDocs)
      } catch (error) {
        console.error("Failed to load documents:", error)
      } finally {
        setLoading(false)
      }
    }
    loadUserDocuments()
  }, [user])

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true
    return doc.type === filter
  })

  const handleAddFromMedia = (document: Document) => {
    const imageUrl = document.content?.imageUrls?.[0]
    const videoUrl = document.content?.videoUrls?.[0]

    onAddScene({
      name: document.title,
      imageUrl,
      videoUrl,
      type: document.type === 'video' ? 'video' : 'image',
      duration: 3.0
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        onAddScene({
          name: file.name.replace(/\.[^/.]+$/, ""),
          imageUrl: file.type.startsWith('image/') ? result : undefined,
          videoUrl: file.type.startsWith('video/') ? result : undefined,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          duration: 3.0
        })
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Failed to upload file:', error)
    }

    e.target.value = ""
  }

  return (
    <div className="h-full flex flex-col bg-card/30">
      {/* Compact Header */}
      <div className="px-3 py-2.5 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Scene Editor</h2>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Upload
          </Button>
        </div>

        {/* Compact Filter Buttons */}
        <div className="flex gap-1">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
            className="h-6 px-2 text-xs font-normal"
          >
            All
          </Button>
          <Button
            variant={filter === 'image' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('image')}
            className="h-6 px-2 text-xs font-normal"
          >
            <Image className="w-3 h-3 mr-1" />
            Images
          </Button>
          <Button
            variant={filter === 'video' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('video')}
            className="h-6 px-2 text-xs font-normal"
          >
            <Video className="w-3 h-3 mr-1" />
            Videos
          </Button>
        </div>
      </div>

      {/* Media Library */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="text-xs font-medium text-muted-foreground mb-2 px-0.5">Media Library</div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-4 h-4 border border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredDocuments.map((doc) => {
              const thumbnailUrl = doc.content?.imageUrls?.[0] || doc.content?.videoUrls?.[0]
              const isVideo = doc.type === 'video' || doc.content?.videoUrls?.length > 0

              return (
                <div
                  key={doc.id}
                  className="relative group cursor-pointer bg-muted/50 rounded-md overflow-hidden aspect-square hover:bg-muted/70 transition-colors"
                  onClick={() => handleAddFromMedia(doc)}
                >
                  {thumbnailUrl ? (
                    isVideo ? (
                      <video
                        src={thumbnailUrl}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={thumbnailUrl}
                        alt={doc.title}
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {isVideo ? (
                        <Video className="w-6 h-6 text-muted-foreground/60" />
                      ) : (
                        <Image className="w-6 h-6 text-muted-foreground/60" />
                      )}
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <Plus className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                    <p className="text-xs text-white/90 truncate leading-tight">{doc.title}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Scene Properties */}
      {selectedScene && (
        <div className="border-t border-border/50 px-3 py-2.5">
          <div className="text-xs font-medium text-muted-foreground mb-2">Scene Properties</div>
          <div className="space-y-2">
            <div>
              <Label htmlFor="scene-name" className="text-xs text-muted-foreground">Name</Label>
              <Input
                id="scene-name"
                value={selectedScene.name}
                onChange={(e) => onUpdateScene(selectedScene.id, { name: e.target.value })}
                className="mt-1 h-7 text-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}