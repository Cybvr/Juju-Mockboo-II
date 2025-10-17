
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Twitter, Facebook, Linkedin, Mail, MessageCircle, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';
import type { Gallery } from '@/types/gallery';
import { useState } from 'react';

interface GalleryShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  gallery: Gallery;
  galleryAccessLevel: 'private' | 'public';
  onAccessLevelChange: (level: 'private' | 'public') => void;
  onCopyLink: () => void;
}

export function GalleryShareModal({ 
  isOpen, 
  onClose, 
  gallery, 
  galleryAccessLevel,
  onAccessLevelChange,
  onCopyLink
}: GalleryShareModalProps) {
  const shareUrl = `${window.location.origin}/m/gallery/${gallery.id}`;
  const shareTitle = gallery.title;
  const shareText = `Check out this gallery: ${shareTitle}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  };

  const handleSocialShare = (platform: string) => {
    let url = '';

    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
        break;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Gallery</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Access Level Controls */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Who can access this gallery?</div>
            <div className="space-y-2">
              <Button
                variant={galleryAccessLevel === 'private' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => onAccessLevelChange('private')}
              >
                <Lock className="w-4 h-4 mr-3" />
                Private - Only you can view
              </Button>
              <Button
                variant={galleryAccessLevel === 'public' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => onAccessLevelChange('public')}
              >
                <Globe className="w-4 h-4 mr-3" />
                Public - Anyone with the link can view
              </Button>
            </div>
          </div>

          {galleryAccessLevel === 'public' && (
            <>
              <div className="flex items-center space-x-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={handleCopyLink}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Anyone with this link can view your gallery
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Share on Social Media</div>
                <div className="flex flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare('twitter')}
                    className="justify-start"
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare('facebook')}
                    className="justify-start"
                  >
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare('linkedin')}
                    className="justify-start"
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare('whatsapp')}
                    className="justify-start"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare('email')}
                    className="justify-start"
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {galleryAccessLevel === 'private' && (
            <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
              Gallery is private. Switch to public to share with others.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
