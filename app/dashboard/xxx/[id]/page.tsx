"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { documentService } from "@/services/documentService"
import { Document } from "@/types/firebase"
import { Button } from "@/components/ui/button"
import { Download, ArrowLeft, Heart, Share2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Props {
  params: { id: string }
}

export default function ImageViewPage({ params }: Props) {
  const { user } = useAuth()
  const router = useRouter()
  const [doc, setDoc] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true)
        const document = await documentService.getDocumentById(params.id)
        if (!document) {
          setError("Image not found")
          return
        }
        setDoc(document)
      } catch (err) {
        console.error('Error fetching document:', err)
        setError("Failed to load image")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchDocument()
    }
  }, [params.id])

  const handleDownload = () => {
    if (doc?.content?.imageUrls?.[0]) {
      const link = window.document.createElement('a')
      link.href = doc.content.imageUrls[0]
      link.download = `${doc.title || 'generated-image'}.png`
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading image...</p>
        </div>
      </div>
    )
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-xl mb-4">{error || "Image not found"}</h1>
          <Button 
            onClick={() => router.push('/dashboard/images')}
            className="bg-white text-black hover:bg-gray-200"
            data-testid="button-back-to-images"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Images
          </Button>
        </div>
      </div>
    )
  }

  const imageUrl = doc.content?.imageUrls?.[0]

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/images')}
            className="text-white hover:bg-gray-800"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-white text-lg font-semibold" data-testid="text-image-title">
            {doc.title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-gray-800"
            data-testid="button-like"
          >
            <Heart className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-gray-800"
            data-testid="button-share"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-white hover:bg-gray-800"
            data-testid="button-download"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Image Display */}
      <div className="flex-1 flex items-center justify-center p-8">
        {imageUrl ? (
          <div className="max-w-4xl max-h-[80vh] w-full">
            <img
              src={imageUrl}
              alt={doc.title}
              className="w-full h-full object-contain rounded-lg shadow-2xl"
              data-testid="img-main-display"
            />
          </div>
        ) : (
          <div className="text-white text-center">
            <p>No image available</p>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="p-6 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-400">
            {doc.content?.prompt && (
              <div>
                <p className="font-medium text-white mb-1">Prompt</p>
                <p data-testid="text-prompt">{doc.content.prompt}</p>
              </div>
            )}
            {doc.content?.model && (
              <div>
                <p className="font-medium text-white mb-1">Model</p>
                <p data-testid="text-model">{doc.content.model}</p>
              </div>
            )}
            {doc.content?.aspectRatio && (
              <div>
                <p className="font-medium text-white mb-1">Aspect Ratio</p>
                <p data-testid="text-aspect-ratio">{doc.content.aspectRatio}</p>
              </div>
            )}
            {doc.createdAt && (
              <div>
                <p className="font-medium text-white mb-1">Created</p>
                <p data-testid="text-created-date">{new Date(doc.createdAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
