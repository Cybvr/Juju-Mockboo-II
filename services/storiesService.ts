import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, updateDoc, deleteDoc, Timestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ProjectConfig, Scene, Character, Location, Sound } from '@/app/dashboard/storymaker/common/storymaker-context';
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
    console.log('Creating new story for user:', userId);
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
    console.log('Story created with ID:', docRef.id);
    return docRef.id;
  }

  async getStory(storyId: string): Promise<StoryDocument | null> {
    console.log('Fetching story with ID:', storyId);
    const docRef = doc(db, this.collectionName, storyId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const story = {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as StoryDocument;
      console.log('Found story:', storyId);
      return story;
    }
    console.log('No story found with ID:', storyId);
    return null;
  }

  async getUserStories(userId: string): Promise<StoryDocument[]> {
    console.log('Fetching stories for user:', userId);
    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const stories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    } as StoryDocument));
    console.log('Found', stories.length, 'stories for user:', userId);
    return stories;
  }

  async getPublicStories(limit: number = 20): Promise<StoryDocument[]> {
    console.log('getPublicStories method called with limit:', limit);
    const q = query(
      collection(db, this.collectionName),
      where('isPublic', '==', true),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const stories = snapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    } as StoryDocument));
    console.log('getPublicStories returned', stories.length, 'stories');
    return stories;
  }

  async getAllStories(): Promise<StoryDocument[]> {
    console.log('getAllStories method called');
    const q = query(collection(db, this.collectionName), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    const stories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    } as StoryDocument));
    console.log('getAllStories returned', stories.length, 'stories');
    return stories;
  }

  async updateStory(storyId: string, updates: Partial<StoryDocument>): Promise<void> {
    console.log('Updating story:', storyId, 'with updates:', updates);
    const docRef = doc(db, this.collectionName, storyId);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    delete updateData.id;
    delete updateData.createdAt;

    await updateDoc(docRef, updateData);
    console.log('Story updated successfully:', storyId);
  }

  async updateProjectConfig(storyId: string, projectConfig: ProjectConfig): Promise<void> {
    console.log('Updating project config for story:', storyId);
    const docRef = doc(db, this.collectionName, storyId);
    await updateDoc(docRef, {
      projectConfig,
      updatedAt: Timestamp.now()
    });
    console.log('Project config updated for story:', storyId);
  }

  async updateScenes(storyId: string, scenes: Scene[]): Promise<void> {
    console.log('Updating scenes for story:', storyId);
    const docRef = doc(db, this.collectionName, storyId);
    await updateDoc(docRef, {
      scenes,
      updatedAt: Timestamp.now()
    });
    console.log('Scenes updated for story:', storyId);
  }

  async addScene(storyId: string, scene: Scene): Promise<void> {
    console.log('Adding scene to story:', storyId);
    const docRef = doc(db, this.collectionName, storyId);
    await updateDoc(docRef, {
      scenes: arrayUnion(scene),
      updatedAt: Timestamp.now()
    });
    console.log('Scene added to story:', storyId);
  }

  async removeScene(storyId: string, scene: Scene): Promise<void> {
    console.log('Removing scene from story:', storyId);
    const docRef = doc(db, this.collectionName, storyId);
    await updateDoc(docRef, {
      scenes: arrayRemove(scene),
      updatedAt: Timestamp.now()
    });
    console.log('Scene removed from story:', storyId);
  }

  async updateCharacters(storyId: string, characters: Character[]): Promise<void> {
    console.log('Updating characters for story:', storyId);
    const docRef = doc(db, this.collectionName, storyId);
    await updateDoc(docRef, {
      characters,
      updatedAt: Timestamp.now()
    });
    console.log('Characters updated for story:', storyId);
  }

  async updateLocations(storyId: string, locations: Location[]): Promise<void> {
    console.log('Updating locations for story:', storyId);
    const docRef = doc(db, this.collectionName, storyId);
    await updateDoc(docRef, {
      locations,
      updatedAt: Timestamp.now()
    });
    console.log('Locations updated for story:', storyId);
  }

  async updateSounds(storyId: string, sounds: Sound[]): Promise<void> {
    console.log('Updating sounds for story:', storyId);
    const docRef = doc(db, this.collectionName, storyId);
    await updateDoc(docRef, {
      sounds,
      updatedAt: Timestamp.now()
    });
    console.log('Sounds updated for story:', storyId);
  }

  async setTemplate(storyId: string, template: Template): Promise<void> {
    console.log('Setting template for story:', storyId);
    const docRef = doc(db, this.collectionName, storyId);
    await updateDoc(docRef, {
      selectedTemplate: template,
      updatedAt: Timestamp.now()
    });
    console.log('Template set for story:', storyId);
  }

  async deleteStory(storyId: string): Promise<void> {
    console.log('Deleting story:', storyId);
    const docRef = doc(db, this.collectionName, storyId);
    await deleteDoc(docRef);
    console.log('Story deleted successfully:', storyId);
  }

  async duplicateStory(storyId: string, userId: string, newTitle?: string): Promise<string> {
    console.log('Duplicating story:', storyId, 'for user:', userId);
    const originalStory = await this.getStory(storyId);
    if (!originalStory) {
      console.error('Story not found for duplication:', storyId);
      throw new Error('Story not found');
    }
    const duplicatedStory = {
      ...originalStory,
      title: newTitle || `${originalStory.title} (Copy)`,
      isPublic: false,
      shared: false
    };
    const newStoryId = await this.createStory(userId, duplicatedStory);
    console.log('Story duplicated successfully. Original ID:', storyId, 'New ID:', newStoryId);
    return newStoryId;
  }

  async shareStory(storyId: string, isShared: boolean): Promise<void> {
    console.log('Sharing story:', storyId, 'with isShared:', isShared);
    const docRef = doc(db, this.collectionName, storyId);
    await updateDoc(docRef, {
      shared: isShared,
      updatedAt: Timestamp.now()
    });
    console.log('Story share status updated:', storyId);
  }

  async publishStory(storyId: string, isPublic: boolean): Promise<void> {
    console.log('Publishing story:', storyId, 'with isPublic:', isPublic);
    const docRef = doc(db, this.collectionName, storyId);
    await updateDoc(docRef, {
      isPublic,
      updatedAt: Timestamp.now()
    });
    console.log('Story publish status updated:', storyId);
  }

  async addTag(storyId: string, tag: string): Promise<void> {
    console.log('Adding tag to story:', storyId, 'Tag:', tag);
    const docRef = doc(db, this.collectionName, storyId);
    await updateDoc(docRef, {
      tags: arrayUnion(tag),
      updatedAt: Timestamp.now()
    });
    console.log('Tag added to story:', storyId);
  }

  async removeTag(storyId: string, tag: string): Promise<void> {
    console.log('Removing tag from story:', storyId, 'Tag:', tag);
    const docRef = doc(db, this.collectionName, storyId);
    await updateDoc(docRef, {
      tags: arrayRemove(tag),
      updatedAt: Timestamp.now()
    });
    console.log('Tag removed from story:', storyId);
  }

  async searchStories(userId: string, searchTerm: string): Promise<StoryDocument[]> {
    console.log('Searching stories for user:', userId, 'with term:', searchTerm);
    const userStories = await this.getUserStories(userId);
    const results = userStories.filter(story =>
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    console.log('Search returned', results.length, 'results');
    return results;
  }

  async getStoriesByCategory(category: string, isPublic: boolean = false): Promise<StoryDocument[]> {
    console.log('Fetching stories by category:', category, 'isPublic:', isPublic);
    const q = query(
      collection(db, this.collectionName),
      where('category', '==', category),
      where('isPublic', '==', isPublic),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const stories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    } as StoryDocument));
    console.log('Found', stories.length, 'stories in category:', category);
    return stories;
  }
}

export const storiesService = new StoriesService();
