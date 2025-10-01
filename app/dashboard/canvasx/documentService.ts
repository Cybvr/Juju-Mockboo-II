import { supabase, Document } from './supabase';

export const documentService = {
  async getRecentDocuments(): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  },

  async getDocument(id: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createDocument(name: string, userId: string): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        name,
        owner_id: userId,
        canvas_data: {}
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateDocument(id: string, updates: { name?: string; canvas_data?: any }): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
