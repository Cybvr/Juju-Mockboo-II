'use client'
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Grid, List, X, ChevronLeft, ChevronRight, Copy, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { galleryService } from '@/services/galleryService';
import type { Gallery } from '@/types/gallery';
import { toast } from 'sonner';
import Link from 'next/link';

interface PublicGalleryPageProps {
  params: Promise<{ id: string }>;
}

export default function PublicGalleryPage({ params }: PublicGalleryPageProps) {
  const router = useRouter();
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchParams = async () => {
      const resolvedParams = await params;
      loadGallery(resolvedParams.id);
    };
    fetchParams();
  }, [params]);

  const loadGallery = async (id: string) => {
    try {
      setLoading(true);
      const galleryData = await galleryService.getGalleryById(id);
      if (galleryData && galleryData.isPublic) {
        setGallery(galleryData);
      } else {
        toast.error('Gallery not found or not public');
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to load gallery:', error);
      toast.error('Failed to load gallery');
      router.push('/');
    } finally {
      setLoading(false);
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

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null || !gallery) return;
    if (direction === 'prev') {
      setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : gallery.images.length - 1);
    } else {
      setSelectedImageIndex(selectedImageIndex < gallery.images.length - 1 ? selectedImageIndex + 1 : 0);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 100;
    canvas.height = 100;
    if (ctx) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, 100, 100);
      ctx.fillStyle = '#3b82f6';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`Image ${index + 1}`, 50, 50);
    }
    e.dataTransfer.setDragImage(canvas, 50, 50);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex && gallery) {
      const newImages = [...gallery.images];
      const draggedImage = newImages[draggedIndex];
      newImages.splice(draggedIndex, 1);
      const actualDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
      newImages.splice(actualDropIndex, 0, draggedImage);
      setGallery({
        ...gallery,
        images: newImages
      });
      toast.success('Image reordered');
    }
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
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

  const isVideoUrl = (url: string) => {
    return url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') || url.includes('video');
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
          <Button onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header Bar */}
      <div className="flex-shrink-0 px-2 py-2 border-b bg-background">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 min-w-0">
            <Link href="/">
              <img
                src="/assets/images/juju/JUJUBLACK.png"
                alt="Juju"
                className="h-4 dark:hidden flex-shrink-0"
              />
              <img
                src="/assets/images/juju/JUJUWHITE.png"
                alt="Juju"
                className="h-4 hidden dark:block flex-shrink-0"
              />
            </Link>
            <div className="flex items-center gap-2 min-w-0 pl-2">
              <h1 className="text-md font-normal truncate">{gallery.title}</h1>
              <span className="text-sm text-muted-foreground flex-shrink-0">
                {gallery.images.length} items
              </span>
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
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied');
              }}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Frame */}
      <div className="flex-1 overflow-hidden px-4 pb-4 ">
        <div className="h-full overflow-y-auto  rounded-lg p-4 border-card  border">
          <div className="container mx-auto px-4 py-6">
            {gallery.images.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No items in this gallery</p>
              </div>
            ) : (
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {gallery.images.map((imageUrl, index) => {
                  const isVideo = isVideoUrl(imageUrl);
                  return (
                    <Card 
                      key={`${imageUrl}-${index}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`group overflow-hidden cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-primary transition-all ${
                        draggedIndex === index ? 'opacity-50 scale-95' : ''
                      } ${
                        draggedIndex !== null && draggedIndex !== index ? 'ring-2 ring-blue-200 bg-blue-50/50' : ''
                      }`}
                      onClick={() => draggedIndex === null && setSelectedImageIndex(index)}
                    >
                      <CardContent className="p-0">
                        <div className="relative aspect-[9/16] bg-black">
                          {isVideo ? (
                            <video
                              src={imageUrl}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              playsInline
                              onMouseEnter={(e) => e.currentTarget.play()}
                              onMouseLeave={(e) => {
                                e.currentTarget.pause();
                                e.currentTarget.currentTime = 0;
                              }}
                            />
                          ) : (
                            <img
                              src={imageUrl}
                              alt={`Generated image ${index + 1}`}
                              className="w-full h-full object-cover"
                              draggable={false}
                            />
                          )}
                          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-foreground px-2 py-1 rounded text-xs">
                            Drag to reorder
                          </div>
                          {draggedIndex !== null && draggedIndex !== index && (
                            <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-100/20 flex items-center justify-center">
                              <div className="bg-blue-500 text-foreground px-3 py-1 rounded-full text-sm">
                                Drop here
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {selectedImageIndex !== null && gallery.images[selectedImageIndex] && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div 
            className="bg-card rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] flex overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Media Section */}
            <div className="flex-1 flex items-center justify-center bg-gray-50 relative">
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-4 left-4 z-10 hover:bg-black/10"
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
                className="absolute top-4 right-4 z-10 hover:bg-black/10"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('next');
                }}
                disabled={gallery.images.length <= 1}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
              {isVideoUrl(gallery.images[selectedImageIndex]) ? (
                <video
                  src={gallery.images[selectedImageIndex]}
                  controls
                  autoPlay
                  loop
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <img
                  src={gallery.images[selectedImageIndex]}
                  alt={`Image ${selectedImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              )}
              <div className="absolute bottom-4 left-4 bg-black/70 text-foreground px-2 py-1 rounded text-sm">
                {selectedImageIndex + 1} / {gallery.images.length}
              </div>
            </div>
            {/* Info Panel */}
            <div className="w-96 bg-card flex flex-col">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{gallery.title}</h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setSelectedImageIndex(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <Badge variant="secondary" className="mt-2">{gallery.type}</Badge>
              </div>
              {gallery.prompt && (
                <div className="p-6 border-b">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Prompt</h4>
                  <p className="text-sm leading-relaxed">{gallery.prompt}</p>
                </div>
              )}
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
                    const imageUrl = gallery.images[selectedImageIndex];
                    navigator.clipboard.writeText(imageUrl);
                    toast.success('URL copied');
                  }}
                >
                  <Copy className="w-4 h-4 mr-3" />
                  Copy URL
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
