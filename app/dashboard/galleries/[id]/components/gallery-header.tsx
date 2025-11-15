
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Upload, Share2, Grid, List, Check, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import type { Gallery } from '@/types/gallery';

interface GalleryHeaderProps {
  gallery: Gallery;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  uploading: boolean;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onShareClick: () => void;
  onTitleUpdate: (newTitle: string) => void;
}

export function GalleryHeader({
  gallery,
  viewMode,
  setViewMode,
  uploading,
  onFileInputChange,
  onShareClick,
  onTitleUpdate
}: GalleryHeaderProps) {
  const router = useRouter();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(gallery.title);

  const handleTitleSave = () => {
    if (editedTitle.trim() && editedTitle !== gallery.title) {
      onTitleUpdate(editedTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditedTitle(gallery.title);
    setIsEditingTitle(false);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard/galleries')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-xl font-semibold h-auto border-none p-0 focus-visible:ring-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSave();
                    if (e.key === 'Escape') handleTitleCancel();
                  }}
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleTitleSave}
                  className="h-6 w-6"
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-xl font-semibold">{gallery.title}</h1>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsEditingTitle(true)}
                  className="h-6 w-6"
                >
                  <Pencil className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={onFileInputChange}
          className="hidden"
          id="file-upload"
        />
        <Button
          variant="outline"
          onClick={() => document.getElementById('file-upload')?.click()}
          className="flex items-center gap-2"
          disabled={uploading}
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">
            {uploading ? 'Uploading...' : 'Upload'}
          </span>
        </Button>
        <Button
          variant="outline"
          onClick={onShareClick}
          className="flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
        </Button>
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setViewMode('grid')}
          className="hidden md:flex"
        >
          <Grid className="w-4 h-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setViewMode('list')}
          className="hidden md:flex"
        >
          <List className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
