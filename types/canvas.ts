// Canvas-specific types for fabric.js integration
import { Timestamp } from 'firebase/firestore';

export interface CanvasDocument {
  id: string;
  userId: string;
  title: string;
  
  // Canvas-specific data
  canvasData: {
    // Fabric.js serialized canvas JSON
    fabricJson: any;
    // Canvas dimensions and viewport
    width: number;
    height: number;
    zoom: number;
    viewportTransform?: number[];
    
    // Canvas settings
    backgroundColor?: string;
    gridEnabled?: boolean;
    snapToGrid?: boolean;
    gridSize?: number;
    
    // Layer information
    layers?: CanvasLayer[];
    activeLayerId?: string;
    
    // Source image for canvas creation
    sourceImageUrl?: string;
  };
  
  // Metadata
  thumbnail?: string; // Base64 or URL to canvas preview
  tags: string[];
  category?: string;
  description?: string;
  
  // Permissions and sharing
  isPublic?: boolean;
  starred?: boolean;
  shared?: boolean;
  collaborators?: string[]; // Array of user IDs with access
  
  // Engagement
  likedBy?: string[];
  likesCount?: number;
  viewCount?: number;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastOpenedAt?: Timestamp;
  
  // Version history
  version: number;
  versionHistory?: CanvasVersion[];
}

export interface CanvasLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode?: string;
  objects: string[]; // Array of fabric object IDs in this layer
}

export interface CanvasVersion {
  id: string;
  version: number;
  fabricJson: any;
  thumbnail: string;
  description?: string;
  createdAt: Timestamp;
  createdBy: string;
}

// Tool types for canvas editing
export type CanvasTool = 
  | 'cursor' 
  | 'hand' 
  | 'pen' 
  | 'brush'
  | 'rectangle' 
  | 'circle' 
  | 'line' 
  | 'triangle' 
  | 'star' 
  | 'hexagon' 
  | 'text' 
  | 'image'
  | 'eraser';

export interface CanvasSettings {
  tool: CanvasTool;
  strokeWidth: number;
  strokeColor: string;
  fillColor: string;
  opacity: number;
  fontSize?: number;
  fontFamily?: string;
}

// Canvas creation and update types
export type CreateCanvasDocument = Omit<CanvasDocument, 'id' | 'createdAt' | 'updatedAt' | 'version'>;
export type UpdateCanvasDocument = Partial<Pick<CanvasDocument, 
  | 'title' 
  | 'canvasData' 
  | 'thumbnail' 
  | 'tags' 
  | 'category' 
  | 'description' 
  | 'isPublic' 
  | 'starred' 
  | 'shared'
>>;