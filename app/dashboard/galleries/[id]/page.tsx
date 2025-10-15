
"use client"
import React, { useState, useEffect, use } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Download, Trash2, Plus, Grid, List, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { galleryService } from '@/services/galleryService';
import type { Gallery, GalleryImage } from '@/types/gallery';
import { toast } from 'sonner';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GalleryPageProps {
  params: Promise<{ id: string }>;
}

const aspectRatios = [
  { label: '1:1 (Square)', value: '1:1' },
  { label: '16:9 (Landscape)', value: '16:9' },
  { label: '9:16 (Portrait)', value: '9:16' },
  { label: '4:3 (Standard)', value: '4:3' },
  { label: '3:4 (Portrait)', value: '3:4' }
];

export default function GalleryPage({ params }: GalleryPageProps) {
  const { id } = use(params);
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

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
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({
          mode: 'text',
          prompt: `${gallery.prompt ? gallery.prompt + ', ' : ''}${prompt}`,
          settings: {
            outputs: '4',
            aspectRatio: aspectRatio
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate images');
      }

      const data = await response.json();
      const newImages: GalleryImage[] = data.images.map((url: string, index: number) => ({
        id: `${Date.now()}_${index}`,
        url: url,
        prompt: prompt,
        createdAt: Date.now(),
        aspectRatio: aspectRatio
      }));

      const updatedGallery = {
        ...gallery,
        images: [...gallery.images, ...newImages],
        updatedAt: Date.now()
      };

      await galleryService.updateGallery(gallery.id, updatedGallery);
      setGallery(updatedGallery);
      setPrompt('');
      toast.success(`Generated ${newImages.length} images successfully`);
    } catch (error) {
      console.error('Failed to generate images:', error);
      toast.error('Failed to generate images');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!gallery) return;
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const updatedImages = gallery.images.filter(img => img.id !== imageId);
      const updatedGallery = {
        ...gallery,
        images: updatedImages,
        updatedAt: Date.now()
      };

      await galleryService.updateGallery(gallery.id, updatedGallery);
      setGallery(updatedGallery);
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleDownload = async (imageUrl: string, imageId: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gallery_${gallery?.title}_${imageId}.png`;
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
      {/* Header */}
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

      {/* Generation Panel */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Generate New Images</h3>
          {gallery.prompt && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Base Prompt:</p>
              <p className="text-sm">{gallery.prompt}</p>
            </div>
          )}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Your Prompt</label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`Add specific details for your ${gallery.type.toLowerCase()}...`}
                  rows={3}
                />
              </div>
              <div className="w-48">
                <label className="text-sm font-medium mb-2 block">Aspect Ratio</label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aspectRatios.map(ratio => (
                      <SelectItem key={ratio.value} value={ratio.value}>
                        {ratio.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
              {generating ? 'Generating 8 Images...' : 'Generate 8 Images'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Images Grid */}
      {gallery.images.length === 0 ? (
        <div className="text-center py-20">
          <Grid className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No images yet</h3>
          <p className="text-muted-foreground">Generate your first set of images above</p>
        </div>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {gallery.images.map((image) => (
            <Card key={image.id} className="group overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => handleDownload(image.url, image.id)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {viewMode === 'list' && (
                  <div className="p-4">
                    <p className="text-sm mb-2">{image.prompt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{image.aspectRatio}</span>
                      <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
