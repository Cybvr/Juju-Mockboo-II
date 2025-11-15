'use client'

import { useEffect, useState } from 'react';

interface CanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onCanvasReady?: () => void;
  onAddImage?: (fileOrUrl: File | string) => void;
}

export function Canvas({ canvasRef, onCanvasReady, onAddImage }: CanvasProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (onCanvasReady) {
      onCanvasReady();
    }
  }, [onCanvasReady]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0 && onAddImage) {
      // Add the first image file to the canvas
      onAddImage(imageFiles[0]);
    }
  };

  return (
    <main className="flex-1 bg-muted overflow-auto relative">
      <div className="h-full flex items-center justify-center p-8">
        <div 
          className={`bg-background rounded-lg shadow-lg border transition-all duration-200 overflow-hidden ${
            isDragOver 
              ? 'border-blue-400 border-2 border-dashed bg-blue-50/50' 
              : 'border-border'
          }`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="block"
            data-testid="design-canvas"
          />
          {isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-100/80 pointer-events-none">
              <div className="text-blue-600 text-lg font-semibold">
                Drop image here to add to canvas
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}