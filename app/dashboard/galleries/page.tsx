"use client"
import type React from "react"
import { useState, useEffect, useRef, type DragEvent } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Grid, MoreVertical, Trash2, Eye, X, Paperclip, ArrowUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { galleryService } from "@/services/galleryService"
import type { Gallery } from "@/types/gallery"
import { OptimizedImage } from "@/components/OptimizedImage"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
const galleryPrompts = {
  "Fashion Collection": "Create a set of avant-garde streetwear images with deconstructed silhouettes and bold colors",
  "Film Storyboards": "Create a set of vintage film noir detective scenes with dramatic shadows and fog",
  "Interior Views": "Create a set of minimalist Scandinavian kitchen images with natural light and wooden textures",
  "Product Shots": "Create a set of premium wireless earbuds on marble surface with dramatic lighting",
  "Architectural Renders": "Create a set of modern glass pavilion images nestled in forest with sustainable design",
  "Food Photography": "Create a set of rustic Italian pasta dish images with fresh herbs and natural lighting",
  "Brand Identity": "Create a moodboard of my boxing gear company's videography",
  "Portrait Photography":
    "Create a set of professional headshots with dramatic studio lighting and neutral backgrounds",
}
const GalleryCard: React.FC<{
  gallery: Gallery
  onClick: () => void
  onDelete: () => void
}> = ({ gallery, onClick, onDelete }) => {
  const firstImage = gallery.images?.[0]
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer transition-all duration-300 overflow-hidden flex flex-col "
    >
      <div className="relative aspect-[9/16] bg-muted">
        {firstImage ? (
          <OptimizedImage 
            src={firstImage} 
            alt={gallery.title} 
            className="w-full h-full object-cover" 
            fill 
            priority={false}
          />
        ) : (
          <div className="flex items-center justify-center h-full ">
            <Grid className="w-12 h-12 text-muted-foreground " />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => e.stopPropagation()}
                className="h-8 w-8 bg-black/50 hover:bg-black/70 backdrop-blur-sm"
              >
                <MoreVertical className="w-4 h-4 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onClick()
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Gallery
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Gallery
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CardContent className="p-4 flex-grow flex flex-col justify-between">
        {/* Title removed as requested */}
      </CardContent>
    </div>
  )
}
export default function GalleriesPage() {
  const [user] = useAuthState(auth)
  const router = useRouter()
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteGalleryId, setDeleteGalleryId] = useState<string | null>(null)
  // Create gallery form state
  const [type, setType] = useState("")
  const [customType, setCustomType] = useState("")
  const [prompt, setPrompt] = useState("")
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (user) {
      loadGalleries()
    }
  }, [user])
  const loadGalleries = async () => {
    if (!user) return
    try {
      setLoading(true)
      const userGalleries = await galleryService.getUserGalleries(user.uid)
      setGalleries(userGalleries)
    } catch (error) {
      console.error("Failed to load galleries:", error)
      toast.error("Failed to load galleries")
    } finally {
      setLoading(false)
    }
  }
  const handleDeleteGallery = (galleryId: string) => {
    setDeleteGalleryId(galleryId)
  }
  const confirmDeleteGallery = async () => {
    if (!deleteGalleryId) return
    try {
      await galleryService.deleteGallery(deleteGalleryId)
      setGalleries((prevGalleries) => prevGalleries.filter((g) => g.id !== deleteGalleryId))
      toast.success("Gallery deleted successfully")
    } catch (error) {
      console.error("Failed to delete gallery:", error)
      toast.error("Failed to delete gallery")
    } finally {
      setDeleteGalleryId(null)
    }
  }
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
    const promptWords = prompt.trim().split(" ").slice(0, 4).join(" ")
    const cleanType = galleryType.replace(/\s+/g, " ")
    return `${cleanType}: ${promptWords}`.substring(0, 80)
  }
  const handleCreate = async () => {
    if (!user) return
    if (!prompt.trim()) {
      toast.error("Prompt is required")
      return
    }
    const galleryType = type === "Custom" ? customType : type || "AI Gallery"
    setIsCreating(true)
    try {
      const autoTitle = generateTitle(galleryType, prompt)
      let imagePrompt = prompt.trim()
      if (referenceImage) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const base64 = e.target?.result as string
          imagePrompt = `${prompt.trim()} (Reference image style: ${base64})`
          const galleryId = await galleryService.createGallery(user.uid, {
            title: autoTitle,
            description: prompt.trim(),
            type: galleryType,
            prompt: prompt.trim(),
            images: [],
            isPublic: false,
            tags: [galleryType.toLowerCase().replace(/\s+/g, "-")],
          })
          const response = await fetch("/api/galleries/generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-user-id": user.uid,
            },
            body: JSON.stringify({
              prompt: imagePrompt,
              outputs: 4,
              aspectRatio: "1:1",
            }),
          })
          if (response.ok) {
            const data = await response.json()
            if (data.images && data.images.length > 0) {
              await galleryService.updateGallery(galleryId, {
                images: data.images,
              })
            }
          }
          resetCreateForm()
          loadGalleries()
          router.push(`/dashboard/galleries/${galleryId}`)
        }
        reader.readAsDataURL(referenceImage)
      } else {
        const galleryId = await galleryService.createGallery(user.uid, {
          title: autoTitle,
          description: prompt.trim(),
          type: galleryType,
          prompt: prompt.trim(),
          images: [],
          isPublic: false,
          tags: [galleryType.toLowerCase().replace(/\s+/g, "-")],
        })
        const response = await fetch("/api/galleries/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user.uid,
          },
          body: JSON.stringify({
            prompt: imagePrompt,
            outputs: 4,
            aspectRatio: "1:1",
          }),
        })
        if (response.ok) {
          const data = await response.json()
          if (data.images && data.images.length > 0) {
            await galleryService.updateGallery(galleryId, {
              images: data.images,
            })
          }
        }
        resetCreateForm()
        loadGalleries()
        router.push(`/dashboard/galleries/${galleryId}`)
      }
    } catch (error) {
      console.error("Failed to create gallery:", error)
      toast.error("Failed to create gallery")
    } finally {
      setIsCreating(false)
    }
  }
  const resetCreateForm = () => {
    setType("")
    setCustomType("")
    setPrompt("")
    setReferenceImage(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }
  const filteredGalleries = galleries.filter(
    (gallery) =>
      gallery.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gallery.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )
  if (loading) {
    return (
      <main className="min-h-screen w-full transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4  "></div>
          <p className="text-foreground">Loading your galleries...</p>
        </div>
      </main>
    )
  }
return (
  <main className="min-h-screen w-full transition-colors duration-300">
    <div className="w-full max-w-4xl mx-auto py-8 px-4 pb-40">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-md font-bold text-foreground">Galleries</h1>
      </div>
      {galleries.length > 0 && <div className="mb-6"></div>}
      {filteredGalleries.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {filteredGalleries.map((gallery) => (
            <Card key={gallery.id} className="aspect-[9/16] overflow-hidden">
              <GalleryCard
                gallery={gallery}
                onClick={() => router.push(`/dashboard/galleries/${gallery.id}`)}
                onDelete={() => handleDeleteGallery(gallery.id)}
              />
            </Card>
          ))}
        </div>
      ) : galleries.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border  bg-green-500 rounded-2xl">
          <Grid className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-foreground">No galleries yet</h2>
          <p className="text-muted-foreground mt-2">Click "New" to create your first gallery.</p>
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <Grid className="w-16 h-16 mx-auto text-muted-foreground mb-4 " />
          <h2 className="text-2xl font-semibold text-foreground">No galleries found</h2>
          <p className="text-muted-foreground mt-2">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
    {/* Sticky Create Gallery Prompt Box */}
    <div className="sticky bottom-0 p-4 mt-8 mx-auto">
      <div className="max-w-3xl mx-auto">
        {type === "Custom" && (
          <div className="mb-4">
            <Input
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              placeholder="Custom gallery type"
              className="h-10 text-sm border-border bg-background focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        )}
        <div className="relative rounded-2xl  border border-border bg-background shadow-sm focus-within:shadow-md transition-shadow ">
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
              placeholder="Describe your gallery vision and press create..."
              rows={3}
              className="resize-none text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[100px] pl-3 pr-14 pb-12"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
              <Button
                onClick={handleCreate}
                size="sm"
                className="h-8 w-8 p-0 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                disabled={isCreating || !prompt.trim()}
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
    {deleteGalleryId && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop - clicking closes dialog */}
        <div 
          className="absolute inset-0 bg-black/50" 
          onClick={() => setDeleteGalleryId(null)}
        />
        
        {/* Dialog Content */}
        <div className="relative bg-background border rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Delete Gallery</h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this gallery? This action cannot be undone and will permanently remove all images and content.
            </p>
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0">
            <button
              onClick={() => setDeleteGalleryId(null)}
              className="px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteGallery}
              className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-colors"
            >
              Delete Gallery
            </button>
          </div>
        </div>
      </div>
    )}
  </main>
)
}