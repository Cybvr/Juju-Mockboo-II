
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Download, ExternalLink } from 'lucide-react';
import { ImageWithHoverActions } from './ImageWithHoverActions';

interface BoardImage {
  url: string;
  name: string;
  documentId: string;
  addedAt: string;
}

export function BoardViewer() {
  const [boardImages, setBoardImages] = useState<BoardImage[]>([]);

  useEffect(() => {
    const loadBoardImages = () => {
      const stored = localStorage.getItem('boardImages');
      if (stored) {
        setBoardImages(JSON.parse(stored));
      }
    };

    loadBoardImages();
    
    // Listen for storage changes to update in real-time
    const handleStorageChange = () => {
      loadBoardImages();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const removeFromBoard = (imageUrl: string) => {
    const updatedImages = boardImages.filter(img => img.url !== imageUrl);
    setBoardImages(updatedImages);
    localStorage.setItem('boardImages', JSON.stringify(updatedImages));
  };

  const clearBoard = () => {
    setBoardImages([]);
    localStorage.removeItem('boardImages');
  };

  const downloadAll = async () => {
    for (const image of boardImages) {
      try {
        const response = await fetch(image.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${image.name}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Failed to download:', image.name, error);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>My Image Board ({boardImages.length})</CardTitle>
          <div className="flex gap-2">
            {boardImages.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadAll}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download All
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearBoard}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear Board
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {boardImages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No images in your board yet.</p>
            <p className="text-sm mt-1">Hover over images and click the + button to add them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {boardImages.map((image, index) => (
              <div key={`${image.url}-${index}`} className="relative group">
                <div className="aspect-square relative">
                  <ImageWithHoverActions
                    src={image.url}
                    alt={image.name}
                    imageName={image.name}
                    documentId={image.documentId}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  
                  {/* Remove button */}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                    onClick={() => removeFromBoard(image.url)}
                    title="Remove from board"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="mt-2">
                  <p className="text-xs font-medium truncate">{image.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(image.addedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
