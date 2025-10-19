
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Comment {
  id: string;
  storyId: string;
  author: string;
  authorId?: string;
  content: string;
  timestamp: number;
  parentId?: string; // For replies
}

interface FirebaseComment extends Omit<Comment, 'timestamp'> {
  timestamp: Timestamp;
}

const COMMENTS_COLLECTION = 'comments';

/**
 * Get all comments for a story
 */
export const getCommentsByStoryId = async (storyId: string): Promise<Comment[]> => {
  try {
    const commentsRef = collection(db, COMMENTS_COLLECTION);
    const q = query(
      commentsRef, 
      where('storyId', '==', storyId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const comments: Comment[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirebaseComment;
      comments.push({
        ...data,
        id: doc.id,
        timestamp: data.timestamp.toMillis(),
      });
    });
    
    return comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw new Error('Failed to fetch comments from Firebase');
  }
};

/**
 * Add a new comment
 */
export const addComment = async (comment: Omit<Comment, 'id' | 'timestamp'>): Promise<string> => {
  try {
    const commentData: Omit<FirebaseComment, 'id'> = {
      ...comment,
      timestamp: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), commentData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw new Error('Failed to add comment to Firebase');
  }
};

/**
 * Add a reply to a comment
 */
export const addReply = async (reply: Omit<Comment, 'id' | 'timestamp'>): Promise<string> => {
  try {
    const replyData: Omit<FirebaseComment, 'id'> = {
      ...reply,
      timestamp: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), replyData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding reply:', error);
    throw new Error('Failed to add reply to Firebase');
  }
};

/**
 * Delete a comment
 */
export const deleteComment = async (commentId: string): Promise<void> => {
  try {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    await deleteDoc(commentRef);
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw new Error('Failed to delete comment from Firebase');
  }
};

/**
 * Update a comment
 */
export const updateComment = async (commentId: string, updates: Partial<Pick<Comment, 'content'>>): Promise<void> => {
  try {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    await updateDoc(commentRef, {
      ...updates,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    throw new Error('Failed to update comment in Firebase');
  }
};
