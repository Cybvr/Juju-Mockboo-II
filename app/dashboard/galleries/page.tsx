
"use client"
import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Grid, Eye, Trash2, Edit, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { galleryService } from '@/services/galleryService';
import type { Gallery } from '@/types/gallery';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const galleryTypes = [
  'Fashion Collection',
  'Film Storyboards',
  'Interior Views',
  'Product Shots',
  'Architectural Renders',
  'Food Photography',
  'Brand Identity',
  'Custom'
];

export default function GalleriesPage() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  

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

  

  const handleDeleteGallery = async (galleryId: string) => {
    if (!confirm('Are you sure you want to delete this gallery?')) return;
    
    try {
      await galleryService.deleteGallery(galleryId);
      setGalleries(galleries.filter(g => g.id !== galleryId));
      toast.success('Gallery deleted successfully');
    } catch (error) {
      console.error('Failed to delete gallery:', error);
      toast.error('Failed to delete gallery');
    }
  };

  const filteredGalleries = galleries.filter(gallery =>
    gallery.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gallery.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold">My Galleries</h1>
          
        </div>
        
        <Button onClick={() => router.push('/dashboard/galleries/create')} className="gap-2">
          <Plus className="w-4 h-4" />
          New Gallery
        </Button>
      </div>

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

      {filteredGalleries.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold mb-2">No galleries yet</h2>
          <p className="text-muted-foreground mb-4">
            Create your first gallery to start organizing your generated images
          </p>
          <Button onClick={() => router.push('/dashboard/galleries/create')} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Gallery
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGalleries.map((gallery) => (
            <Card key={gallery.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg truncate">{gallery.title}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {gallery.type}
                    </Badge>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGallery(gallery.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent 
                className="pt-0"
                onClick={() => router.push(`/dashboard/galleries/${gallery.id}`)}
              >
                <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {gallery.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1 w-full h-full">
                      {gallery.images.slice(0, 4).map((image, index) => (
                        <div key={index} className="aspect-square">
                          <img
                            src={image.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Grid className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {gallery.description || 'No description'}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{gallery.images.length} images</span>
                  <span>{new Date(gallery.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
