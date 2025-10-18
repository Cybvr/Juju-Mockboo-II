"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar,
  ImageIcon,
  Settings,
  Layers,
  Globe,
  Heart,
  Video,
  Zap,
  Download,
  ExternalLink,
  Edit,
  Tag,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { documentService } from "@/services/documentService";
import { userService } from "@/services/userService";
import { canvasService } from "@/services/canvasService";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { User as UserType, DocumentCategory } from "@/types/firebase";
import { ShareModal } from "@/components/ShareModal";

const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  'Product',
  'UGC', 
  'Storyboard',
  'Posters',
  'Mockups',
  'Products',
  'Commercials',
  'Film',
  'Animation'
];

interface MetadataPanelProps {
  document: any;
  isOpen: boolean;
  onDocumentUpdate?: (updatedDocument: any) => void;
  type?: 'image' | 'video' | 'mockup' | 'upscale';
}

export function MetadataPanel({ document, isOpen, onDocumentUpdate, type = 'image' }: MetadataPanelProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [creator, setCreator] = useState<UserType | null>(null);
  const [loadingCreator, setLoadingCreator] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [user] = useAuthState(auth);

  if (!isOpen || !document) return null;
  const content = document.content || {};

  // Function to calculate time ago
  const getTimeAgo = (date: any) => {
    if (!date) return 'Unknown time';

    const createdDate = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - createdDate.getTime();

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
    if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    if (diffWeeks > 0) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // Fetch creator information
  useEffect(() => {
    const fetchCreator = async () => {
      if (document.userId && !creator) {
        setLoadingCreator(true);
        try {
          const user = await userService.getUserById(document.userId);
          setCreator(user);
        } catch (error) {
          console.error('Failed to fetch creator:', error);
        } finally {
          setLoadingCreator(false);
        }
      }
    };

    fetchCreator();
  }, [document.userId, creator]);

  const getIcon = () => {
    switch (type) {
      case 'video': return Video;
      case 'upscale': return Zap;
      case 'mockup': return Layers;
      default: return ImageIcon;
    }
  };

  const handlePublishToggle = async (isPublic: boolean) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      console.log('Updating document visibility:', { documentId: document.id, isPublic });
      await documentService.updateDocument(document.id, { isPublic });

      const updatedDocument = { 
        ...document, 
        isPublic,
        updatedAt: new Date()
      };

      if (onDocumentUpdate) {
        onDocumentUpdate(updatedDocument);
      }

      console.log('Document visibility updated successfully');
    } catch (error) {
      console.error('Failed to update document visibility:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLikeToggle = async () => {
    setIsUpdating(true);
    try {
      const newStarredState = !document.starred;
      await documentService.updateDocument(document.id, { starred: newStarredState });
      const updatedDocument = { ...document, starred: newStarredState };
      if (onDocumentUpdate) {
        onDocumentUpdate(updatedDocument);
      }
    } catch (error) {
      console.error('Failed to update document like status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCategoryChange = async (category: DocumentCategory) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      console.log('Updating document category:', { documentId: document.id, category });
      await documentService.updateDocument(document.id, { category });

      const updatedDocument = { 
        ...document, 
        category,
        updatedAt: new Date()
      };

      if (onDocumentUpdate) {
        onDocumentUpdate(updatedDocument);
      }

      console.log('Document category updated successfully');
    } catch (error) {
      console.error('Failed to update document category:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const IconComponent = getIcon();

  return (
    <div className="bg-card border rounded-lg flex-shrink-0 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Header with Creator Info and Favorites */}
          <div className="mb-4 pb-3 border-b">
            <div className="flex items-center justify-between">
              <div>
                {loadingCreator ? (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                ) : creator ? (
                  <>
                    <div className="font-semibold text-sm">{creator.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {getTimeAgo(document.createdAt)}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm text-muted-foreground">Unknown Creator</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {getTimeAgo(document.createdAt)}
                    </div>
                  </>
                )}
              </div>

              {/* Action buttons on the right */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleShare}
                  title="Share"
                >
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleLikeToggle}
                  disabled={isUpdating}
                  title="Like"
                >
                  <Heart className={`h-4 w-4 ${document.starred ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Category Selection */}
            <div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium text-sm">Category</span>
                </div>
                <Select
                  value={document.category || ''}
                  onValueChange={handleCategoryChange}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category} className="text-xs">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Publish Toggle */}
            <div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Make Public</div>
                  </div>
                  <Switch
                    checked={document.isPublic || false}
                    onCheckedChange={handlePublishToggle}
                    disabled={isUpdating}
                    className={isUpdating ? "opacity-50" : ""}
                  />
                </div>
              </div>
            </div>

            {/* Generation Settings */}
            {(content.model || content.resolution || content.outputs || content.prompt || content.duration || content.scale_factor) && (
              <div>
                <div className="space-y-1.5">
                  {content.aspectRatio && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Aspect Ratio:</span>
                      <span className="font-mono">{content.aspectRatio}</span>
                    </div>
                  )}
                  {content.duration && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-mono">{content.duration}s</span>
                    </div>
                  )}
                  {content.scale_factor && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Scale Factor:</span>
                      <span className="font-mono">{content.scale_factor}</span>
                    </div>
                  )}
                  {content.prompt && (
                    <div>
                      <div className="text-muted-foreground mb-1">Prompt:</div>
                      <div className="bg-muted/30 p-2 rounded text-xs break-words leading-relaxed">
                        {content.prompt}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Template */}
            {content.templateId && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">Template</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono">{content.templateId}</span>
                </div>
              </div>
            )}

            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <div>
                <div className="flex flex-wrap gap-1">
                  {document.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5 h-5">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        document={document}
        type={type}
      />
    </div>
  );
}