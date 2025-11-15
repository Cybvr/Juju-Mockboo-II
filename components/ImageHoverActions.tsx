'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Video, MessageSquare, Plus } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface ImageHoverActionsProps {
  imageUrl: string;
  imageName?: string;
  className?: string;
  documentId: string; // documentId is now required
  onAddToBoard?: (documentId: string, imageUrl: string) => void;
  mediaType?: 'image' | 'video';
}

export function ImageHoverActions({ imageUrl, imageName = 'image', className = '', documentId, onAddToBoard, mediaType = 'image' }: ImageHoverActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  const handleDownload = async () => {
    const fileExtension = mediaType === 'video' ? 'mp4' : 'png';
    try {
      // Try direct fetch first
      let response;
      try {
        response = await fetch(imageUrl);
        if (!response.ok) throw new Error('Fetch failed');
      } catch (fetchError) {
        // If direct fetch fails due to CORS, use a fallback method
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `${imageName}.${fileExtension}`;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${imageName}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(`Failed to download ${mediaType}:`, error);
      // Final fallback - open in new tab
      window.open(imageUrl, '_blank');
    }
  };

  const handleUseAsFirstFrame = async () => {
    try {
      // Convert image URL to data URL for persistent storage
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = () => {
        sessionStorage.setItem('firstFrameImage', reader.result as string);
        router.push('/dashboard/videos');
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      // Fallback to original URL if conversion fails
      sessionStorage.setItem('firstFrameImage', imageUrl);
      router.push('/dashboard/videos');
    }
  };

  const handleUseInChat = () => {
    // Store the image URL in session storage for chat
    sessionStorage.setItem('chatImage', imageUrl);
    // Navigate to chat page (create new chat)
    router.push('/dashboard/chat');
  };

  const handleAddToBoard = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (onAddToBoard) {
      onAddToBoard(documentId, imageUrl);
    } else {
      // Fallback to localStorage if no callback provided
      const imageData = {
        url: imageUrl,
        name: imageName,
        documentId: documentId,
        addedAt: new Date().toISOString()
      };
      
      const existingItems = JSON.parse(localStorage.getItem('boardImages') || '[]');
      const alreadyExists = existingItems.some((item: any) => item.url === imageUrl);
      
      if (!alreadyExists) {
        existingItems.push(imageData);
        localStorage.setItem('boardImages', JSON.stringify(existingItems));
        console.log('Added to board:', imageName);
      } else {
        console.log('Image already in board:', imageName);
      }
    }
  };

  const handleOpenInNewTab = () => {
    window.open(imageUrl, '_blank');
  };

  // Determine which context-specific button to show
  const isVideoPage = pathname.includes('/videos');
  const isChatPage = pathname.includes('/chat');

  return (
    <>
      {/* Top middle hover overlay */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 flex gap-1 pointer-events-none group-hover:pointer-events-auto">
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/90 hover:bg-white text-black shadow-lg p-1 h-7 w-7"
          onClick={handleAddToBoard}
          title="Add to board"
        >
          <Plus className="h-3 w-3" />
        </Button>
        {/* Context-specific button */}
        {!isVideoPage && mediaType === 'image' && (
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 hover:bg-white text-black shadow-lg p-1 h-7 w-7"
            onClick={handleUseAsFirstFrame}
            title="Use as first frame in video"
          >
            <Video className="h-3 w-3" />
          </Button>
        )}
        {!isChatPage && mediaType === 'image' && (
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 hover:bg-white text-black shadow-lg p-1 h-7 w-7"
            onClick={handleUseInChat}
            title="Use in chat"
          >
            <MessageSquare className="h-3 w-3" />
          </Button>
        )}
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/90 hover:bg-white text-black shadow-lg p-1 h-7 w-7"
          onClick={handleDownload}
          title="Download"
        >
          <Download className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/90 hover:bg-white text-black shadow-lg p-1 h-7 w-7"
          onClick={handleOpenInNewTab}
          title="Open in new tab"
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    </>
  );
}
