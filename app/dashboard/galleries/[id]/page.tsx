
"use client"
import React, { useState, useEffect, use, useMemo, useCallback, lazy, Suspense } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowUp, Download, Trash2, Grid, List, X, ChevronLeft, ChevronRight, Check, Pencil, Share2, Copy, Upload, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { galleryService } from '@/services/galleryService';
import type { Gallery } from '@/types/gallery';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Lazy load heavy components
const ImageModal = lazy(() => import('@/app/common/dashboard/ImageModal').then(module => ({ default: module.ImageModal })));

interface GalleryPageProps {
  params: Promise<{ id: string }>;
}

// Memoized image component for better performance
const OptimizedGalleryImage = React.memo(({ 
  imageUrl, 
  index, 
  onClick, 
  onDelete 
}: { 
  imageUrl: string; 
  index: number; 
  onClick: () => void; 
  onDelete: () => void; 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <Card 
      className="group overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative aspect-square bg-gray-100">
          {!error ? (
            <>
              {imageUrl.includes('.mp4') || imageUrl.includes('video') ? (
                <video
                  src={imageUrl}
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                />
              ) : (
                <img
                  src={imageUrl}
                  alt={`Generated image ${index + 1}`}
                  className={`w-full h-full object-cover transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
                  loading="lazy"
                  onLoad={() => setLoaded(true)}
                  onError={() => setError(true)}
                />
              )}
              {!loaded && !imageUrl.includes('video') && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-sm">Failed to load</span>
            </div>
          )}
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedGalleryImage.displayName = 'OptimizedGalleryImage';

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
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generationMode, setGenerationMode] = useState<'image' | 'video'>('image');
  const [videoSettings, setVideoSettings] = useState({
    duration: 5,
    resolution: "1080p",
    aspectRatio: "16:9"
  });

  // Memoized handlers to prevent recreation on every render
  const handleDeleteImage = useCallback(async (imageIndex: number) => {
    if (!gallery) return;
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const updatedImages = gallery.images.filter((_, index) => index !== imageIndex);

      await galleryService.updateGallery(gallery.id, { 
        images: updatedImages 
      });

      setGallery(prev => prev ? {
        ...prev,
        images: updatedImages,
        updatedAt: Date.now()
      } : null);

      setSelectedImageIndex(null);
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error('Failed to delete image');
    }
  }, [gallery]);

  const handleImageClick = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  // Optimized file upload handler
  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!gallery || !user) return;

    setUploading(true);
    try {
      const validFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/') || file.type.startsWith('video/')
      );

      if (validFiles.length === 0) {
        toast.error('Please select valid image or video files');
        return;
      }

      // Upload files in batches of 3 to avoid overwhelming the server
      const batchSize = 3;
      const uploadedUrls: string[] = [];

      for (let i = 0; i < validFiles.length; i += batchSize) {
        const batch = validFiles.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (file) => {
          const timestamp = Date.now();
          const fileName = `${timestamp}-${Math.random().toString(36).substr(2, 9)}-${file.name}`;
          const filePath = `users/${user.uid}/images/${fileName}`;

          const storageRef = ref(storage, filePath);
          await uploadBytes(storageRef, file);
          return await getDownloadURL(storageRef);
        });

        const batchUrls = await Promise.all(batchPromises);
        uploadedUrls.push(...batchUrls);
      }

      const newImages = [...(gallery.images || []), ...uploadedUrls];

      await galleryService.updateGallery(gallery.id, { 
        images: newImages
      });

      setGallery(prev => prev ? {
        ...prev,
        images: newImages,
        updatedAt: Date.now()
      } : null);

      toast.success(`Uploaded ${validFiles.length} file(s) successfully`);
    } catch (error) {
      console.error('Failed to upload files:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  }, [gallery, user]);

  // Memoized drag handlers
  const dragHandlers = useMemo(() => ({
    handleDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files);
      }
    },
    handleDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    },
    handleDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setIsDragging(false);
      }
    }
  }), [handleFileUpload]);

  // Load gallery data
  useEffect(() => {
    if (!user) return;
    
    const loadGallery = async () => {
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

    loadGallery();
  }, [user, id, router]);

  const handleMoreLikeThis = async () => {
    if (!user || !gallery) return;

    setGenerating(true);
    try {
      const response = await fetch('/api/galleries/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({
          mode: 'moreLikeThis',
          referencePrompt: gallery.prompt,
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
          images: updatedImages
        });

        setGallery(prev => prev ? {
          ...prev,
          images: updatedImages,
          updatedAt: Date.now()
        } : null);

        setSelectedImageIndex(null);
        toast.success(`Generated ${data.images.length} similar images`);
      } else {
        throw new Error('No images were generated');
      }
    } catch (error) {
      console.error('Failed to generate similar images:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate similar images');
    } finally {
      setGenerating(false);
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
      if (generationMode === 'image') {
        const response = await fetch('/api/galleries/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.uid,
          },
          body: JSON.stringify({
            prompt: prompt.trim(),
            previousPrompt: gallery.prompt,
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

          setGallery(prev => prev ? {
            ...prev,
            images: updatedImages,
            prompt: prompt.trim(),
            updatedAt: Date.now()
          } : null);

          toast.success(`Generated ${data.images.length} images successfully`);
        } else {
          throw new Error('No images were generated');
        }
      } else {
        // Video generation
        const response = await fetch('/api/galleries/video-generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.uid,
          },
          body: JSON.stringify({
            prompt: prompt.trim(),
            previousPrompt: gallery.prompt,
            seconds: videoSettings.duration,
            outputs: 2,
            resolution: videoSettings.resolution,
            aspectRatio: videoSettings.aspectRatio
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate videos');
        }

        const data = await response.json();

        if (data.videos && data.videos.length > 0) {
          const updatedImages = [...(gallery.images || []), ...data.videos];

          await galleryService.updateGallery(gallery.id, { 
            images: updatedImages,
            prompt: prompt.trim()
          });

          setGallery(prev => prev ? {
            ...prev,
            images: updatedImages,
            prompt: prompt.trim(),
            updatedAt: Date.now()
          } : null);

          toast.success(`Generated ${data.videos.length} videos successfully`);
        } else {
          throw new Error('No videos were generated');
        }
      }
    } catch (error) {
      console.error(`Failed to generate ${generationMode}s:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to generate ${generationMode}s`);
    } finally {
      setGenerating(false);
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

      setGallery(prev => prev ? {
        ...prev,
        title: editedTitle.trim(),
        updatedAt: Date.now()
      } : null);

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

      setGallery(prev => prev ? {
        ...prev,
        isPublic: accessLevel === 'public',
        updatedAt: Date.now()
      } : null);

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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
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
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Loading gallery...</p>
        </div>
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
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
            id="file-upload"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('file-upload')?.click()}
            className="flex items-center gap-2"
            disabled={uploading}
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">
              {uploading ? 'Uploading...' : 'Upload'}
            </span>
          </Button>
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

      <div
        onDrop={dragHandlers.handleDrop}
        onDragOver={dragHandlers.handleDragOver}
        onDragLeave={dragHandlers.handleDragLeave}
        className={`min-h-[400px] relative ${
          isDragging ? 'bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg' : ''
        }`}
      >
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50/90 rounded-lg z-10">
            <div className="text-center">
              <Upload className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <p className="text-blue-700 font-medium">Drop files here to upload</p>
              <p className="text-blue-600 text-sm">Images and videos supported</p>
            </div>
          </div>
        )}

        {gallery.images.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No images yet. Generate some above or drag files here!</p>
          </div>
        ) : (
          <div className={`grid gap-4 ${
            viewMode === 'grid' 
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {gallery.images.map((imageUrl, index) => (
              <OptimizedGalleryImage
                key={`${imageUrl}-${index}`}
                imageUrl={imageUrl}
                index={index}
                onClick={() => handleImageClick(index)}
                onDelete={() => handleDeleteImage(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add padding to prevent content from being hidden behind fixed prompt box */}
      <div className="pb-32"></div>

      {/* Fixed Prompt Box at Bottom Center */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-3xl px-4 shadow-4xl">
        <div className="relative rounded-2xl border border-border bg-background shadow-lg focus-within:shadow-xl transition-shadow">
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Edit your prompt and generate ${generationMode === 'image' ? '4 more images' : '2 more videos'}...`}
              rows={3}
              className="resize-none text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[100px] pl-3 pr-14 pb-12"
            />

            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <Button
                onClick={() => setGenerationMode(generationMode === 'image' ? 'video' : 'image')}
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs font-medium"
              >
                {generationMode === 'image' ? 'Image' : 'Video'}
              </Button>
              
              {generationMode === 'video' && (
                <>
                  <select
                    value={videoSettings.duration}
                    onChange={(e) => setVideoSettings({...videoSettings, duration: parseInt(e.target.value)})}
                    className="h-8 px-2 text-xs border border-border rounded bg-background"
                  >
                    <option value={5}>5s</option>
                    <option value={10}>10s</option>
                  </select>
                  
                  <select
                    value={videoSettings.resolution}
                    onChange={(e) => setVideoSettings({...videoSettings, resolution: e.target.value})}
                    className="h-8 px-2 text-xs border border-border rounded bg-background"
                  >
                    <option value="480p">480p</option>
                    <option value="1080p">1080p</option>
                  </select>
                  
                  <select
                    value={videoSettings.aspectRatio}
                    onChange={(e) => setVideoSettings({...videoSettings, aspectRatio: e.target.value})}
                    className="h-8 px-2 text-xs border border-border rounded bg-background"
                  >
                    <option value="16:9">16:9</option>
                    <option value="9:16">9:16</option>
                    <option value="1:1">1:1</option>
                  </select>
                </>
              )}
            </div>

            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Button
                onClick={handleGenerate}
                size="sm"
                className="h-8 w-8 p-0 rounded-lg bg-foreground hover:bg-foreground/90 text-background disabled:opacity-50 rounded-full"
                disabled={generating || !prompt.trim()}
              >
                {generating ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
        {selectedImageIndex !== null && (
          <ImageModal
            isOpen={selectedImageIndex !== null}
            onClose={() => setSelectedImageIndex(null)}
            images={gallery.images}
            selectedIndex={selectedImageIndex}
            onNavigate={navigateImage}
            onDownload={handleDownload}
            onDelete={handleDeleteImage}
            onMoreLikeThis={handleMoreLikeThis}
            gallery={{
              title: gallery.title,
              type: gallery.type,
              prompt: prompt
            }}
          />
        )}
      </Suspense>

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
