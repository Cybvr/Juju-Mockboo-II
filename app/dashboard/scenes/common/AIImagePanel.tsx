"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, Loader2 } from "lucide-react"

export function AIImagePanel() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)

    // Simulate AI generation delay
    setTimeout(() => {
      // For demo purposes, using placeholder images
      // In production, this would call your AI image generation API
      const newImage = `https://placehold.co/512x512/6366f1/white?text=${encodeURIComponent(prompt.slice(0, 20))}`
      setGeneratedImages(prev => [newImage, ...prev])
      setIsGenerating(false)
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isGenerating) {
      handleGenerate()
    }
  }

  return (
    <div className="w-80 border-r border-border bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <h2 className="font-semibold text-lg">AI Image Generator</h2>
        </div>

        {/* Prompt Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Describe the image you want..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isGenerating}
            className="flex-1"
          />
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            size="sm"
            className="px-3"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
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
            <Sparkles className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">Enter a prompt above to generate AI images</p>
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