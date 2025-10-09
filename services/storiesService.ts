
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, updateDoc, deleteDoc, Timestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ProjectConfig, Scene, Character, Location, Sound } from '@/data/storymakerData';
import { Template } from '@/data/storymakerTemplatesData';

export interface StoryDocument {
  id: string;
  userId: string;
  title: string;
  description: string;
  thumbnail?: string;
  projectConfig: ProjectConfig;
  scenes: Scene[];
  characters: Character[];
  locations: Location[];
  sounds: Sound[];
  selectedTemplate?: Template;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  shared: boolean;
  tags: string[];
  category: 'story' | 'commercial' | 'ugc' | 'entertainment';
}

export class StoriesService {
  private collectionName = 'stories';

  async createStory(userId: string, data: Partial<StoryDocument>): Promise<string> {
    const docRef = doc(collection(db, this.collectionName));
    const newStory = {
      id: docRef.id,
      userId,
      title: data.title || 'Untitled Story',
      description: data.description || '',
      thumbnail: data.thumbnail || '',
      projectConfig: data.projectConfig || {},
      scenes: data.scenes || [],
      characters: data.characters || [],
      locations: data.locations || [],
      sounds: data.sounds || [],
      selectedTemplate: data.selectedTemplate || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isPublic: data.isPublic || false,
      shared: data.shared || false,
      tags: data.tags || ['story'],
      category: data.category || 'story',
    };

    await setDoc(docRef, newStory);
    return docRef.id;
  }

  async getStory(storyId: string): Promise<StoryDocument | null> {
    const docRef = doc(db, this.collectionName, storyId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as StoryDocument;
    }
    return null;
  }

  async getUserStories(userId: string): Promise<StoryDocument[]> {
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
    } as StoryDocument));
  }

  async getPublicStories(limit: number = 20): Promise<StoryDocument[]> {
    const q = query(
      collection(db, this.collectionName),
      where('isPublic', '==', true),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    } as StoryDocument));
  }

  async updateStory(storyId: string, updates: Partial<StoryDocument>): Promise<void> {
    const docRef = doc(db, this.collectionName, storyId);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    delete updateData.id;
    delete updateData.createdAt;
    
    await updateDoc(docRef, updateData);
  }

  async updateProjectConfig(storyId: string, projectConfig: ProjectConfig): Promise<void> {
    const docRef = doc(db, this.collectionName, storyId);
    await updateDoc(docRef, {
      projectConfig,
      updatedAt: Timestamp.now()
    });
  }

  async updateScenes(storyId: string, scenes: Scene[]): Promise<void> {
    const docRef = doc(db, this.collectionName, storyId);
    await updateDoc(docRef, {
      scenes,
      updatedAt: Timestamp.now()
    });
  }

  async addScene(storyId: string, scene: Scene): Promise<void> {
    const docRef = doc(db, this.collectionName, storyId);
    await updateDoc(docRef, {
      scenes: arrayUnion(scene),
      updatedAt: Timestamp.now()
    });
  }

  async removeScene(storyId: string, scene: Scene): Promise<void> {
    const docRef = doc(db, this.collectionName, storyId);
    await updateDoc(docRef, {
      scenes: arrayRemove(scene),
      updatedAt: Timestamp.now()
    });
  }

  async updateCharacters(storyId: string, characters: Character[]): Promise<void> {
    const docRef = doc(db, this.collectionName, storyId);
    await updateDoc(docRef, {
      characters,
      updatedAt: Timestamp.now()
    });
  }

  async updateLocations(storyId: string, locations: Location[]): Promise<void> {
    const docRef = doc(db, this.collectionName, storyId);
    await updateDoc(docRef, {
      locations,
      updatedAt: Timestamp.now()
    });
  }

  async updateSounds(storyId: string, sounds: Sound[]): Promise<void> {
    const docRef = doc(db, this.collectionName, storyId);
    await updateDoc(docRef, {
      sounds,
      updatedAt: Timestamp.now()
    });
  }

  async setTemplate(storyId: string, template: Template): Promise<void> {
    const docRef = doc(db, this.collectionName, storyId);
    await updateDoc(docRef, {
      selectedTemplate: template,
      updatedAt: Timestamp.now()
    });
  }

  async deleteStory(storyId: string): Promise<void> {
    const docRef = doc(db, this.collectionName, storyId);
    await deleteDoc(docRef);
  }

  async duplicateStory(storyId: string, userId: string, newTitle?: string): Promise<string> {
    const originalStory = await this.getStory(storyId);
    if (!originalStory) throw new Error('Story not found');

    const duplicatedStory = {
      ...originalStory,
      title: newTitle || `${originalStory.title} (Copy)`,
      isPublic: false,
      shared: false
    };

    return this.createStory(userId, duplicatedStory);
  }

  async shareStory(storyId: string, isShared: boolean): Promise<void> {
    const docRef = doc(db, this.collectionName, storyId);
    await updateDoc(docRef, {
      shared: isShared,
      updatedAt: Timestamp.now()
    });
  }

  async publishStory(storyId: string, isPublic: boolean): Promise<void> {
    const docRef = doc(db, this.collectionName, storyId);
    await updateDoc(docRef, {
      isPublic,
      updatedAt: Timestamp.now()
    });
  }

  async addTag(storyId: string, tag: string): Promise<void> {
    const docRef = doc(db, this.collectionName, storyId);
    await updateDoc(docRef, {
      tags: arrayUnion(tag),
      updatedAt: Timestamp.now()
    });
  }

  async removeTag(storyId: string, tag: string): Promise<void> {
    const docRef = doc(db, this.collectionName, storyId);
    await updateDoc(docRef, {
      tags: arrayRemove(tag),
      updatedAt: Timestamp.now()
    });
  }

  async searchStories(userId: string, searchTerm: string): Promise<StoryDocument[]> {
    const userStories = await this.getUserStories(userId);
    return userStories.filter(story =>
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  async getStoriesByCategory(category: string, isPublic: boolean = false): Promise<StoryDocument[]> {
    const q = query(
      collection(db, this.collectionName),
      where('category', '==', category),
      where('isPublic', '==', isPublic),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    } as StoryDocument));
  }
}

export const storiesService = new StoriesService();
