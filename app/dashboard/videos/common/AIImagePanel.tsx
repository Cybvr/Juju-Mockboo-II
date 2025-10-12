
"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Loader2 } from "lucide-react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"

interface AIImagePanelProps {
  onAddToScene?: (videoUrl: string) => void
}

export function AIImagePanel({ onAddToScene }: AIImagePanelProps) {
  const [user] = useAuthState(auth)
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    if (!user) {
      alert('Please sign in to generate videos')
      return
    }

    setIsGenerating(true)
    try {
      // Create video with Sora
      const createResponse = await fetch('/api/videos/sora', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({
          model: 'sora-2',
          prompt: prompt,
          size: '1280x720',
          seconds: '8'
        }),
      })

      const createData = await createResponse.json()
      console.log('Sora video creation response:', createData)
      
      if (!createData.id) {
        throw new Error('No video ID returned from Sora API')
      }

      // Poll for completion
      let video = createData
      while (video.status === 'in_progress' || video.status === 'queued') {
        await new Promise(resolve => setTimeout(resolve, 3000)) // Poll every 3 seconds
        
        const statusResponse = await fetch(`/api/videos/sora/${video.id}`, {
          headers: {
            'x-user-id': user.uid,
          }
        })
        video = await statusResponse.json()
        console.log('Video status:', video.status)
      }

      if (video.status === 'completed') {
        // Download the video content
        const downloadResponse = await fetch(`/api/videos/sora/${video.id}/content`, {
          headers: {
            'x-user-id': user.uid,
          }
        })
        
        if (downloadResponse.ok) {
          const videoBlob = await downloadResponse.blob()
          const videoUrl = URL.createObjectURL(videoBlob)
          setGeneratedImages(prev => [videoUrl, ...prev])
          console.log('Generated video added:', videoUrl)
        } else {
          throw new Error('Failed to download video content')
        }
      } else if (video.status === 'failed') {
        const errorMessage = video.error?.message || 'Video generation failed'
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Error generating video:', error)
      alert(`Error generating video: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="w-80 border-r border-border bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-semibold text-sm">AI Video with Sora 2</h2>
        </div>

        {/* Prompt Input */}
        <div className="flex flex-col gap-2">
          <Textarea
            placeholder="Generate an 8-second video with Sora 2. Describe your scene in detail."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            className="resize-none min-h-[100px]"
          />
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            size="sm"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Generating with Sora...
              </>
            ) : (
              "Generate with Sora 2"
            )}
          </Button>
        </div>
      </div>

      {/* Generated Videos Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {isGenerating && generatedImages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm">Generating your video with Sora...</p>
            <p className="text-xs mt-1">This may take several minutes</p>
          </div>
        )}

        {generatedImages.length === 0 && !isGenerating && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">

          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {generatedImages.map((image, index) => (
            <div
              key={index}
              className="aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors cursor-pointer group relative"
            >
              <video
                src={image}
                className="w-full h-full object-cover"
                controls
                muted
                loop
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => onAddToScene?.(image)}
                >
                  Add to Scene
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
