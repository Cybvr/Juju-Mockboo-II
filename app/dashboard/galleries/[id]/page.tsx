"use client"
import React, { useState, useEffect, use } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Sparkles, Download, Trash2, Grid, List, X, ChevronLeft, ChevronRight, Check, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { galleryService } from '@/services/galleryService';
import type { Gallery } from '@/types/gallery';
import { toast } from 'sonner';

interface GalleryPageProps {
  params: Promise<{ id: string }>;
}

export default function GalleryPage({ params }: GalleryPageProps) {
  const { id } = use(params);
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [prompt, setPrompt] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  useEffect(() => {
    if (user) {
      loadGallery();
    }
  }, [user, id]);

  const loadGallery = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const galleryData = await galleryService.getGalleryById(id);
      if (galleryData && galleryData.userId === user.uid) {
        setGallery(galleryData);
        setPrompt(galleryData.prompt || '');
        setEditedTitle(galleryData.title);
      } else {
        toast.error('Gallery not found');
        router.push('/dashboard/galleries');
      }
    } catch (error) {
      console.error('Failed to load gallery:', error);
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!user || !gallery) return;
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/galleries/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          outputs: 4,
          aspectRatio: "1:1"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate images');
      }

      const data = await response.json();

      if (data.images && data.images.length > 0) {
        const updatedImages = [...(gallery.images || []), ...data.images];

        await galleryService.updateGallery(gallery.id, { 
          images: updatedImages,
          prompt: prompt.trim()
        });

        setGallery({
          ...gallery,
          images: updatedImages,
          prompt: prompt.trim(),
          updatedAt: Date.now()
        });

        toast.success(`Generated ${data.images.length} images successfully`);
      } else {
        throw new Error('No images were generated');
      }
    } catch (error) {
      console.error('Failed to generate images:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate images');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteImage = async (imageIndex: number) => {
    if (!gallery) return;
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const updatedImages = gallery.images.filter((_, index) => index !== imageIndex);

      await galleryService.updateGallery(gallery.id, { 
        images: updatedImages 
      });

      setGallery({
        ...gallery,
        images: updatedImages,
        updatedAt: Date.now()
      });

      setSelectedImageIndex(null);
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gallery_${gallery?.title}_${index}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Image downloaded');
    } catch (error) {
      console.error('Failed to download image:', error);
      toast.error('Failed to download image');
    }
  };

  const handleSaveTitle = async () => {
    if (!gallery || !editedTitle.trim()) return;

    try {
      await galleryService.updateGallery(gallery.id, { 
        title: editedTitle.trim() 
      });

      setGallery({
        ...gallery,
        title: editedTitle.trim(),
        updatedAt: Date.now()
      });

      setIsEditingTitle(false);
      toast.success('Title updated');
    } catch (error) {
      console.error('Failed to update title:', error);
      toast.error('Failed to update title');
    }
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null || !gallery) return;

    if (direction === 'prev') {
      setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : gallery.images.length - 1);
    } else {
      setSelectedImageIndex(selectedImageIndex < gallery.images.length - 1 ? selectedImageIndex + 1 : 0);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;

      if (e.key === 'ArrowLeft') {
        navigateImage('prev');
      } else if (e.key === 'ArrowRight') {
        navigateImage('next');
      } else if (e.key === 'Escape') {
        setSelectedImageIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, gallery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Gallery not found</h2>
          <Button onClick={() => router.push('/dashboard/galleries')}>
            Back to Galleries
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/galleries')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-sm h-8"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') {
                      setIsEditingTitle(false);
                      setEditedTitle(gallery.title);
                    }
                  }}
                  autoFocus
                />
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSaveTitle}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8" 
                  onClick={() => {
                    setIsEditingTitle(false);
                    setEditedTitle(gallery.title);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold">{gallery.title}</h1>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6" 
                  onClick={() => setIsEditingTitle(true)}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{gallery.type}</Badge>
              <span className="text-sm text-muted-foreground">
                {gallery.images.length} images
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="mb-8 p-6 border rounded-lg">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Prompt</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Add details for your ${gallery.type.toLowerCase()}...`}
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleGenerate} 
              disabled={generating || !prompt.trim()}
              className="gap-2"
            >
              {generating ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {generating ? 'Generating 4 Images...' : gallery.images.length === 0 ? 'Generate 4 Images' : 'Generate More'}
            </Button>
          </div>
        </div>
      </div>

      {gallery.images.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No images yet. Generate some above!</p>
        </div>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {gallery.images.map((imageUrl, index) => (
            <Card 
              key={index} 
              className="group overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              onClick={() => setSelectedImageIndex(index)}
            >
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <img
                    src={imageUrl}
                    alt={`Generated image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImageIndex !== null && gallery.images[selectedImageIndex] && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setSelectedImageIndex(null)}
        >
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedImageIndex(null)}
          >
            <X className="w-6 h-6" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="absolute left-4 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              navigateImage('prev');
            }}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="absolute right-4 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              navigateImage('next');
            }}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(gallery.images[selectedImageIndex], selectedImageIndex);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteImage(selectedImageIndex);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>

          <img
            src={gallery.images[selectedImageIndex]}
            alt={`Image ${selectedImageIndex + 1}`}
            className="max-h-[85vh] max-w-[85vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute top-4 left-4 text-white text-sm">
            {selectedImageIndex + 1} / {gallery.images.length}
          </div>
        </div>
      )}
    </div>
  );
}