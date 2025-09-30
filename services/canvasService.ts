import { documentService } from './documentService';
import { CanvasDocument, CreateCanvasDocument, UpdateCanvasDocument } from '@/types/canvas';
import { Document } from '@/types/firebase';
import { Timestamp } from 'firebase/firestore';

export class CanvasService {
  // Create a new canvas document
  async createCanvas(userId: string, canvasData: Partial<CreateCanvasDocument>): Promise<string> {
    const defaultCanvasData = {
      userId,
      title: canvasData.title || 'Untitled Canvas',
      canvasData: {
        fabricJson: null,
        width: canvasData.canvasData?.width || window?.innerWidth || 1200,
        height: canvasData.canvasData?.height || window?.innerHeight || 800,
        zoom: canvasData.canvasData?.zoom || 1,
        backgroundColor: '#ffffff',
        gridEnabled: false,
        snapToGrid: false,
        gridSize: 20,
        layers: [],
        ...canvasData.canvasData
      },
      tags: canvasData.tags || [],
      category: canvasData.category || 'canvas',
      description: canvasData.description || '',
      isPublic: canvasData.isPublic || false,
      starred: canvasData.starred || false,
      shared: canvasData.shared || false,
      version: 1,
      viewCount: 0,
      likesCount: 0,
      likedBy: [],
      thumbnail: canvasData.thumbnail || ''
    };

    // Convert to Document format for documentService
    const documentData = {
      title: defaultCanvasData.title,
      content: {
        canvasData: defaultCanvasData.canvasData,
        version: defaultCanvasData.version,
        viewCount: defaultCanvasData.viewCount,
        sourceImageUrl: canvasData.canvasData?.sourceImageUrl
      },
      tags: defaultCanvasData.tags,
      type: 'canvas' as const,
      category: defaultCanvasData.category,
      isPublic: defaultCanvasData.isPublic,
      starred: defaultCanvasData.starred,
      shared: defaultCanvasData.shared,
      likesCount: defaultCanvasData.likesCount,
      likedBy: defaultCanvasData.likedBy
    };

    return await documentService.createDocument(userId, documentData);
  }

  // Get canvas document by ID
  async getCanvasById(id: string): Promise<CanvasDocument | null> {
    const document = await documentService.getDocumentById(id);
    if (!document || document.type !== 'canvas') {
      return null;
    }

    return this.documentToCanvas(document);
  }

  // Update canvas document
  async updateCanvas(id: string, updates: UpdateCanvasDocument): Promise<void> {
    const currentDocument = await documentService.getDocumentById(id);
    if (!currentDocument || currentDocument.type !== 'canvas') {
      throw new Error('Canvas not found');
    }

    // Merge canvas updates into document format
    const documentUpdates: Partial<Document> = {
      title: updates.title,
      content: {
        ...currentDocument.content,
        canvasData: updates.canvasData ? { ...currentDocument.content.canvasData, ...updates.canvasData } : currentDocument.content.canvasData,
        version: currentDocument.content.version ? currentDocument.content.version + 1 : 1
      },
      tags: updates.tags,
      category: updates.category,
      isPublic: updates.isPublic,
      starred: updates.starred,
      shared: updates.shared
    };

    // Remove undefined values
    Object.keys(documentUpdates).forEach(key => {
      if (documentUpdates[key as keyof Document] === undefined) {
        delete documentUpdates[key as keyof Document];
      }
    });

    await documentService.updateDocument(id, documentUpdates);
  }

  // Save canvas state (fabric.js JSON and thumbnail)
  async saveCanvasState(id: string, fabricJson: any, thumbnail?: string): Promise<void> {
    const currentDocument = await documentService.getDocumentById(id);
    if (!currentDocument || currentDocument.type !== 'canvas') {
      throw new Error('Canvas not found');
    }

    const updates = {
      content: {
        ...currentDocument.content,
        canvasData: {
          ...currentDocument.content.canvasData,
          fabricJson: fabricJson
        },
        version: currentDocument.content.version ? currentDocument.content.version + 1 : 1
      }
    };

    if (thumbnail) {
      updates.content.canvasData = {
        ...updates.content.canvasData,
        thumbnail: thumbnail
      };
    }

    await documentService.updateDocument(id, updates);
  }

