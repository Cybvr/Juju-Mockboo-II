'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { documentService } from '@/services/documentService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Copy,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle, Eye, Edit, Lock
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: any;
  type?: 'image' | 'video' | 'mockup' | 'upscale' | 'canvas';
}

export function ShareModal({
  isOpen,
  onClose,
  document,
  type = 'image'
}: ShareModalProps) {
  const [accessLevel, setAccessLevel] = useState<'private' | 'view' | 'edit'>(
    document.shareSettings?.accessLevel || 'private'
  );

  const getShareUrl = () => {
    if (type === 'canvas' || document.type === 'canvas') {
      return `${window.location.origin}/dashboard/canvas/${document.id}`;
    }
    return `${window.location.origin}/m/${document.id}`;
  };

  const shareUrl = getShareUrl();
  const shareTitle = document.name || document.title || 'Amazing Creation';
  const shareText = `Check out this ${type === 'video' ? 'video' : type === 'canvas' ? 'canvas' : 'image'}: ${shareTitle}`;

  const handleAccessLevelChange = async (newAccessLevel: 'private' | 'view' | 'edit') => {
    try {
      setAccessLevel(newAccessLevel);
      await documentService.updateSharePermissions(document.id, newAccessLevel);

      if (newAccessLevel === 'private') {
        toast.success('Document is now private');
      } else {
        toast.success(`Document can now be ${newAccessLevel === 'view' ? 'viewed' : 'edited'} by anyone with the link`);
      }
    } catch (error) {
      console.error('Failed to update permissions:', error);
      toast.error('Failed to update sharing permissions');
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {type === 'canvas' ? 'Share your canvas' : 'Share Creation'}
          </DialogTitle>
        </DialogHeader>

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

          <div className="bg-t border-boreder space-y-1">
            <h4 className="font-medium">Sharing Settings</h4>
            <p className="text-xs text-muted-foreground">
              Control the access to the {type === 'canvas' ? 'canvas' : 'board'} even after you have shared the link.
            </p>

            <div className="space-y-2 mt-4">
              <Label className="text-sm font-medium">Link Access</Label>
              <Select value={accessLevel} onValueChange={handleAccessLevelChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      <span>Private - Only you can access</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="view">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>View - Anyone with the link can view</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="edit">
                    <div className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      <span>Edit - Anyone with the link can edit</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Social Media Buttons */}
        <div className="space-y-2">
          <Label>Share on Social Media</Label>
          <div className="flex flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => handleSocialShare('twitter')}
              className="justify-start"
            >
              <Twitter className="w-4 h-4 " />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialShare('facebook')}
              className="justify-start"
            >
              <Facebook className="w-4 h-4 " />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialShare('linkedin')}
              className="justify-start"
            >
              <Linkedin className="w-4 h-4 " />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialShare('whatsapp')}
              className="justify-start"
            >
              <MessageCircle className="w-4 h-4 " />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialShare('email')}
              className="justify-start"
            >
              <Mail className="w-4 h-4 " />
            </Button>
          </div>
        </div>


      </DialogContent>
    </Dialog>
  );
}