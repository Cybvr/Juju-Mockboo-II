// @/types/gallery.ts
export interface GalleryImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: number;
  aspectRatio: string;
}

export interface Gallery {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: string;
  prompt?: string;
  images: GalleryImage[];
  isPublic: boolean;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}
