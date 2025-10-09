import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { Document } from '@/types/firebase';

export class DocumentService {
  private collectionName = 'documents';

  // Helper function to compress a data URL
  private compressImageDataURL(dataURL: string, quality: number = 0.7): string {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(img, 0, 0);
        const compressedDataURL = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataURL);
      };
      img.onerror = reject;
      img.src = dataURL;
    });
  }


  // Simple clean function like CanvasX - just handle dates and basic types
  private cleanObjectForFirestore(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }
    if (obj instanceof Date) {
      return Timestamp.fromDate(obj);
    }
    if (typeof obj !== 'object') {
      return obj;
    }
    
    // Simple JSON parsing to remove non-serializable properties
    return JSON.parse(JSON.stringify(obj));
  }

  async createDocument(userId: string, document: Omit<Document, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = doc(collection(db, this.collectionName));
    const cleanedDocument = this.cleanObjectForFirestore(document);
    const newDoc = {
      id: docRef.id,
      userId,
      ...cleanedDocument,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    try {
      const finalDoc = this.cleanObjectForFirestore(newDoc);
      if (finalDoc.content?.canvasData) {
        finalDoc.content.canvasData = this.cleanObjectForFirestore(finalDoc.content.canvasData, 0, new Set());
        if (finalDoc.content.canvasData?.objects) {
          finalDoc.content.canvasData.objects = finalDoc.content.canvasData.objects
            .map((obj: any) => {
              if (!obj || typeof obj !== 'object') return null;
              const cleaned = { ...obj };
              Object.keys(cleaned).forEach(key => {
                const value = cleaned[key];
                if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                  delete cleaned[key];
                }
              });
              return cleaned;
            })
            .filter(obj => obj !== null);
        }
      }
      const estimatedSize = JSON.stringify(finalDoc).length;
      if (estimatedSize > 900000) {
        if (finalDoc.content?.imageUrls) {
          finalDoc.content.imageUrls = finalDoc.content.imageUrls.filter((url: any) =>
            typeof url === 'string' && (url.startsWith('http') || url.startsWith('gs://'))
          );
        }
      }
      await setDoc(docRef, finalDoc);
      return docRef.id;
    } catch (error) {
      if ((error as any).message && (error as any).message.includes('longer than')) {
        throw new Error('Document content is too large. Images have been uploaded to storage instead.');
      }
      throw error;
    }
  }

  async getDocumentById(id: string): Promise<Document | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Document : null;
  }

  async getUserDocuments(userId: string): Promise<Document[]> {
    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
  }

  async getUserRecentDocuments(userId: string, limitNum: number = 100): Promise<Document[]> {
    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(limitNum)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
  }

  async getAllDocumentsForAdmin(): Promise<Document[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
  }

  async getDocumentsByCategory(category: string): Promise<Document[]> {
    if (category === 'all') {
      const q = query(
        collection(db, this.collectionName),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
    }
    const q = query(
      collection(db, this.collectionName),
      where('category', '==', category),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
  }

  async getDocumentsByCategories(categories: string[]): Promise<Document[]> {
    if (categories.length === 0) {
      return this.getDocumentsByCategory('all');
    }
    const q = query(
      collection(db, this.collectionName),
      where('category', 'in', categories),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
  }

  async getRecentDocuments(limitNum: number = 5): Promise<Document[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy('updatedAt', 'desc'),
      limit(limitNum)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
  }

  async getPopularDocuments(limitNum: number = 10): Promise<Document[]> {
    const q = query(
      collection(db, this.collectionName),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitNum)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
  }

  async getTrendingDocuments(limitNum: number = 10): Promise<Document[]> {
    const q = query(
      collection(db, this.collectionName),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitNum)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
  }

  async getStarredDocuments(): Promise<Document[]> {
    const q = query(
      collection(db, this.collectionName),
      where('starred', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
  }

  async getSharedDocuments(): Promise<Document[]> {
    const q = query(
      collection(db, this.collectionName),
      where('shared', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    const cleanedUpdates = this.cleanObjectForFirestore(updates);
    await updateDoc(docRef, { ...cleanedUpdates, updatedAt: Timestamp.now() });
  }

  async deleteDocument(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async renameDocument(id: string, newTitle: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      title: newTitle,
      updatedAt: Timestamp.now()
    });
  }

  async toggleLike(id: string, userId: string): Promise<boolean> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Document not found');
    }
    const docData = docSnap.data() as Document;
    const currentLikes = docData.likedBy || [];
    const isLiked = currentLikes.includes(userId);
    let updatedLikes: string[];
    if (isLiked) {
      updatedLikes = currentLikes.filter(uid => uid !== userId);
    } else {
      updatedLikes = [...currentLikes, userId];
    }
    await updateDoc(docRef, {
      likedBy: updatedLikes,
      likesCount: updatedLikes.length,
      updatedAt: Timestamp.now()
    });
    return !isLiked;
  }

  async getUserLikedDocuments(userId: string): Promise<Document[]> {
    const q = query(
      collection(db, this.collectionName),
      where('likedBy', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
  }

  isDocumentLikedByUser(document: Document, userId: string): boolean {
    return document.likedBy?.includes(userId) || false;
  }

  async makeDocumentPublic(documentId: string, isPublic: boolean = true): Promise<void> {
    const docRef = doc(db, this.collectionName, documentId);
    await updateDoc(docRef, {
      isPublic: isPublic,
      shared: isPublic,
      updatedAt: Timestamp.now()
    });
  }

  async updateSharePermissions(documentId: string, accessLevel: 'private' | 'view' | 'edit'): Promise<void> {
    const docRef = doc(db, this.collectionName, documentId);
    const shareSettings = {
      accessLevel,
      sharedAt: accessLevel !== 'private' ? Timestamp.now() : null,
      canEdit: accessLevel === 'edit',
      canView: accessLevel === 'view' || accessLevel === 'edit'
    };
    await updateDoc(docRef, {
      shareSettings,
      isPublic: accessLevel !== 'private',
      shared: accessLevel !== 'private',
      updatedAt: Timestamp.now()
    });
  }

  async checkDocumentAccess(documentId: string, userId?: string): Promise<{ canView: boolean; canEdit: boolean }> {
    const doc = await this.getDocumentById(documentId);
    if (!doc) return { canView: false, canEdit: false };
    if (userId && doc.userId === userId) {
      return { canView: true, canEdit: true };
    }
    const shareSettings = doc.shareSettings;
    if (!shareSettings || shareSettings.accessLevel === 'private') {
      return { canView: false, canEdit: false };
    }
    return {
      canView: shareSettings.canView || false,
      canEdit: shareSettings.canEdit || false
    };
  }

  async saveCanvas(userId: string, title: string, canvasData: any, thumbnail?: string): Promise<string> {
    const documentData = {
      title: title,
      content: {
        canvasData: canvasData,
        thumbnail: thumbnail,
        canvasVersion: "1.0"
      },
      tags: ["canvas", "design"],
      type: "canvas" as const,
      isPublic: false,
      starred: false,
      shared: false,
      category: "Products" as const,
    }
    return await this.createDocument(userId, documentData)
  }

  async createCanvas(userId: string, title: string = "New Canvas"): Promise<string> {
    const documentData = {
      title: title,
      content: {
        canvasData: {
          objects: [],
          background: '#ffffff',
          width: 800,
          height: 600,
          version: '1.0'
        }
      },
      tags: ["canvas", "design"],
      type: "canvas" as const,
      isPublic: false,
      starred: false,
      shared: false,
      category: "Products" as const,
    }
    return await this.createDocument(userId, documentData)
  }

  async updateCanvasData(documentId: string, canvasData: any): Promise<void> {
    // Simple approach like CanvasX - direct JSON storage
    const cleanData = JSON.parse(JSON.stringify(canvasData));
    await this.updateDocument(documentId, {
      content: {
        canvasData: cleanData,
        canvasVersion: "1.0"
      },
      updatedAt: new Date()
    })
  }

  async saveChatImage(
    userId: string,
    imageUrl: string,
    prompt: string,
    chatId: string,
    metadata?: {
      model?: string;
      aspectRatio?: string;
      outputs?: string;
      mode?: string;
    }
  ): Promise<string> {
    const documentData = {
      title: `Generated Image - ${new Date().toLocaleDateString()}`,
      content: {
        imageUrls: [imageUrl],
        generationMode: metadata?.mode || "text",
        prompt: prompt,
        model: metadata?.model || "imagen-3.0-generate-002",
        aspectRatio: metadata?.aspectRatio || "1:1",
        outputs: metadata?.outputs || "1",
        generatedAt: new Date().toISOString(),
        generatedInChat: true,
        chatId: chatId,
      },
      tags: ["generated-image", "text-to-image", "chat-generated"],
      type: "image" as const,
      isPublic: false,
      starred: false,
      shared: false,
      category: "UGC" as const,
    }
    return await this.createDocument(userId, documentData)
  }

  async saveGeneratedImages(
    userId: string,
    imageUrls: string[],
    prompt: string,
    chatId: string,
    metadata?: {
      model?: string;
      aspectRatio?: string;
      outputs?: string;
      mode?: string;
    }
  ): Promise<string[]> {
    const documentIds: string[] = []
    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i]
      const title = imageUrls.length > 1
        ? `Generated Image ${i + 1} - ${new Date().toLocaleDateString()}`
        : `Generated Image - ${new Date().toLocaleDateString()}`
      const documentData = {
        title,
        content: {
          imageUrls: [imageUrl],
          generationMode: metadata?.mode || "text",
          prompt: prompt,
          model: metadata?.model || "imagen-3.0-generate-002",
          aspectRatio: metadata?.aspectRatio || "1:1",
          outputs: metadata?.outputs || "1",
          generatedAt: new Date().toISOString(),
          generatedInChat: true,
          chatId: chatId,
          batchIndex: i + 1,
          batchTotal: imageUrls.length,
        },
        tags: ["generated-image", "text-to-image", "chat-generated"],
        type: "image" as const,
        isPublic: false,
        starred: false,
        shared: false,
        category: "UGC" as const,
      }
      try {
        const documentId = await this.createDocument(userId, documentData)
        documentIds.push(documentId)
      } catch (error) {
      }
    }
    return documentIds
  }

  async downloadImage(imageUrl: string, filename: string): Promise<void> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
    }
  }
}

export const documentService = new DocumentService();