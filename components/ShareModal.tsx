
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { shortsService } from '@/services/shortsService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Copy,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle,
  Eye,
  Lock,
  X
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: any;
  type?: 'image' | 'video' | 'mockup' | 'upscale' | 'canvas' | 'gallery' | 'story';
}

export function ShareModal({
  isOpen,
  onClose,
  document,
  type = 'image'
}: ShareModalProps) {
  const [accessLevel, setAccessLevel] = useState<'private' | 'view'>(
    document.shareSettings?.accessLevel === 'edit' ? 'view' : document.shareSettings?.accessLevel || 'private'
  );
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const getShareUrl = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    if (type === 'gallery') {
      return `${baseUrl}/m/gallery/${document.id}`;
    }

    if (type === 'video' || document.model) {
      return `${baseUrl}/m/shorts/${document.id}`;
    }

    return `${baseUrl}/dashboard/${type === 'story' ? 'stories' : type}/${document.id}`;
  };

  const shareUrl = getShareUrl();
  const shareTitle = document.name || document.title || 'Amazing Creation';
  const shareText = `Check out this ${type === 'video' ? 'video' : type === 'canvas' ? 'canvas' : 'image'}: ${shareTitle}`;

  const handleAccessLevelChange = async (newAccessLevel: 'private' | 'view') => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      
      if (type === 'video' || document.model) {
        await shortsService.updateSharePermissions(document.id, newAccessLevel);
      } else {
        const { documentService } = await import('@/services/documentService');
        await documentService.updateSharePermissions(document.id, newAccessLevel);
      }

      setAccessLevel(newAccessLevel);

      if (newAccessLevel === 'private') {
        toast.success('Document is now private');
      } else {
        toast.success('Document can now be viewed by anyone with the link');
      }
    } catch (error) {
      console.error('Failed to update permissions:', error);
      toast.error('Failed to update sharing permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      if (accessLevel === 'private') {
        toast.error('Please set access level to share this document');
        return;
      }

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
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-background border rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {type === 'canvas' ? 'Share your canvas' : 'Share Creation'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                id="share-url"
                value={shareUrl}
                readOnly
                className="flex-1"
                disabled={accessLevel === 'private'}
              />
              <Button
                onClick={handleCopyLink}
                size="icon"
                variant="outline"
                disabled={accessLevel === 'private'}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {accessLevel === 'private'
              ? 'Set access level to share this document.'
              : 'Public links can be reshared. Share responsibly, stop sharing anytime by changing access to private.'
            }
          </p>

          <div className="bg-muted/30 border rounded-lg p-4 space-y-3">
            <h4 className="font-medium">Sharing Settings</h4>
            <p className="text-xs text-muted-foreground">
              Control the access to the {type === 'canvas' ? 'canvas' : 'board'} even after you have shared the link.
            </p>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Link Access</Label>
              <div className="space-y-2">
                <Button
                  variant={accessLevel === 'private' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => handleAccessLevelChange('private')}
                  disabled={isLoading}
                >
                  <Lock className="w-4 h-4 mr-3" />
                  Private - Only you can access
                </Button>
                <Button
                  variant={accessLevel === 'view' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => handleAccessLevelChange('view')}
                  disabled={isLoading}
                >
                  <Eye className="w-4 h-4 mr-3" />
                  View - Anyone with the link can view
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Buttons */}
        <div className="space-y-2 mt-4">
          <Label>Share on Social Media</Label>
          <div className="flex flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => handleSocialShare('twitter')}
              size="icon"
            >
              <Twitter className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialShare('facebook')}
              size="icon"
            >
              <Facebook className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialShare('linkedin')}
              size="icon"
            >
              <Linkedin className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialShare('whatsapp')}
              size="icon"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialShare('email')}
              size="icon"
            >
              <Mail className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
