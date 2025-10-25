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
import { db } from '@/lib/firebase';
import type { FilmProject } from '@/types/storytypes';

const STORIES_COLLECTION = 'stories';

export interface FirebaseFilmProject extends Omit<FilmProject, 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Get all stories from Firebase
 */
export const getAllStories = async (): Promise<FilmProject[]> => {
  try {
    const storiesRef = collection(db, STORIES_COLLECTION);
    const q = query(storiesRef, where('isPublic', '==', true), orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const stories: FilmProject[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirebaseFilmProject;
      stories.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toMillis(),
        updatedAt: data.updatedAt.toMillis(),
      });
    });

    return stories;
  } catch (error) {
    console.error('Error fetching stories:', error);
    return [];
  }
};

/**
 * Get a single story by ID
 */
export const getStoryById = async (id: string): Promise<FilmProject | null> => {
  try {
    const storyRef = doc(db, STORIES_COLLECTION, id);
    const docSnap = await getDoc(storyRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as FirebaseFilmProject;
      return {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt.toMillis(),
        updatedAt: data.updatedAt.toMillis(),
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching story:', error);
    throw new Error('Failed to fetch story from Firebase');
  }
};

/**
 * Create a new story
 */
export const createStory = async (story: Omit<FilmProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const now = Timestamp.now();
    const storyData: Omit<FirebaseFilmProject, 'id'> = {
      ...story,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, STORIES_COLLECTION), storyData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating story:', error);
    throw new Error('Failed to create story in Firebase');
  }
};

/**
 * Update an existing story
 */
export const updateStory = async (id: string, updates: Partial<FilmProject>): Promise<void> => {
  try {
    const storyRef = doc(db, STORIES_COLLECTION, id);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    // Remove id, createdAt from updates if they exist
    delete updateData.id;
    delete updateData.createdAt;

    await updateDoc(storyRef, updateData);
  } catch (error) {
    console.error('Error updating story:', error);
    throw new Error('Failed to update story in Firebase');
  }
};

/**
 * Delete a story
 */
export const deleteStory = async (id: string): Promise<void> => {
  try {
    const storyRef = doc(db, STORIES_COLLECTION, id);
    await deleteDoc(storyRef);
  } catch (error) {
    console.error('Error deleting story:', error);
    throw new Error('Failed to delete story from Firebase');
  }
};

/**
 * Get stories by title search
 */
export const searchStoriesByTitle = async (searchTerm: string): Promise<FilmProject[]> => {
  try {
    const storiesRef = collection(db, STORIES_COLLECTION);
    const q = query(
      storiesRef, 
      where('title', '>=', searchTerm),
      where('title', '<=', searchTerm + '\uf8ff'),
      orderBy('title'),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const stories: FilmProject[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirebaseFilmProject;
      stories.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toMillis(),
        updatedAt: data.updatedAt.toMillis(),
      });
    });

    return stories;
  } catch (error) {
    console.error('Error searching stories:', error);
    throw new Error('Failed to search stories in Firebase');
  }
};

/**
 * Duplicate/clone a story
 */
export const duplicateStory = async (originalId: string, newTitle?: string): Promise<string> => {
  try {
    const originalStory = await getStoryById(originalId);
    if (!originalStory) {
      throw new Error('Original story not found');
    }

    const duplicatedStory = {
      ...originalStory,
      title: newTitle || `${originalStory.title} (Copy)`,
      isTemplate: false,
    };

    // Remove id, createdAt, updatedAt for the new story
    delete duplicatedStory.id;
    delete duplicatedStory.createdAt;
    delete duplicatedStory.updatedAt;

    return await createStory(duplicatedStory);
  } catch (error) {
    console.error('Error duplicating story:', error);
    throw new Error('Failed to duplicate story in Firebase');
  }
};

/**
 * Get template stories (stories marked as templates)
 */
export const getTemplateStories = async (): Promise<FilmProject[]> => {
  try {
    const storiesRef = collection(db, STORIES_COLLECTION);
    const q = query(
      storiesRef, 
      where('isTemplate', '==', true),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const templates: FilmProject[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirebaseFilmProject;
      templates.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toMillis(),
        updatedAt: data.updatedAt.toMillis(),
      });
    });

    return templates;
  } catch (error) {
    console.error('Error fetching template stories:', error);
    throw new Error('Failed to fetch template stories from Firebase');
  }
};

/**
 * Batch operations for better performance
 */
export const batchUpdateStories = async (updates: Array<{ id: string; data: Partial<FilmProject> }>): Promise<void> => {
  try {
    // For simplicity, we'll do sequential updates
    // In a production app, you might want to use Firebase batch operations
    for (const update of updates) {
      await updateStory(update.id, update.data);
    }
  } catch (error) {
    console.error('Error batch updating stories:', error);
    throw new Error('Failed to batch update stories in Firebase');
  }
};