import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { TTSDocument } from '@/types/firebase';

export class TTSService {
  private collectionName = 'tts';

  async createTTS(userId: string, text: string, title?: string): Promise<string> {
    const docRef = doc(collection(db, this.collectionName));
    const newDoc: Omit<TTSDocument, 'id'> = {
      userId,
      text,
      title: title || `TTS - ${new Date().toLocaleDateString()}`,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    await setDoc(docRef, newDoc);
    return docRef.id;
  }

  async getTTSById(id: string): Promise<TTSDocument | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as TTSDocument : null;
  }

  async getUserTTS(userId: string): Promise<TTSDocument[]> {
    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TTSDocument));
  }

  async getUserRecentTTS(userId: string, limitNum: number = 20): Promise<TTSDocument[]> {
    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(limitNum)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TTSDocument));
  }

  async updateTTS(id: string, updates: Partial<TTSDocument>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, { ...updates, updatedAt: Timestamp.now() });
  }

  async deleteTTS(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async updateStatus(id: string, status: TTSDocument['status'], errorMessage?: string): Promise<void> {
    const updates: Partial<TTSDocument> = { status };
    if (errorMessage) {
      updates.errorMessage = errorMessage;
    }
    await this.updateTTS(id, updates);
  }

  async setAudioUrl(id: string, audioUrl: string): Promise<void> {
    await this.updateTTS(id, { 
      audioUrl, 
      status: 'completed' 
    });
  }
}

export const ttsService = new TTSService();
