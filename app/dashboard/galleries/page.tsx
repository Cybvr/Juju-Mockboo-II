
"use client"
import React, { useState, useEffect, useRef, type DragEvent } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Grid, Search, MoreVertical, Trash2, Eye, X, Paperclip, ArrowUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { galleryService } from '@/services/galleryService';
import type { Gallery } from '@/types/gallery';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const galleryPrompts = {
  "Fashion Collection": "Create a set of avant-garde streetwear images with deconstructed silhouettes and bold colors",
  "Film Storyboards": "Create a set of vintage film noir detective scenes with dramatic shadows and fog",
  "Interior Views": "Create a set of minimalist Scandinavian kitchen images with natural light and wooden textures",
  "Product Shots": "Create a set of premium wireless earbuds on marble surface with dramatic lighting",
  "Architectural Renders": "Create a set of modern glass pavilion images nestled in forest with sustainable design",
  "Food Photography": "Create a set of rustic Italian pasta dish images with fresh herbs and natural lighting",
  "Brand Identity": "Create a moodboard of my boxing gear company's videography",
  "Portrait Photography": "Create a set of professional headshots with dramatic studio lighting and neutral backgrounds",
  "Landscape Photography": "Create a set of breathtaking mountain sunrise images with misty valleys and golden light",
  "Abstract Art": "Create a set of vibrant abstract compositions with flowing organic shapes and bold color gradients",
  "Automotive Photography": "Create a set of luxury sports car images with dynamic angles and dramatic lighting",
  "Travel Photography": "Create a set of exotic destination images showcasing local culture and stunning scenery",
  "Wedding Photography": "Create a set of romantic wedding ceremony images with soft natural lighting",
  "Corporate Photography": "Create a set of professional business environment images with modern office settings",
  "Real Estate Photography": "Create a set of luxurious home interior images with perfect staging and lighting",
  "Event Photography": "Create a set of celebration party images with vibrant colors and joyful moments",
  "Nature Photography": "Create a set of wildlife and forest images with natural lighting and rich details",
  "Street Photography": "Create a set of urban lifestyle images capturing authentic city moments",
  "Macro Photography": "Create a set of extreme close-up images revealing intricate details and textures",
  "Fine Art Photography": "Create a set of artistic conceptual images with creative composition and mood"
}

const GalleryCard: React.FC<{
  gallery: Gallery;
  onClick: () => void;
  onDelete: () => void;
}> = ({ gallery, onClick, onDelete }) => {
  const firstImage = gallery.images?.[0];
  const lastUpdated = new Date(gallery.updatedAt).toLocaleDateString();

  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
    >
      <div className="relative aspect-video bg-muted">
        {firstImage ? (
          <img src={firstImage} alt={gallery.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Grid className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
      <CardContent className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors truncate pr-2">
              {gallery.title}
            </h3>
            <div className="relative flex-shrink-0 flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                title="Delete Gallery"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick(); }}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Gallery
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {gallery.description || 'No description'}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            {gallery.images.length} images
          </p>
          <p className="text-xs text-muted-foreground">
            Updated: {lastUpdated}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default function GalleriesPage() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteGalleryId, setDeleteGalleryId] = useState<string | null>(null);

  // Create gallery form state
  const [type, setType] = useState("");
  const [customType, setCustomType] = useState("");
  const [prompt, setPrompt] = useState("");
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadGalleries();
    }
  }, [user]);

  const loadGalleries = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userGalleries = await galleryService.getUserGalleries(user.uid);
      setGalleries(userGalleries);
    } catch (error) {
      console.error('Failed to load galleries:', error);
      toast.error('Failed to load galleries');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGallery = (galleryId: string) => {
    setDeleteGalleryId(galleryId);
  };

  const confirmDeleteGallery = async () => {
    if (!deleteGalleryId) return;

    try {
      await galleryService.deleteGallery(deleteGalleryId);
      setGalleries(prevGalleries => prevGalleries.filter(g => g.id !== deleteGalleryId));
      toast.success('Gallery deleted successfully');
    } catch (error) {
      console.error('Failed to delete gallery:', error);
      toast.error('Failed to delete gallery');
    } finally {
      setDeleteGalleryId(null);
    }
  };

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
    const promptWords = prompt.trim().split(' ').slice(0, 4).join(' ')
    const cleanType = galleryType.replace(/\s+/g, ' ')
    return `${cleanType}: ${promptWords}`.substring(0, 80)
  }

  const handleCreate = async () => {
    if (!user) return
    if (!prompt.trim()) {
      toast.error('Prompt is required')
      return
    }
    const galleryType = type === 'Custom' ? customType : (type || 'AI Gallery')
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
            tags: [galleryType.toLowerCase().replace(/\s+/g, '-')]
          })

          const response = await fetch('/api/galleries/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': user.uid,
            },
            body: JSON.stringify({
              prompt: imagePrompt,
              outputs: 4,
              aspectRatio: "1:1"
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.images && data.images.length > 0) {
              await galleryService.updateGallery(galleryId, { 
                images: data.images
              });
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
          tags: [galleryType.toLowerCase().replace(/\s+/g, '-')]
        })

        const response = await fetch('/api/galleries/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.uid,
          },
          body: JSON.stringify({
            prompt: imagePrompt,
            outputs: 4,
            aspectRatio: "1:1"
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.images && data.images.length > 0) {
            await galleryService.updateGallery(galleryId, { 
              images: data.images
            });
          }
        }

        resetCreateForm()
        loadGalleries()
        router.push(`/dashboard/galleries/${galleryId}`)
      }
    } catch (error) {
      console.error('Failed to create gallery:', error)
      toast.error('Failed to create gallery')
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

  const filteredGalleries = galleries.filter(gallery =>
    gallery.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gallery.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <main className="min-h-screen w-full bg-background transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-foreground">Loading your galleries...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full transition-colors duration-300">
      <div className="w-full max-w-6xl mx-auto py-8 px-4 pb-40">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-md font-bold text-foreground">Galleries</h1>
        </div>

        {galleries.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search galleries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {filteredGalleries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGalleries.map((gallery) => (
              <GalleryCard
                key={gallery.id}
                gallery={gallery}
                onClick={() => router.push(`/dashboard/galleries/${gallery.id}`)}
                onDelete={() => handleDeleteGallery(gallery.id)}
              />
            ))}
          </div>
        ) : galleries.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
            <Grid className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold text-foreground">
              No galleries yet
            </h2>
            <p className="text-muted-foreground mt-2">
              Click "New" to create your first gallery.
            </p>
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
            <Grid className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold text-foreground">
              No galleries found
            </h2>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search terms.
            </p>
          </div>
        )}
      </div>

      {/* Sticky Create Gallery Prompt Box */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t p-4">
        <div className="max-w-6xl mx-auto">
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
                  </Select>
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

      <AlertDialog open={!!deleteGalleryId} onOpenChange={(open) => {
        if (!open) setDeleteGalleryId(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Gallery</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this gallery? This action cannot be undone and will permanently remove all images and content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteGalleryId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteGallery}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Gallery
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
