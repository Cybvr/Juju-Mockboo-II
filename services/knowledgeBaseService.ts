
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface KnowledgeDocument {
  id?: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const knowledgeBaseService = {
  // Add a new knowledge document
  async addDocument(document: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>) {
    const docData = {
      ...document,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const docRef = await addDoc(collection(db, 'knowledgeBase'), docData);
    return docRef.id;
  },

  // Get all documents
  async getAllDocuments(): Promise<KnowledgeDocument[]> {
    const q = query(collection(db, 'knowledgeBase'), orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as KnowledgeDocument[];
  },

  // Search documents by keyword
  async searchDocuments(keyword: string): Promise<KnowledgeDocument[]> {
    const allDocs = await this.getAllDocuments();
    const searchTerm = keyword.toLowerCase();
    
    return allDocs.filter(doc => 
      doc.title.toLowerCase().includes(searchTerm) ||
      doc.content.toLowerCase().includes(searchTerm) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  },

  // Get documents by category
  async getDocumentsByCategory(category: string): Promise<KnowledgeDocument[]> {
    const q = query(
      collection(db, 'knowledgeBase'), 
      where('category', '==', category),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as KnowledgeDocument[];
  },

  // Update a document
  async updateDocument(docId: string, updates: Partial<Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>>) {
    const docRef = doc(db, 'knowledgeBase', docId);
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };
    await updateDoc(docRef, updateData);
  }
};
