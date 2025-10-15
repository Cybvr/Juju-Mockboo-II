"use client"
import React, { useState, useEffect, use } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Download, Trash2, Grid, List } from 'lucide-react';
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
        },
        body: JSON.stringify({
          prompt: prompt,
          outputs: 4
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate images');
      }

      const data = await response.json();
      const updatedImages = [...gallery.images, ...data.images];

      await galleryService.updateGallery(gallery.id, { 
        images: updatedImages 
      });

      setGallery({
        ...gallery,
        images: updatedImages,
        updatedAt: Date.now()
      });

      setPrompt('');
      toast.success(`Generated ${data.images.length} images successfully`);
    } catch (error) {
      console.error('Failed to generate images:', error);
      toast.error('Failed to generate images');
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
    } catch (error) {
      console.error('Failed to download image:', error);
      toast.error('Failed to download image');
    }
  };

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
            <h1 className="text-3xl font-bold">{gallery.title}</h1>
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
            {generating ? 'Generating 4 Images...' : 'Generate 4 Images'}
          </Button>
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
            <Card key={index} className="group overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <img
                    src={imageUrl}
                    alt={`Generated image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => handleDownload(imageUrl, index)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDeleteImage(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}