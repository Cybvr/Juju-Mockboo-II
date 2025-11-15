
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, updateDoc, deleteDoc, Timestamp, arrayUnion } from 'firebase/firestore';

export interface Board {
  id: string;
  userId: string;
  name: string;
  imageUrls: string[];
  documentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class BoardService {
  private collectionName = 'boards';

  async createBoard(userId: string, name: string): Promise<Board> {
    const docRef = doc(collection(db, this.collectionName));
    const newBoard = {
      id: docRef.id,
      userId,
      name,
      imageUrls: [],
      documentIds: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(docRef, newBoard);
    return {
      ...newBoard,
      createdAt: newBoard.createdAt.toDate(),
      updatedAt: newBoard.updatedAt.toDate()
    };
  }

  async getBoards(userId: string): Promise<Board[]> {
    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    } as Board));
  }

  async addDocumentToBoard(boardId: string, documentId: string, imageUrl: string): Promise<void> {
    const docRef = doc(db, this.collectionName, boardId);
    await updateDoc(docRef, {
      imageUrls: arrayUnion(imageUrl),
      documentIds: arrayUnion(documentId),
      updatedAt: Timestamp.now()
    });
  }

  async removeDocumentFromBoard(boardId: string, documentId: string, imageUrl: string): Promise<void> {
    const docRef = doc(db, this.collectionName, boardId);
    const boardSnap = await getDoc(docRef);
    
    if (boardSnap.exists()) {
      const boardData = boardSnap.data() as Board;
      const updatedImageUrls = boardData.imageUrls.filter(url => url !== imageUrl);
      const updatedDocumentIds = boardData.documentIds.filter(id => id !== documentId);
      
      await updateDoc(docRef, {
        imageUrls: updatedImageUrls,
        documentIds: updatedDocumentIds,
        updatedAt: Timestamp.now()
      });
    }
  }

  async updateBoard(boardId: string, updates: Partial<Pick<Board, 'name'>>): Promise<void> {
    const docRef = doc(db, this.collectionName, boardId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  async deleteBoard(boardId: string): Promise<void> {
    const docRef = doc(db, this.collectionName, boardId);
    await deleteDoc(docRef);
  }
}

export const boardService = new BoardService();
