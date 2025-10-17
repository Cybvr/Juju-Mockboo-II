
'use client'
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight, Download, Sparkles, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  selectedIndex: number;
  onNavigate: (direction: 'prev' | 'next') => void;
  onDownload: (imageUrl: string, index: number) => void;
  onDelete: (index: number) => void;
  onMoreLikeThis: () => void;
  gallery: {
    title: string;
    type: string;
    prompt?: string;
  };
}

const extractImageColors = async (imageUrl: string): Promise<string[]> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve([]);
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      const colorMap = new Map<string, number>();
      
      // Sample every 10th pixel to improve performance
      for (let i = 0; i < pixels.length; i += 40) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const alpha = pixels[i + 3];
        
        if (alpha > 128) { // Skip transparent pixels
          const color = `rgb(${r}, ${g}, ${b})`;
          colorMap.set(color, (colorMap.get(color) || 0) + 1);
        }
      }
      
      // Get top 5 colors
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([color]) => color);
      
      resolve(sortedColors);
    };
    
    img.onerror = () => resolve([]);
    img.src = imageUrl;
  });
};

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  images,
  selectedIndex,
  onNavigate,
  onDownload,
  onDelete,
  onMoreLikeThis,
  gallery
}) => {
  const [imageColors, setImageColors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && images[selectedIndex]) {
      extractImageColors(images[selectedIndex]).then(setImageColors);
    }
  }, [isOpen, selectedIndex, images]);

  if (!isOpen || selectedIndex === null || !images[selectedIndex]) {
    return null;
  }

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast.success(`Copied ${color}`);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
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
              onNavigate('prev');
            }}
            disabled={images.length <= 1}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white md:hidden"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
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
              onNavigate('next');
            }}
            disabled={images.length <= 1}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          <img
            src={images[selectedIndex]}
            alt={`Image ${selectedIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
          
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded text-sm">
            {selectedIndex + 1} / {images.length}
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
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <Badge variant="secondary" className="mt-2">{gallery.type}</Badge>
          </div>

          {/* Color Palette */}
          {imageColors.length > 0 && (
            <div className="p-6 border-b">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Color Palette</h4>
              <div className="flex gap-2">
                {imageColors.map((color, index) => (
                  <button
                    key={index}
                    className="w-8 h-8 rounded-full border-2 border-border hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: color }}
                    onClick={() => handleCopyColor(color)}
                    title={`Click to copy ${color}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Prompt */}
          {gallery.prompt && (
            <div className="p-6 border-b">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Prompt</h4>
              <p className="text-sm leading-relaxed">{gallery.prompt}</p>
            </div>
          )}

          {/* Actions */}
          <div className="p-6 space-y-3">
            <Button
              className="w-full justify-start"
              onClick={(e) => {
                e.stopPropagation();
                onDownload(images[selectedIndex], selectedIndex);
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
                onMoreLikeThis();
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
                const imageUrl = images[selectedIndex];
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
                onDelete(selectedIndex);
              }}
            >
              <Trash2 className="w-4 h-4 mr-3" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
