
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, Heart } from "lucide-react"
import { documentService } from '@/services/documentService'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

interface HistoryItem {
  id: string
  thumbnail: string
  timestamp: string
  liked: boolean
  title: string
  type: string
}

interface HistoryPanelProps {
  type?: 'image' | 'video' | 'mockup' | 'upscale' | 'all'
  showActions?: boolean
  layout?: 'grid' | 'list'
  maxItems?: number
}

export function HistoryPanel({ 
  type = 'all', 
  showActions = false,
  layout = 'grid',
  maxItems = 10 
}: HistoryPanelProps) {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
  const [user] = useAuthState(auth)
  const router = useRouter()

  useEffect(() => {
    const loadRecentDocuments = async () => {
      if (!user) return

      try {
        const documents = await documentService.getRecentDocuments(maxItems)
        
        // Filter documents based on type
        let filteredDocs = documents
        if (type !== 'all') {
          filteredDocs = documents.filter(doc => {
            if (type === 'image') return doc.type === 'image' && doc.content?.imageUrls
            if (type === 'video') return doc.type === 'video' && doc.content?.videoUrls
            if (type === 'mockup') return doc.type === 'mockup' && doc.content?.imageUrls
            if (type === 'upscale') return doc.type === 'upscale' && doc.content?.imageUrls
            return true
          })
        } else {
          // For 'all', filter to only documents with media
          filteredDocs = documents.filter(doc => 
            doc.content?.imageUrls || doc.content?.videoUrls
          )
        }

        const items: HistoryItem[] = filteredDocs.map(doc => ({
          id: doc.id,
          thumbnail: doc.content?.imageUrls?.[0] || doc.content?.videoUrls?.[0] || "/placeholder.svg",
          timestamp: formatTimestamp(doc.updatedAt),
          liked: doc.starred || false,
          title: doc.title,
          type: doc.type || 'unknown'
        }))

        setHistoryItems(items)
      } catch (error) {
        console.error('Failed to load recent documents:', error)
      }
    }

    loadRecentDocuments()
  }, [user, type, maxItems])

  const formatTimestamp = (date: Date | any) => {
    const actualDate = date?.toDate ? date.toDate() : new Date(date)
    const now = new Date()
    const diff = now.getTime() - actualDate.getTime()
    const minutes = Math.floor(diff / (1000 * 60))

    if (minutes < 60) {
      return `${minutes} min ago`
    } else if (minutes < 1440) {
      return `${Math.floor(minutes / 60)} hours ago`
    } else {
      return `${Math.floor(minutes / 1440)} days ago`
    }
  }

  const toggleLike = async (id: string) => {
    if (!user) return

    const item = historyItems.find(item => item.id === id)
    if (!item) return

    try {
      await documentService.updateDocument(id, { starred: !item.liked })
      setHistoryItems((items) => 
        items.map((item) => 
          item.id === id ? { ...item, liked: !item.liked } : item
        )
      )
    } catch (error) {
      console.error('Failed to update document:', error)
    }
  }

  const handleItemClick = (id: string, docType: string) => {
    const basePath = `/dashboard/${docType}s/edit/${id}`
    router.push(basePath)
  }

  const handleDownload = async (thumbnailUrl: string, title: string) => {
    try {
      const response = await fetch(thumbnailUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}-${Date.now()}.${blob.type.includes('video') ? 'mp4' : 'jpg'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  if (layout === 'list') {
    return (
      <div className="w-full lg:w-20 rounded-lg flex flex-col">
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-4 lg:grid-cols-1 gap-3">
            {historyItems.map((item) => (
              <div key={item.id} className="group relative">
                <div 
                  className="relative cursor-pointer"
                  onClick={() => handleItemClick(item.id, item.type)}
                >
                  {item.type === 'video' ? (
                    <video
                      src={item.thumbnail}
                      className="w-full aspect-square object-cover rounded-md transition-colors hover:opacity-80"
                      muted
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full aspect-square object-cover rounded-md transition-colors hover:opacity-80"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className="w-20 bg-background border-l flex flex-col">
      {/* Header */}
      <div className="p-2 border-b flex items-center justify-center">
        <span className="text-xs font-medium text-muted-foreground">
          {type === 'all' ? 'Recent' : type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
      </div>

      {/* History Items */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {historyItems.map((item) => (
            <div key={item.id} className="group relative">
              <div 
                className="relative cursor-pointer"
                onClick={() => handleItemClick(item.id, item.type)}
              >
                {item.type === 'video' ? (
                  <video
                    src={item.thumbnail}
                    className="w-16 h-16 object-cover rounded-md border hover:border-primary transition-colors"
                    muted
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-md border hover:border-primary transition-colors"
                  />
                )}

                {showActions && (
                  <div className="absolute inset-0 bg-black/60 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex flex-col items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLike(item.id)
                        }}
                      >
                        <Heart className={`h-3 w-3 ${item.liked ? "fill-red-500 text-red-500" : ""}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(item.thumbnail, item.title)
                        }}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Liked indicator */}
                {item.liked && (
                  <div className="absolute top-1 right-1">
                    <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground mt-1 text-center">
                {item.timestamp}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
