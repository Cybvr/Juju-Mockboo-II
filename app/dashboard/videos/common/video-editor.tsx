"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { documentService } from "@/services/documentService"
import { VideoEditingPanel } from "./video-editing-panel"
import { OutputPreview } from "./output-preview"

interface GeneratedVideo {
  url: string;
  id?: string;
}

export function VideoEditor() {
  const { user } = useAuth()
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async (params: {
    prompt: string;
    first_frame_image?: string;
    last_frame_image?: string;
    duration: number;
    mode: string;
    negative_prompt: string;
  }) => {
    if (!user) {
      setError('Please log in to generate videos')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Create document first to get documentId
      const documentData = {
        title: `Video - ${new Date().toLocaleDateString()}`,
        content: {
          prompt: params.prompt,
          duration: params.duration,
          status: 'generating'
        },
        tags: ["video", "ai-generated"],
        type: "video" as const,
        isPublic: false,
        starred: false,
        shared: false,
        category: "UGC" as const,
      }

      const documentId = await documentService.createDocument(user.uid, documentData)
      console.log('Document created with ID:', documentId)

      const response = await fetch('/api/videos/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          documentId: documentId
        }),
      })

      const data = await response.json()

      if (response.ok && data.data) {
        console.log('Video generation successful:', data.data)

        const videoUrl = data.data.output?.[0]?.url
        if (videoUrl) {
          // Update document with video URL client-side
          try {
            await documentService.updateDocument(documentId, {
              content: {
                prompt: params.prompt,
                duration: params.duration,
                mode: params.mode,
                videoUrls: [videoUrl],
                status: 'completed',
                generatedAt: new Date().toISOString()
              },
              type: "video"
            });
            console.log('Document updated successfully with video URL');
          } catch (updateError) {
            console.error('Failed to update document client-side:', updateError);
          }

          setGeneratedVideos([{ url: videoUrl, id: documentId }])
          console.log('Video generated and document updated')

          // Redirect to media view
          window.location.href = `/m/${documentId}`;
        }
      } else {
        throw new Error(data.error || 'Video generation failed')
      }
    } catch (err) {
      console.error('Generation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate video')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-background text-foreground overflow-hidden">
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* On mobile, preview comes first and takes most space */}
        <div className="flex-1 lg:order-2 min-h-0">
          <OutputPreview
            videos={generatedVideos}
            isGenerating={isGenerating}
            error={error}
          />
        </div>
        {/* On mobile, editing panel is secondary and properly positioned */}
        <div className="lg:order-1 lg:flex-shrink-0">
          <VideoEditingPanel
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </div>
  )
}