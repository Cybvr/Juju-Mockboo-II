'use client';

import { ImageHoverActions } from './ImageHoverActions';

interface ImageWithHoverActionsProps {
  src: string;
  alt: string;
  className?: string;
  imageName?: string;
  containerClassName?: string;
  documentId?: string;
  onAddToBoard?: (documentId: string, imageUrl: string) => void;
  onClick?: () => void;
}

export function ImageWithHoverActions({ 
  src, 
  alt, 
  className = '', 
  imageName,
  containerClassName = '',
  documentId,
  onAddToBoard,
  onClick
}: ImageWithHoverActionsProps) {
  return (
    <div className={`relative group overflow-hidden rounded-lg ${containerClassName}`}>
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className={`w-full h-full object-contain ${className}`}
        onClick={onClick}
      />
      <ImageHoverActions 
        imageUrl={src} 
        imageName={imageName || alt}
        className={className}
        documentId={documentId || ''}
        onAddToBoard={onAddToBoard}
      />
    </div>
  );
}