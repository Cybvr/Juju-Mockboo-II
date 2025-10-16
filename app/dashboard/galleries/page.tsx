"use client"
import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Grid, Search, MoreVertical, Trash2, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { galleryService } from '@/services/galleryService';
import type { Gallery } from '@/types/gallery';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const GalleryCard: React.FC<{
  gallery: Gallery;
  onClick: () => void;
  onDelete: () => void;
}> = ({ gallery, onClick, onDelete }) => {
  const firstImage = gallery.images?.[0];
  const lastUpdated = new Date(gallery.updatedAt).toLocaleDateString();

  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
    >
      <div className="relative aspect-video bg-muted">
        {firstImage ? (
          <img src={firstImage} alt={gallery.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Grid className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
      <CardContent className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors truncate pr-2">
              {gallery.title}
            </h3>
            <div className="relative flex-shrink-0 flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                title="Delete Gallery"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick(); }}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Gallery
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {gallery.description || 'No description'}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            {gallery.images.length} images
          </p>
          <p className="text-xs text-muted-foreground">
            Updated: {lastUpdated}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default function GalleriesPage() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteGalleryId, setDeleteGalleryId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadGalleries();
    }
  }, [user]);

  const loadGalleries = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userGalleries = await galleryService.getUserGalleries(user.uid);
      setGalleries(userGalleries);
    } catch (error) {
      console.error('Failed to load galleries:', error);
      toast.error('Failed to load galleries');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGallery = (galleryId: string) => {
    setDeleteGalleryId(galleryId);
  };

  const confirmDeleteGallery = async () => {
    if (!deleteGalleryId) return;

    try {
      await galleryService.deleteGallery(deleteGalleryId);
      setGalleries(prevGalleries => prevGalleries.filter(g => g.id !== deleteGalleryId));
      toast.success('Gallery deleted successfully');
    } catch (error) {
      console.error('Failed to delete gallery:', error);
      toast.error('Failed to delete gallery');
    } finally {
      setDeleteGalleryId(null);
    }
  };

  const filteredGalleries = galleries.filter(gallery =>
    gallery.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gallery.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <main className="min-h-screen w-full bg-background transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-foreground">Loading your galleries...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full  transition-colors duration-300">
      <div className="w-full max-w-6xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-md font-bold text-foreground">Galleries</h1>
          <Button onClick={() => router.push('/dashboard/galleries/create')} className="gap-2">
            <Plus className="w-5 h-5" />
            New
          </Button>
        </div>

        {galleries.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search galleries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {filteredGalleries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGalleries.map((gallery) => (
              <GalleryCard
                key={gallery.id}
                gallery={gallery}
                onClick={() => router.push(`/dashboard/galleries/${gallery.id}`)}
                onDelete={() => handleDeleteGallery(gallery.id)}
              />
            ))}
          </div>
        ) : galleries.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
            <Grid className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold text-foreground">
              No galleries yet
            </h2>
            <p className="text-muted-foreground mt-2">
              Click "New" to create your first gallery.
            </p>
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
            <Grid className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold text-foreground">
              No galleries found
            </h2>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search terms.
            </p>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteGalleryId} onOpenChange={(open) => {
        if (!open) setDeleteGalleryId(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Gallery</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this gallery? This action cannot be undone and will permanently remove all images and content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteGalleryId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteGallery}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Gallery
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}