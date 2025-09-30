
import { User } from '@/types/firebase';
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export class UserService {
  private collectionName = 'users';

  async createUser(user: User): Promise<void> {
    const userDoc = {
      ...user,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await setDoc(doc(db, this.collectionName, user.id), userDoc);
  }

  async getUserById(uid: string): Promise<User | null> {
    const docSnap = await getDoc(doc(db, this.collectionName, uid));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as User : null;
  }

  async getUserByDisplayName(displayName: string): Promise<User | null> {
    const q = query(collection(db, this.collectionName), where('name', '==', displayName), limit(1));
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as User;
  }

  async getPopularUsers(limitCount: number = 10): Promise<User[]> {
    const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  }

  async getActiveUsers(limitCount: number = 10): Promise<User[]> {
    const q = query(collection(db, this.collectionName), orderBy('updatedAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  }

  async getVerifiedUsers(): Promise<User[]> {
    const snapshot = await getDocs(collection(db, this.collectionName));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  }

  async getAdminUsers(): Promise<User[]> {
    const q = query(collection(db, this.collectionName), where('role', '==', 'admin'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  }

  async updateUser(uid: string, updates: Partial<User & { bio?: string }>): Promise<void> {
    await updateDoc(doc(db, this.collectionName, uid), {
      ...updates,
      updatedAt: new Date()
    });
  }

  async deleteUser(uid: string): Promise<void> {
    await deleteDoc(doc(db, this.collectionName, uid));
  }

  async getAllUsers(): Promise<User[]> {
    const snapshot = await getDocs(collection(db, this.collectionName));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  }

  async isUserAdmin(uid: string): Promise<boolean> {
    const user = await this.getUserById(uid);
    return user?.role === 'admin';
  }
}

export const userService = new UserService();
