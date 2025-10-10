"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Loader2 } from "lucide-react"

export function AIImagePanel() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          model: 'flux-schnell',
          aspectRatio: '1:1'
        }),
      })

      const data = await response.json()
      if (data.success && data.images && data.images.length > 0) {
        setGeneratedImages(prev => [...data.images, ...prev])
      } else {
        console.error('No images generated:', data)
      }
    } catch (error) {
      console.error('Error generating images:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="w-80 border-r border-border bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-semibold text-sm">AI Media Clip</h2>
        </div>

        {/* Prompt Input */}
        <div className="flex flex-col gap-2">
          <Textarea
            placeholder="Generate an 8-second video. Describe what you want the content to be."
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
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </Button>
        </div>
      </div>

      {/* Generated Images Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {isGenerating && generatedImages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm">Generating your image...</p>
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
              <img
                src={image}
                alt={`Generated ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button size="sm" variant="secondary">
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