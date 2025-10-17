"use client"
import { useState, useEffect } from "react"
import { use } from "react"
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
import { ArrowLeft, Share2, Download } from "lucide-react"
import MasterControl from "@/app/common/dashboard/MasterControl"

export default function MediaViewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
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
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header with MasterControl */}
      <div className="flex-shrink-0 p-3 border-b bg-background">
        <div className="container mx-auto max-w-7xl">
          <MasterControl
            defaultMode="chat"
            className="w-full"
          />
        </div>
      </div>

      {/* Title Bar */}
      <div className="flex-shrink-0 p-4 border-b bg-background">
        <div className="container mx-auto max-w-7xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button onClick={() => router.back()} variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold truncate">{currentDocument.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => handleDownload(mediaUrl, currentDocument.title)} 
              variant="outline" 
              size="sm"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="container mx-auto max-w-7xl p-4">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Media Gallery - Scrollable */}
              <div className="flex-1">
                {/* Main Media */}
                <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center aspect-video mb-4">
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-6">
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
                )}

                {/* Related Media */}
                <div className="border-t pt-6">
                  <RelatedMediaPanel
                    currentDocumentId={documentId}
                    type={isVideo ? 'video' : 'image'}
                    maxItems={12}
                  />
                </div>
              </div>

              {/* Metadata Panel - Sticky on desktop */}
              <div className="lg:w-80 lg:sticky lg:top-0 lg:self-start">
                <div className="border rounded-lg p-4 bg-card">
                  <MetadataPanel
                    document={currentDocument}
                    type={isVideo ? 'video' : 'image'}
                    isOpen={true}
                    onDocumentUpdate={(updatedDoc) => setCurrentDocument(updatedDoc)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}