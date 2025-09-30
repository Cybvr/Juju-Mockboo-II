import { Template } from '@/types/firebase';
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export class TemplateService {
  private collectionName = 'templates';

  async createTemplate(template: Template): Promise<void> {
    await setDoc(doc(db, this.collectionName, template.id), template);
  }

  async getTemplates(): Promise<Template[]> {
    try {
      // Prevent build failures during static generation
      if (typeof window === 'undefined') {
        return [];
      }
      
      const snapshot = await getDocs(collection(db, this.collectionName));

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Template));
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Return empty array as fallback to prevent build failures
      return [];
    }
  }

  async getTemplateById(id: string): Promise<Template | null> {
    try {
      // Prevent build failures during static generation
      if (typeof window === 'undefined') {
        return null;
      }
      
      const docSnap = await getDoc(doc(db, this.collectionName, id));
      return docSnap.exists() ? docSnap.data() as Template : null;
    } catch (error) {
      console.error('Error fetching template by ID:', error);
      return null;
    }
  }

  async getTemplatesByCategory(categoryId: string): Promise<Template[]> {
    try {
      // Prevent build failures during static generation
      if (typeof window === 'undefined') {
        return [];
      }
      
      if (categoryId === 'all') {
        const snapshot = await getDocs(collection(db, this.collectionName));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
      }
      const q = query(collection(db, this.collectionName), where('category', '==', categoryId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
    } catch (error) {
      console.error('Error fetching templates by category:', error);
      return [];
    }
  }

  async getPopularTemplates(limitCount: number = 10): Promise<Template[]> {
    const q = query(collection(db, this.collectionName), orderBy('rating', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
  }

  async getPremiumTemplates(): Promise<Template[]> {
    const q = query(collection(db, this.collectionName), where('premium', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
  }

  async getFreeTemplates(): Promise<Template[]> {
    const q = query(collection(db, this.collectionName), where('premium', '==', false));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
  }

  async updateTemplate(id: string, updates: Partial<Template>): Promise<void> {
    await updateDoc(doc(db, this.collectionName, id), updates);
  }

  async deleteTemplate(id: string): Promise<void> {
    await deleteDoc(doc(db, this.collectionName, id));
  }
}

export const templateService = new TemplateService();