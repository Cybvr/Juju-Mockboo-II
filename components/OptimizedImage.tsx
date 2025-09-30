
'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fill?: boolean;
}

export function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  width,
  height,
  priority = false,
  fill = false
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src || "/placeholder.svg");

  const handleError = () => {
    setImgSrc('/placeholder.svg');
  };

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={className}
        priority={priority}
        quality={85}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={handleError}
        style={{ objectFit: 'cover' }}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width || 800}
      height={height || 600}
      className={className}
      priority={priority}
      quality={85}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      onError={handleError}
      style={{ 
        maxWidth: '100%', 
        height: 'auto',
        objectFit: 'cover'
      }}
    />
  );
}
