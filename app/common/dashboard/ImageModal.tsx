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

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']);
          return;
        }

        canvas.width = Math.min(img.width, 200);
        canvas.height = Math.min(img.height, 200);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        const colorMap = new Map<string, number>();

        // Sample every 20th pixel
        for (let i = 0; i < pixels.length; i += 80) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const alpha = pixels[i + 3];

          if (alpha > 100) {
            // Round colors to reduce variation
            const roundedR = Math.round(r / 32) * 32;
            const roundedG = Math.round(g / 32) * 32;
            const roundedB = Math.round(b / 32) * 32;
            const color = `rgb(${roundedR}, ${roundedG}, ${roundedB})`;
            colorMap.set(color, (colorMap.get(color) || 0) + 1);
          }
        }

        const sortedColors = Array.from(colorMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([color]) => color);

        const finalColors = sortedColors.length > 0 ? sortedColors : ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#DDA0DD'];
        
        console.log('🎨 COLOR EXTRACTION DEBUG:');
        console.log('Image URL:', imageUrl);
        console.log('Canvas size:', canvas.width, 'x', canvas.height);
        console.log('Total pixels sampled:', pixels.length / 4);
        console.log('Color map size:', colorMap.size);
        console.log('Extracted colors:', finalColors);
        console.log('Using fallback colors?', sortedColors.length === 0);
        
        resolve(finalColors);
      } catch (error) {
        // Fallback colors if extraction fails
        resolve(['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#DDA0DD']);
      }
    };

    img.onerror = () => {
      // Fallback colors if image fails to load
      resolve(['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#DDA0DD']);
    };

    img.crossOrigin = 'anonymous';
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
      console.log('🚀 Starting color extraction for image:', images[selectedIndex]);
      extractImageColors(images[selectedIndex]).then((colors) => {
        console.log('✅ Color extraction complete, setting colors:', colors);
        setImageColors(colors);
      });
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

          {/* Prompt */}
          {gallery.prompt && (
            <div className="p-6 border-b">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Prompt</h4>
              <p className="text-sm leading-relaxed">{gallery.prompt}</p>

              {/* Color Palette under prompt */}
              <div className="mt-4 p-4 bg-muted/30 rounded-lg border-2 border-yellow-400">
                <h4 className="text-sm font-medium text-foreground mb-3 font-bold">🎨 Color Palette (DEBUG)</h4>
                <div className="flex gap-3 flex-wrap">
                  {imageColors.map((color, index) => (
                    <div key={index} className="flex flex-col items-center gap-1">
                      <button
                        className="w-12 h-12 rounded-lg border-4 border-black hover:scale-110 transition-transform cursor-pointer shadow-lg"
                        style={{ backgroundColor: color }}
                        onClick={() => handleCopyColor(color)}
                        title={`Click to copy ${color}`}
                      />
                      <span className="text-xs font-mono text-foreground bg-background px-1 py-0.5 rounded border">
                        {color}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Total colors extracted: {imageColors.length}
                </div>
              </div>
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