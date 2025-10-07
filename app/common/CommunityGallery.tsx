'use client';
import { Document, DocumentCategory } from '@/types/firebase';
import { useRouter } from 'next/navigation';
import { documentService } from '@/services/documentService';
import { userService } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Heart, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  'Product',
  'UGC', 
  'Storyboard',
  'Posters',
  'Mockups',
  'Products',
  'Commercials'
];

interface CommunityGalleryProps {
  documents: Document[];
}

export function CommunityGallery({ documents }: CommunityGalleryProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<{[key: string]: any}>({});
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(null);
  const currentUserId = user?.uid;

  useEffect(() => {
    const loadUsers = async () => {
      const userIds = [...new Set(documents.map(doc => doc.userId))];
      const usersData: {[key: string]: any} = {};

      for (const userId of userIds) {
        try {
          const userData = await userService.getUserById(userId);
          if (userData) {
            usersData[userId] = userData;
          } else {
            // Fallback for users that can't be loaded
            usersData[userId] = {
              id: userId,
              name: 'Creator',
              email: '',
              photoURL: ''
            };
          }
        } catch (error) {
          // Silently create fallback user for permission errors
          usersData[userId] = {
            id: userId,
            name: 'Creator',
            email: '',
            photoURL: ''
          };
        }
      }

      setUsers(usersData);
    };

    if (documents.length > 0) {
      loadUsers();
    }
  }, [documents]);

  const handleDocumentClick = (document: Document) => {
    const hasMedia = document.content?.imageUrls?.length > 0 || document.content?.videoUrls?.length > 0;
    if (hasMedia) {
      router.push(`/m/${document.id}`);
    }
  };

  const handleLike = async (e: React.MouseEvent, document: Document) => {
    e.stopPropagation();
    if (!currentUserId) return;

    try {
      await documentService.toggleLike(document.id, currentUserId);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = (e: React.MouseEvent, document: Document) => {
    e.stopPropagation();
    const url = `${window.location.origin}/m/${document.id}`;
    navigator.clipboard.writeText(url);
  };

  const selectCategory = (category: DocumentCategory) => {
    // If the same category is clicked, deselect it (show all)
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
  };

  const filteredDocuments = documents.filter(document => {
    if (!selectedCategory) return true;
    return document.category === selectedCategory;
  });

  const DocumentCard = ({ document }: { document: Document }) => {
    const isVideo = document.type === 'video' || document.content?.videoUrls?.length > 0;
    
    // Use thumbnail if available, otherwise use optimized version of original
    const getOptimizedImageUrl = (url: string) => {
      if (!url) return '/placeholder.svg';
      
      // If it's a Firebase Storage URL, add size parameters for optimization
      if (url.includes('firebasestorage.googleapis.com')) {
        return `${url}&w=400&h=400&fit=crop&q=80`;
      }
      
      // If it's a Cloudinary URL, add transformation parameters
      if (url.includes('cloudinary.com')) {
        return url.replace('/upload/', '/upload/w_400,h_400,c_fill,q_auto,f_auto/');
      }
      
      return url;
    };
    
    const mediaUrl = isVideo
      ? document.content?.videoUrls?.[0]
      : getOptimizedImageUrl(document.content?.imageUrls?.[0]) || '/placeholder.svg';
    const creator = users[document.userId];
    const isLiked = currentUserId ? documentService.isDocumentLikedByUser(document, currentUserId) : false;

    return (
      <div
        className=" cursor-pointer group relative break-inside-avoid mb-4"
        onClick={() => handleDocumentClick(document)}
      >
        <div className="relative overflow-hidden rounded-lg">
          {isVideo ? (
            <video
              src={mediaUrl}
              className="w-full h-auto object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={mediaUrl}
              alt={document.title}
              className="w-full h-auto object-cover transition-opacity duration-300"
              loading="lazy"
              decoding="async"
              style={{ 
                maxWidth: '100%', 
                height: 'auto',
                aspectRatio: '1/1',
                objectFit: 'cover'
              }}
              onLoad={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.opacity = '1';
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
              style={{
                ...{ 
                  maxWidth: '100%', 
                  height: 'auto',
                  aspectRatio: '1/1',
                  objectFit: 'cover'
                },
                opacity: '0'
              }}
            />
          )}

          {/* Share button - top right on hover */}
          <Button
            onClick={(e) => handleShare(e, document)}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            size="sm"
            variant="ghost"
          >
            <Share className="w-4 h-4" />
          </Button>

          {/* Bottom overlay with like button and creator info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex justify-between items-end">
              {/* Creator info */}
              <div className="flex items-center gap-2 text-white text-sm">
                <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-xs">
                  {creator?.name ? creator.name.charAt(0).toUpperCase() : '?'}
                </div>
                <span>{creator?.name || 'Unknown'}</span>
              </div>

              {/* Like button */}
              <Button
                onClick={(e) => handleLike(e, document)}
                className={`flex items-center gap-1 text-sm bg-transparent hover:bg-transparent p-1 h-auto ${isLiked ? 'text-red-400' : 'text-white'}`}
                variant="ghost"
                size="sm"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{document.likesCount || 0}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Category List */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          {selectedCategory && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filter
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <div className="flex gap-2 pb-2 min-w-max">
            <Button
              variant={!selectedCategory ? "default" : "outline"}
              size="sm"
              onClick={clearFilters}
              className="text-xs whitespace-nowrap flex-shrink-0"
            >
              All
            </Button>
            {DOCUMENT_CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => selectCategory(category)}
                className="text-xs whitespace-nowrap flex-shrink-0"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="columns-2 lg:columns-4 gap-4 p-2">
        {filteredDocuments.map((document) => (
          <DocumentCard key={document.id} document={document} />
        ))}
      </div>

      {/* No results message */}
      {filteredDocuments.length === 0 && selectedCategory && (
        <div className="text-center py-8 text-muted-foreground">
          No documents found for the selected category.
        </div>
      )}
    </div>
  );
}