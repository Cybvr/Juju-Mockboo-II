import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import { templateService } from '@/services/templateService';
import { documentService } from '@/services/documentService';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useUsers(type: string, limit?: number) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        let data;
        switch(type) {
          case 'popular':
            data = await userService.getPopularUsers(limit);
            break;
          case 'active':
            data = await userService.getActiveUsers(limit);
            break;
          case 'verified':
            data = await userService.getVerifiedUsers();
            break;
          case 'admin':
            data = await userService.getAdminUsers();
            break;
          default:
            data = [];
        }
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [type, limit]);

  return { users, loading, error };
}

export function useDocuments() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const querySnapshot = await getDocs(collection(db, 'documents'));
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDocuments(docs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch documents');
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, []);

  return { documents, loading, error };
}

export function useTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const querySnapshot = await getDocs(collection(db, 'templates'));
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTemplates(docs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch templates');
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  return { templates, loading, error };
}