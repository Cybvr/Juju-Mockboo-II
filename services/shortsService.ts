
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

export interface ShortVideo {
  id: string;
  userId: string;
  title: string;
  prompt: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  duration: string;
  model: string;
  size?: string;
  aspectRatio?: string;
  progress?: number;
  shareSettings?: {
    accessLevel: 'private' | 'view' | 'edit';
  };
  error?: {
    message: string;
  };
}

interface FirebaseShortVideo extends Omit<ShortVideo, 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const SHORTS_COLLECTION = 'shorts';

export class ShortsService {
  /**
   * Create a new short video record
   */
  async createShort(
    userId: string, 
    shortData: Omit<ShortVideo, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const now = Timestamp.now();
      const videoData: Omit<FirebaseShortVideo, 'id'> = {
        ...shortData,
        userId,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, SHORTS_COLLECTION), videoData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating short:', error);
      throw new Error('Failed to create short video');
    }
  }

  /**
   * Get all shorts for a user
   */
  async getUserShorts(userId: string): Promise<ShortVideo[]> {
    try {
      const shortsRef = collection(db, SHORTS_COLLECTION);
      const q = query(
        shortsRef, 
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const shorts: ShortVideo[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseShortVideo;
        shorts.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        });
      });

      return shorts;
    } catch (error) {
      console.error('Error fetching user shorts:', error);
      throw new Error('Failed to fetch shorts');
    }
  }

  /**
   * Get a single short by ID
   */
  async getShortById(id: string): Promise<ShortVideo | null> {
    try {
      const shortRef = doc(db, SHORTS_COLLECTION, id);
      const docSnap = await getDoc(shortRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as FirebaseShortVideo;
        return {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching short:', error);
      throw new Error('Failed to fetch short video');
    }
  }

  /**
   * Update an existing short
   */
  async updateShort(id: string, updates: Partial<ShortVideo>): Promise<void> {
    try {
      const shortRef = doc(db, SHORTS_COLLECTION, id);

      const cleanUpdates: any = { ...updates };
      delete cleanUpdates.id;
      delete cleanUpdates.createdAt;
      delete cleanUpdates.userId;

      const updateData = {
        ...cleanUpdates,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(shortRef, updateData);
    } catch (error) {
      console.error('Error updating short:', error);
      throw new Error('Failed to update short video');
    }
  }

  /**
   * Delete a short
   */
  async deleteShort(id: string): Promise<void> {
    try {
      const shortRef = doc(db, SHORTS_COLLECTION, id);
      await deleteDoc(shortRef);
    } catch (error) {
      console.error('Error deleting short:', error);
      throw new Error('Failed to delete short video');
    }
  }

  /**
   * Update short status and progress
   */
  async updateShortStatus(
    id: string, 
    status: ShortVideo['status'], 
    progress?: number,
    videoUrl?: string,
    error?: { message: string }
  ): Promise<void> {
    try {
      const updates: any = {
        status,
        updatedAt: Timestamp.now(),
      };

      if (progress !== undefined) {
        updates.progress = progress;
      }

      if (videoUrl) {
        updates.videoUrl = videoUrl;
      }

      if (error) {
        updates.error = error;
      }

      await this.updateShort(id, updates);
    } catch (error) {
      console.error('Error updating short status:', error);
      throw new Error('Failed to update short status');
    }
  }

  /**
   * Get shorts by status
   */
  async getShortsByStatus(userId: string, status: ShortVideo['status']): Promise<ShortVideo[]> {
    try {
      const shortsRef = collection(db, SHORTS_COLLECTION);
      const q = query(
        shortsRef, 
        where('userId', '==', userId),
        where('status', '==', status),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const shorts: ShortVideo[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseShortVideo;
        shorts.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        });
      });

      return shorts;
    } catch (error) {
      console.error('Error fetching shorts by status:', error);
      throw new Error('Failed to fetch shorts by status');
    }
  }

  /**
   * Get recent shorts across all users (for admin/public view)
   */
  async getRecentShorts(limit: number = 20): Promise<ShortVideo[]> {
    try {
      const shortsRef = collection(db, SHORTS_COLLECTION);
      const q = query(
        shortsRef, 
        where('status', '==', 'completed'),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const shorts: ShortVideo[] = [];

      querySnapshot.forEach((doc, index) => {
        if (index < limit) {
          const data = doc.data() as FirebaseShortVideo;
          shorts.push({
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
          });
        }
      });

      return shorts;
    } catch (error) {
      console.error('Error fetching recent shorts:', error);
      throw new Error('Failed to fetch recent shorts');
    }
  }

  /**
   * Update share permissions for a short
   */
  async updateSharePermissions(id: string, accessLevel: 'private' | 'view' | 'edit'): Promise<void> {
    try {
      const shortRef = doc(db, SHORTS_COLLECTION, id);
      const updates = {
        shareSettings: { accessLevel },
        updatedAt: Timestamp.now(),
      };

      await updateDoc(shortRef, updates);
    } catch (error) {
      console.error('Error updating share permissions:', error);
      throw new Error('Failed to update share permissions');
    }
  }

  
}

export const shortsService = new ShortsService();