  // Get user's canvas documents
  async getUserCanvases(userId: string): Promise<CanvasDocument[]> {
    const documents = await documentService.getUserDocuments(userId);
    return documents
      .filter(doc => doc.type === 'canvas')
      .map(doc => this.documentToCanvas(doc));
  }

  // Delete canvas
  async deleteCanvas(id: string): Promise<void> {
    await documentService.deleteDocument(id);
  }

  // Duplicate canvas
  async duplicateCanvas(id: string, userId: string, newTitle?: string): Promise<string> {
    const originalCanvas = await this.getCanvasById(id);
    if (!originalCanvas) {
      throw new Error('Canvas not found');
    }

    const duplicateData: Partial<CreateCanvasDocument> = {
      userId,
      title: newTitle || `${originalCanvas.title} (Copy)`,
      canvasData: {
        ...originalCanvas.canvasData,
        fabricJson: originalCanvas.canvasData.fabricJson
      },
      tags: originalCanvas.tags,
      category: originalCanvas.category,
      description: originalCanvas.description,
      isPublic: false, // Duplicates are private by default
      starred: false,
      shared: false,
      thumbnail: originalCanvas.thumbnail
    };

    return await this.createCanvas(userId, duplicateData);
  }

  // Convert Document to CanvasDocument
  private documentToCanvas(document: Document): CanvasDocument {
    const content = document.content || {};
    const canvasData = content.canvasData || {};

    return {
      id: document.id,
      userId: document.userId,
      title: document.title,
      canvasData: {
        fabricJson: canvasData.fabricJson || null,
        width: canvasData.width || window?.innerWidth || 1200,
        height: canvasData.height || window?.innerHeight || 800,
        zoom: canvasData.zoom || 1,
        viewportTransform: canvasData.viewportTransform,
        backgroundColor: canvasData.backgroundColor || '#ffffff',
        gridEnabled: canvasData.gridEnabled || false,
        snapToGrid: canvasData.snapToGrid || false,
        gridSize: canvasData.gridSize || 20,
        layers: canvasData.layers || [],
        activeLayerId: canvasData.activeLayerId,
        sourceImageUrl: canvasData.sourceImageUrl
      },
      thumbnail: canvasData.thumbnail || '',
      tags: document.tags || [],
      category: document.category,
      description: '',
      isPublic: document.isPublic || false,
      starred: document.starred || false,
      shared: document.shared || false,
      collaborators: [],
      likedBy: document.likedBy || [],
      likesCount: document.likesCount || 0,
      viewCount: content.viewCount || 0,
      createdAt: document.createdAt instanceof Date ? Timestamp.fromDate(document.createdAt) : 
                 (document.createdAt as any)?.toDate ? document.createdAt as any : Timestamp.now(),
      updatedAt: document.updatedAt instanceof Date ? Timestamp.fromDate(document.updatedAt) : 
                 (document.updatedAt as any)?.toDate ? document.updatedAt as any : Timestamp.now(),
      lastOpenedAt: undefined,
      version: content.version || 1,
      versionHistory: []
    };
  }

  // Create canvas from image URL (for opening images in canvas)
  async createCanvasFromImage(userId: string, imageUrl: string, title?: string): Promise<string> {
    const canvasData: Partial<CreateCanvasDocument> = {
      userId,
      title: title || 'Canvas from Image',
      canvasData: {
        width: 800,
        height: 600,
        zoom: 1,
        fabricJson: null,
        sourceImageUrl: imageUrl,
        backgroundColor: '#ffffff'
      },
      tags: ['imported-image'],
      category: 'canvas',
      isPublic: false,
      starred: false,
      shared: false,
      thumbnail: imageUrl
    };

    return await this.createCanvas(userId, canvasData);
  }
}

export const canvasService = new CanvasService();