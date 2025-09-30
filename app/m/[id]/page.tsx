"use client"
import { useState, useEffect } from "react"
import { use } from "react"  // Add this import
import { useRouter } from "next/navigation"
import { documentService } from "@/services/documentService"
import { MetadataPanel } from "@/app/common/MetadataPanel"
import { RelatedMediaPanel } from "@/app/common/RelatedMediaPanel"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { ImageWithHoverActions } from "@/components/ImageWithHoverActions"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { ArrowLeft } from "lucide-react"
import MasterControl from "@/app/common/dashboard/MasterControl"

export default function MediaViewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  // Properly resolve the params Promise
  const resolvedParams = use(params)
  const documentId = resolvedParams.id
  const [user] = useAuthState(auth)
  const [currentDocument, setCurrentDocument] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
  const [showControls, setShowControls] = useState(false)
  const [showMetadata, setShowMetadata] = useState(false)
  const [mobileAccordionValue, setMobileAccordionValue] = useState<string | undefined>(undefined)
  console.log('🔍 MediaViewPage documentId:', documentId, 'from resolved params:', resolvedParams);

  useEffect(() => {
    const loadDocument = async () => {
      if (!documentId) {
        setError("Document ID not found")
        setIsLoading(false)
        return
      }
      try {
        setIsLoading(true)
        const document = await documentService.getDocumentById(documentId)
        if (!document) {
          setError("Media not found")
          return
        }
        // Check if document has media content
        const hasMedia = document.content?.imageUrls?.length > 0 || document.content?.videoUrls?.length > 0
        if (!hasMedia) {
          setError("No media content found")
          return
        }
        setCurrentDocument(document)
      } catch (error) {
        console.error("Failed to load document:", error)
        setError("Failed to load media")
      } finally {
        setIsLoading(false)
      }
    }
    loadDocument()
  }, [documentId])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [pollingInterval])

  const handleDownload = async (url: string, title: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `${title}-${Date.now()}.${blob.type.includes('video') ? 'mp4' : 'jpg'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentDocument?.title || 'Shared Media',
          url: window.location.href
        })
      } catch (error) {
        console.error('Share failed:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading media...</p>
        </div>
      </div>
    )
  }

  if (error || !currentDocument) {
    return (
      <div className="h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Media Not Found</h1>
          <p className="text-muted-foreground mb-4">{error || "The media you're looking for doesn't exist."}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const isVideo = currentDocument.type === 'video' || currentDocument.content?.videoUrls?.length > 0
  const mediaUrl = isVideo
    ? currentDocument.content?.videoUrls?.[0]
    : currentDocument.content?.imageUrls?.[0]

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header with MasterControl */}
      <div className="flex-shrink-0 p-3 border-b bg-background container mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <MasterControl
            defaultMode="chat"
            className="w-full"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-auto">
        {/* Media Container - Takes most space */}
        <div className="flex-1 p-2 sm:p-4">
          <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center h-full w-full">
            {isVideo ? (
              <video
                src={mediaUrl}
                controls
                className="max-w-full max-h-full object-contain"
                poster={currentDocument.content?.thumbnail}
              />
            ) : (
              <ImageWithHoverActions
                src={mediaUrl}
                alt={currentDocument.title}
                className="max-w-full max-h-full object-contain"
                imageName={currentDocument.title}
                containerClassName="w-full h-full flex items-center justify-center"
                documentId={documentId}
              />
            )}
          </div>

          {/* Multiple media grid */}
          {currentDocument.content?.imageUrls?.length > 1 && (
            <div className="mt-2 sm:mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {currentDocument.content.imageUrls.slice(1).map((url: string, index: number) => (
                  <div key={index} className="aspect-square">
                    <div
                      className="w-full h-full cursor-pointer"
                      onClick={() => {
                        setCurrentDocument(prev => ({
                          ...prev,
                          content: {
                            ...prev.content,
                            imageUrls: [url, ...prev.content.imageUrls.filter(u => u !== url)]
                          }
                        }))
                      }}
                    >
                      <ImageWithHoverActions
                        src={url}
                        alt={`${currentDocument.title} ${index + 2}`}
                        className="w-full h-full object-cover rounded border hover:border-primary transition-colors"
                        imageName={`${currentDocument.title}-${index + 2}`}
                        containerClassName="w-full h-full"
                        documentId={documentId}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Metadata Panel - Right side */}
        <div className="h-48 lg:w-80 lg:h-auto lg:overflow-y-auto">
          <div className="p-4">
            <MetadataPanel
              document={currentDocument}
              type={isVideo ? 'video' : 'image'}
              isOpen={true}
              onDocumentUpdate={(updatedDoc) => setCurrentDocument(updatedDoc)}
            />
          </div>
        </div>
      </div>

      {/* Related Media */}
      <div className="border-t bg-card/30">
        <div className="p-4">
          <RelatedMediaPanel
            currentDocumentId={documentId}
            type={isVideo ? 'video' : 'image'}
            maxItems={window.innerWidth < 1024 ? 8 : 12}
          />
        </div>
      </div>
    </div>
  );
}
