
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  Timestamp 
} from 'firebase/firestore';
import type { Gallery } from '@/types/gallery';

const GALLERIES_COLLECTION = 'galleries';

export interface FirebaseGallery extends Omit<Gallery, 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class GalleryService {
  /**
   * Get all galleries for a user
   */
  async getUserGalleries(userId: string): Promise<Gallery[]> {
    try {
      const galleriesRef = collection(db, GALLERIES_COLLECTION);
      const q = query(
        galleriesRef, 
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const galleries: Gallery[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseGallery;
        galleries.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toMillis(),
          updatedAt: data.updatedAt.toMillis(),
        });
      });
      
      return galleries;
    } catch (error) {
      console.error('Error fetching galleries:', error);
      throw new Error('Failed to fetch galleries from Firebase');
    }
  }

  /**
   * Get a single gallery by ID
   */
  async getGalleryById(id: string): Promise<Gallery | null> {
    try {
      const galleryRef = doc(db, GALLERIES_COLLECTION, id);
      const docSnap = await getDoc(galleryRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as FirebaseGallery;
        return {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt.toMillis(),
          updatedAt: data.updatedAt.toMillis(),
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching gallery:', error);
      throw new Error('Failed to fetch gallery from Firebase');
    }
  }

  /**
   * Create a new gallery
   */
  async createGallery(userId: string, gallery: Omit<Gallery, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const galleryData: Omit<FirebaseGallery, 'id'> = {
        ...gallery,
        userId,
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(collection(db, GALLERIES_COLLECTION), galleryData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating gallery:', error);
      throw new Error('Failed to create gallery in Firebase');
    }
  }

  /**
   * Update an existing gallery
   */
  async updateGallery(id: string, updates: Partial<Gallery>): Promise<void> {
    try {
      const galleryRef = doc(db, GALLERIES_COLLECTION, id);
      
      // Clean update data to prevent nested entity errors
      const cleanUpdates = JSON.parse(JSON.stringify(updates));
      delete cleanUpdates.id;
      delete cleanUpdates.createdAt;
      delete cleanUpdates.userId;
      
      const updateData = {
        ...cleanUpdates,
        updatedAt: Timestamp.now(),
      };
      
      await updateDoc(galleryRef, updateData);
    } catch (error) {
      console.error('Error updating gallery:', error);
      throw new Error('Failed to update gallery in Firebase');
    }
  }

  /**
   * Delete a gallery
   */
  async deleteGallery(id: string): Promise<void> {
    try {
      const galleryRef = doc(db, GALLERIES_COLLECTION, id);
      await deleteDoc(galleryRef);
    } catch (error) {
      console.error('Error deleting gallery:', error);
      throw new Error('Failed to delete gallery from Firebase');
    }
  }

  /**
   * Get public galleries
   */
  async getPublicGalleries(limit: number = 20): Promise<Gallery[]> {
    try {
      const galleriesRef = collection(db, GALLERIES_COLLECTION);
      const q = query(
        galleriesRef, 
        where('isPublic', '==', true),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const galleries: Gallery[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseGallery;
        galleries.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toMillis(),
          updatedAt: data.updatedAt.toMillis(),
        });
      });
      
      return galleries.slice(0, limit);
    } catch (error) {
      console.error('Error fetching public galleries:', error);
      throw new Error('Failed to fetch public galleries from Firebase');
    }
  }

  /**
   * Search galleries by title or type
   */
  async searchGalleries(searchTerm: string, userId?: string): Promise<Gallery[]> {
    try {
      const galleriesRef = collection(db, GALLERIES_COLLECTION);
      let q = query(galleriesRef, orderBy('updatedAt', 'desc'));
      
      if (userId) {
        q = query(galleriesRef, where('userId', '==', userId), orderBy('updatedAt', 'desc'));
      }
      
      const querySnapshot = await getDocs(q);
      const galleries: Gallery[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseGallery;
        const gallery = {
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toMillis(),
          updatedAt: data.updatedAt.toMillis(),
        };
        
        // Client-side filtering for search term
        if (
          gallery.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gallery.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gallery.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        ) {
          galleries.push(gallery);
        }
      });
      
      return galleries;
    } catch (error) {
      console.error('Error searching galleries:', error);
      throw new Error('Failed to search galleries in Firebase');
    }
  }
}

export const galleryService = new GalleryService();
