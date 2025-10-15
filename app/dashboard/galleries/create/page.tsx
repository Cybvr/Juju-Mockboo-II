"use client"
import type React from "react"
import { useState, useRef, type DragEvent } from "react"
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Paperclip, ArrowUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { galleryService } from '@/services/galleryService'

const galleryPrompts = {
  "Fashion Collection": "Create a set of avant-garde streetwear images with deconstructed silhouettes and bold colors",
  "Film Storyboards": "Create a set of vintage film noir detective scenes with dramatic shadows and fog",
  "Interior Views": "Create a set of minimalist Scandinavian kitchen images with natural light and wooden textures",
  "Product Shots": "Create a set of premium wireless earbuds on marble surface with dramatic lighting",
  "Architectural Renders": "Create a set of modern glass pavilion images nestled in forest with sustainable design",
  "Food Photography": "Create a set of rustic Italian pasta dish images with fresh herbs and natural lighting",
  "Brand Identity": "Create a moodboard of my boxing gear company's videography",
}

export default function CreateGalleryPage() {
  const [user] = useAuthState(auth)
  const router = useRouter()
  const [type, setType] = useState("")
  const [customType, setCustomType] = useState("")
  const [prompt, setPrompt] = useState("")
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setReferenceImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      toast.error("Please select a valid image file")
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const removeImage = () => {
    setReferenceImage(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleTypeChange = (value: string) => {
    setType(value)
    if (value !== "Custom" && galleryPrompts[value]) {
      setPrompt(galleryPrompts[value])
    }
  }

  const generateTitle = (galleryType: string, prompt: string): string => {
    // Take first few words of prompt and combine with type
    const promptWords = prompt.trim().split(' ').slice(0, 4).join(' ')
    const cleanType = galleryType.replace(/\s+/g, ' ')
    return `${cleanType}: ${promptWords}`.substring(0, 80) // Limit to 80 chars
  }

  const handleCreate = async () => {
    if (!user) return
    if (!prompt.trim()) {
      toast.error('Prompt is required')
      return
    }
    const galleryType = type === 'Custom' ? customType : type
    if (!galleryType) {
      toast.error('Gallery type is required')
      return
    }
    setIsCreating(true)
    try {
      const autoTitle = generateTitle(galleryType, prompt)
      let imagePrompt = prompt.trim()

      // If reference image is provided, convert to base64 and include in prompt
      if (referenceImage) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const base64 = e.target?.result as string
          imagePrompt = `${prompt.trim()} (Reference image style: ${base64})`

          // Create gallery with reference image
          const galleryId = await galleryService.createGallery(user.uid, {
            title: autoTitle,
            description: prompt.trim(),
            type: galleryType,
            prompt: prompt.trim(),
            images: [],
            isPublic: false,
            tags: [galleryType.toLowerCase().replace(/\s+/g, '-')]
          })
          router.push(`/dashboard/galleries/${galleryId}`)
        }
        reader.readAsDataURL(referenceImage)
      } else {
        // Create gallery without reference image
        const galleryId = await galleryService.createGallery(user.uid, {
          title: autoTitle,
          description: prompt.trim(),
          type: galleryType,
          prompt: prompt.trim(),
          images: [],
          isPublic: false,
          tags: [galleryType.toLowerCase().replace(/\s+/g, '-')]
        })
        router.push(`/dashboard/galleries/${galleryId}`)
      }
    } catch (error) {
      console.error('Failed to create gallery:', error)
      toast.error('Failed to create gallery')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-8 max-w-3xl items-center text-center">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-center text-foreground mb-2">What would you like to make?</h1>
        </div>

        <div className="space-y-4">
          {type === "Custom" && (
            <div className="relative">
              <Input
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Custom gallery type"
                className="h-12 text-base border-border bg-background focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          )}

          <div className="relative rounded-2xl border border-border bg-background shadow-sm focus-within:shadow-md transition-shadow">
            {referenceImage && previewUrl && (
              <div className="flex items-center gap-3 p-3 border-b border-border">
                <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                  <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{referenceImage.name}</p>
                  <p className="text-xs text-muted-foreground">{(referenceImage.size / 1024).toFixed(1)} KB</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeImage}
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="relative">
              <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 w-8 p-0 hover:bg-muted rounded-lg"
                  type="button"
                >
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                </Button>

                <Select value={type} onValueChange={handleTypeChange}>
                  <SelectTrigger size="sm" className="w-fit h-8 text-sm">
                    <SelectValue placeholder="Gallery type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(galleryPrompts).map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your vision..."
                rows={4}
                className="resize-none text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[120px] pl-3 pr-14 pb-12"
              />

              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />

                <Button
                  onClick={handleCreate}
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                  disabled={isCreating || !prompt.trim() || (type === 'Custom' && !customType.trim())}
                >
                  {isCreating ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}