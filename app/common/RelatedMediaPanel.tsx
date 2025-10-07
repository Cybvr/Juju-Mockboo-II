"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { documentService } from '@/services/documentService'

interface RelatedMediaPanelProps {
  currentDocumentId: string
  maxItems?: number
}

export function RelatedMediaPanel({ 
  currentDocumentId,
  maxItems = 20 
}: RelatedMediaPanelProps) {
  const [relatedDocuments, setRelatedDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadRelatedDocuments = async () => {
      try {
        setLoading(true)

        // Get all popular documents (fetching extra for safety)
        const allDocs = await documentService.getPopularDocuments(maxItems * 2)

        // Filter: exclude current doc, require media
        const docsWithMedia = allDocs.filter(doc => 
          doc.id !== currentDocumentId &&
          (doc.content?.imageUrls?.length > 0 || doc.content?.videoUrls?.length > 0)
        )

        // No slice, return all
        setRelatedDocuments(docsWithMedia)
      } catch (error) {
        console.error('Failed to load related documents:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRelatedDocuments()
  }, [currentDocumentId, maxItems])

  const handleDocumentClick = (documentId: string) => {
    router.push(`/m/${documentId}`)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex-shrink-0 w-16 h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (relatedDocuments.length === 0) {
    return (
      <div className="space-y-3">
        <div className="text-center py-4 text-muted-foreground">
          <p>No related media found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {relatedDocuments.map((document) => {
          const isVideo = document.type === 'video' || document.content?.videoUrls?.length > 0
          const mediaUrl = isVideo 
            ? document.content?.videoUrls?.[0] 
            : document.content?.imageUrls?.[0]

          return (
            <div 
              key={document.id}
              className="cursor-pointer group flex-shrink-0"
              onClick={() => handleDocumentClick(document.id)}
              title={document.title}
            >
              <div className="relative overflow-hidden rounded-lg w-16 h-16 bg-black">
                {isVideo ? (
                  <video
                    src={mediaUrl}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt={document.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
