
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  images?: string[];
}

interface ChatSession {
  id: string;
  title: string;
  userId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatSessionData {
  title: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface MessageData {
  content: string;
  role: 'user' | 'assistant';
  timestamp: Timestamp;
  chatId: string;
  images?: string[];
}

export const chatService = {
  // Create a new chat session
  async createChatSession(userId: string, title: string = 'New Chat'): Promise<ChatSession> {
    try {
      const chatData: ChatSessionData = {
        title,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'chats'), chatData);
      
      return {
        id: docRef.id,
        title,
        userId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  },

  // Get a specific chat session
  async getChatSession(chatId: string, userId: string): Promise<ChatSession | null> {
    try {
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      
      if (!chatDoc.exists()) {
        return null;
      }

      const chatData = chatDoc.data() as ChatSessionData;
      
      // Check if user owns this chat
      if (chatData.userId !== userId) {
        throw new Error('Unauthorized access to chat');
      }

      // Get messages for this chat
      const messagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId),
        orderBy('timestamp', 'asc')
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      const messages: Message[] = messagesSnapshot.docs.map(doc => {
        const data = doc.data() as MessageData;
        return {
          id: doc.id,
          content: data.content,
          role: data.role,
          timestamp: data.timestamp.toDate(),
          images: data.images || undefined,
        };
      });

      return {
        id: chatDoc.id,
        title: chatData.title,
        userId: chatData.userId,
        messages,
        createdAt: chatData.createdAt.toDate(),
        updatedAt: chatData.updatedAt.toDate(),
      };
    } catch (error) {
      console.error('Error getting chat session:', error);
      throw error;
    }
  },

  // Get all chat sessions for a user
  async getUserChatSessions(userId: string): Promise<Array<{
    id: string;
    title: string;
    lastMessage: string;
    updatedAt: Date;
    messageCount: number;
  }>> {
    try {
      const chatsQuery = query(
        collection(db, 'chats'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(50)
      );

      const chatsSnapshot = await getDocs(chatsQuery);
      
      const chatSessions = await Promise.all(
        chatsSnapshot.docs.map(async (chatDoc) => {
          const chatData = chatDoc.data() as ChatSessionData;
          
          // Get last message for preview
          const messagesQuery = query(
            collection(db, 'messages'),
            where('chatId', '==', chatDoc.id),
            orderBy('timestamp', 'desc'),
            limit(1)
          );
          
          const messagesSnapshot = await getDocs(messagesQuery);
          const lastMessage = messagesSnapshot.docs[0];
          
          // Get total message count
          const allMessagesQuery = query(
            collection(db, 'messages'),
            where('chatId', '==', chatDoc.id)
          );
          const allMessagesSnapshot = await getDocs(allMessagesQuery);
          
          return {
            id: chatDoc.id,
            title: chatData.title,
            lastMessage: lastMessage ? 
              (lastMessage.data() as MessageData).content.substring(0, 100) + 
              ((lastMessage.data() as MessageData).content.length > 100 ? '...' : '') :
              'No messages yet',
            updatedAt: chatData.updatedAt.toDate(),
            messageCount: allMessagesSnapshot.size,
          };
        })
      );

      return chatSessions;
    } catch (error) {
      console.error('Error getting user chat sessions:', error);
      throw error;
    }
  },

  // Add a message to a chat session
  async addMessage(chatId: string, message: Omit<Message, 'id'>): Promise<void> {
    try {
      // Validate that content exists and is not empty
      if (!message.content || typeof message.content !== 'string') {
        console.warn('Message content is invalid, using fallback', { content: message.content, role: message.role });
        message.content = message.role === 'user' ? 'Empty message' : 'No response generated';
      }

      const messageData: MessageData = {
        content: message.content.trim() || (message.role === 'user' ? 'Empty message' : 'No response generated'),
        role: message.role,
        timestamp: Timestamp.fromDate(message.timestamp),
        chatId,
        ...(message.images && message.images.length > 0 && { images: message.images }),
      };

      // Validate document size before saving (roughly estimate JSON size)
      const estimatedSize = JSON.stringify(messageData).length;
      if (estimatedSize > 900000) { // Leave some buffer below 1MB limit
        console.warn('Message too large, truncating images...');
        // Remove images if the message is too large
        delete messageData.images;
      }

      await addDoc(collection(db, 'messages'), messageData);

      // Update chat session's updatedAt timestamp
      await updateDoc(doc(db, 'chats', chatId), {
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error adding message:', error);
      if (error instanceof Error && error.message && error.message.includes('longer than')) {
        throw new Error('Message content is too large. Please reduce the size of your content or images.');
      }
      throw error;
    }
  },

  // Update chat session (e.g., title)
  async updateChatSession(chatId: string, updates: Partial<{ title: string }>): Promise<void> {
    try {
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, 'chats', chatId), updateData);
    } catch (error) {
      console.error('Error updating chat session:', error);
      throw error;
    }
  },

  // Delete a chat session and all its messages
  async deleteChatSession(chatId: string): Promise<void> {
    try {
      // Delete all messages first
      const messagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      const deleteMessagePromises = messagesSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deleteMessagePromises);

      // Delete the chat session
      await deleteDoc(doc(db, 'chats', chatId));
    } catch (error) {
      console.error('Error deleting chat session:', error);
      throw error;
    }
  },
};
