"use client"
import React, { useState, useEffect, use } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Sparkles, Download, Trash2, Grid, List, X, ChevronLeft, ChevronRight, Check, Pencil, Share2, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { galleryService } from '@/services/galleryService';
import type { Gallery } from '@/types/gallery';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [galleryAccessLevel, setGalleryAccessLevel] = useState<'private' | 'public'>('private');

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

  const handleShareAccess = async (accessLevel: 'private' | 'public') => {
    if (!gallery) return;

    try {
      await galleryService.updateGallery(gallery.id, { 
        isPublic: accessLevel === 'public'
      });

      setGallery({
        ...gallery,
        isPublic: accessLevel === 'public',
        updatedAt: Date.now()
      });

      setGalleryAccessLevel(accessLevel);
      toast.success(accessLevel === 'public' ? 'Gallery is now public' : 'Gallery is now private');
    } catch (error) {
      console.error('Failed to update gallery access:', error);
      toast.error('Failed to update gallery access');
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/m/gallery/${gallery?.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard');
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
              <h1 
                className="text-sm font-semibold cursor-pointer hover:bg-muted px-2 py-1 rounded"
                onClick={() => setIsEditingTitle(true)}
              >
                {gallery.title}
              </h1>
            )}

          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className="hidden md:flex"
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
            className="hidden md:flex"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {prompt && (
        <div className="mb-6 p-4 bg-muted/30 rounded-lg border">
          <p className="text-sm text-muted-foreground mb-1">Original prompt:</p>
          <p className="text-sm">{prompt}</p>
        </div>
      )}

      {gallery.images.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No images yet. Generate some above!</p>
        </div>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
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

      {/* Prompt editing section at bottom */}
      <div className="mt-12 border-t pt-8">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold mb-4">Edit & Generate More</h3>
          <div className="flex gap-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to create..."
              className="flex-1 min-h-[100px] resize-none"
            />
            <Button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="px-8"
            >
              {generating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Generating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Generate
                </div>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Edit your prompt and generate 4 more images for this gallery
          </p>
        </div>
      </div>

      {/* Pinterest-style Image Modal - Mobile Optimized */}
      {selectedImageIndex !== null && gallery.images[selectedImageIndex] && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div 
            className="bg-background w-full h-full md:rounded-2xl md:shadow-2xl md:max-w-7xl md:w-auto md:max-h-[90vh] flex flex-col md:flex-row overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Section */}
            <div className="flex-1 flex items-center justify-center bg-background relative min-h-0 p-4 md:p-0">
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-4 left-4 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('prev');
                }}
                disabled={gallery.images.length <= 1}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white md:hidden"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(null);
                }}
              >
                <X className="w-6 h-6" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="absolute top-4 right-16 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('next');
                }}
                disabled={gallery.images.length <= 1}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>

              <img
                src={gallery.images[selectedImageIndex]}
                alt={`Image ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />

              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded text-sm">
                {selectedImageIndex + 1} / {gallery.images.length}
              </div>
            </div>

            {/* Info Panel */}
            <div className="w-full md:w-96 bg-background flex flex-col border-t md:border-t-0 md:border-l max-h-[40vh] md:max-h-full overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{gallery.title}</h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hidden md:flex"
                    onClick={() => setSelectedImageIndex(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <Badge variant="secondary" className="mt-2">{gallery.type}</Badge>
              </div>

              {/* Prompt */}
              {prompt && (
                <div className="p-6 border-b">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Prompt</h4>
                  <p className="text-sm leading-relaxed">{prompt}</p>
                </div>
              )}

              {/* Actions */}
              <div className="p-6 space-y-3">
                <Button
                  className="w-full justify-start"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(gallery.images[selectedImageIndex], selectedImageIndex);
                  }}
                >
                  <Download className="w-4 h-4 mr-3" />
                  Download
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Generate more like this:', gallery.images[selectedImageIndex]);
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-3" />
                  More Like This
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={(e) => {
                    e.stopPropagation();
                    const imageUrl = gallery.images[selectedImageIndex];
                    navigator.clipboard.writeText(imageUrl);
                    toast.success('Image URL copied');
                  }}
                >
                  <Copy className="w-4 h-4 mr-3" />
                  Copy Image URL
                </Button>

                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(selectedImageIndex);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Gallery</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Private</p>
                  <p className="text-sm text-muted-foreground">Only you can access</p>
                </div>
                <Button
                  variant={galleryAccessLevel === 'private' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleShareAccess('private')}
                >
                  {galleryAccessLevel === 'private' ? 'Current' : 'Set Private'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Public</p>
                  <p className="text-sm text-muted-foreground">Anyone with link can view</p>
                </div>
                <Button
                  variant={galleryAccessLevel === 'public' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleShareAccess('public')}
                >
                  {galleryAccessLevel === 'public' ? 'Current' : 'Make Public'}
                </Button>
              </div>
            </div>

            {galleryAccessLevel === 'public' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={`${window.location.origin}/m/gallery/${gallery?.id}`}
                    className="flex-1"
                  />
                  <Button onClick={handleCopyLink} size="icon">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Public link - anyone can view this gallery
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}