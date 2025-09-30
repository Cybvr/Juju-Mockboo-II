// Complete @/types/firebase.ts file with all interfaces
export type DocumentCategory = 'Product' | 'UGC' | 'Storyboard' | 'Posters' | 'Mockups' | 'Products' | 'Commercials' | 'Film' | 'Animation' ;

export type DocumentType = 'image' | 'video' | 'audio' | 'text' | 'pdf' | 'canvas' | 'other';

export interface ShareSettings {
  accessLevel: 'private' | 'view' | 'edit'
  sharedAt: any
  canEdit: boolean
  canView: boolean
}

export interface Document {
  id: string;
  userId: string;
  title: string;
  content?: {
    imageUrls?: string[];
    prompt?: string;
    model?: string;
    aspectRatio?: string;
    outputs?: string;
    generatedAt?: string;
    generatedInChat?: boolean;
    chatId?: string;
    batchIndex?: number;
    batchTotal?: number;
    canvasData?: any;
    thumbnail?: string;
    canvasVersion?: string;
    scenes?: any[];
    duration?: number;
    videoUrl?: string;
    status?: string;
    taskId?: string;
    elements?: any[];
    version?: string;
  };
  tags?: string[];
  type: 'image' | 'video' | 'audio' | 'text' | 'canvas' | 'scenes';
  isPublic: boolean;
  starred: boolean;
  shared: boolean;
  category: 'UGC' | 'AI' | 'Products' | 'Branding' | 'Ecommerce' | 'Architecture' | 'Food' | 'Fashion';
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  likedBy?: string[];
  likesCount?: number;
  shareSettings?: {
    accessLevel: 'private' | 'view' | 'edit';
    sharedAt?: Date | Timestamp | null;
    canView: boolean;
    canEdit: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  tags: string[];
  premium: boolean;
  rating: number;
  uses: string;
  createdAt: Date;
  updatedAt: Date;
}

// Additional interface for DocumentCard component compatibility
export interface DocumentCardData {
  id: string;
  name: string;
  modified: string;
  thumbnail?: string;
  type?: string;
  size?: string;
}