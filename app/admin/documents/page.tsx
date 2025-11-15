'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { documentService } from '@/services/documentService';
import { Document } from '@/types/firebase';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  FileText
} from 'lucide-react';

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItem, setNewItem] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const allDocuments = await documentService.getDocumentsByType('all');
        setDocuments(allDocuments);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleCreate = async () => {
    try {
      const documentData = {
        title: newItem.name || 'Untitled Document',
        type: newItem.type || 'document',
        content: {},
        tags: newItem.category ? [newItem.category] : [],
        category: newItem.category,
        isPublic: newItem.isPublic || false
      };
      
      await documentService.createDocument('admin', documentData);
      
      // Refresh the documents list
      const allDocuments = await documentService.getDocumentsByType('all');
      setDocuments(allDocuments);
      setNewItem({});
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const updates = {
        title: editingItem.title,
        type: editingItem.type,
        category: editingItem.category,
        isPublic: editingItem.isPublic,
        updatedAt: new Date()
      };
      
      await documentService.updateDocument(id, updates);
      
      // Refresh the documents list
      const allDocuments = await documentService.getDocumentsByType('all');
      setDocuments(allDocuments);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await documentService.deleteDocument(id);
      
      // Refresh the documents list
      const allDocuments = await documentService.getDocumentsByType('all');
      setDocuments(allDocuments);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Create Form */}
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-3">Create New Document</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Document Title"
              value={newItem.title || ''}
              onChange={(e) => setNewItem({...newItem, title: e.target.value})}
            />
            <Input
              placeholder="Type (mockup, template, design)"
              value={newItem.type || ''}
              onChange={(e) => setNewItem({...newItem, type: e.target.value})}
            />
            <Input
              placeholder="Category"
              value={newItem.category || ''}
              onChange={(e) => setNewItem({...newItem, category: e.target.value})}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newItem.isPublic || false}
                onChange={(e) => setNewItem({...newItem, isPublic: e.target.checked})}
              />
              <label>Public</label>
            </div>
          </div>
          <Button onClick={handleCreate} className="mt-3">
            <Plus className="h-4 w-4 mr-2" />
            Create Document
          </Button>
        </div>

        {/* Documents List */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                      <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : documents.length > 0 ? (
            documents.map(doc => (
              <div key={doc.id} className="p-4 border rounded-lg">
                {editingItem?.id === doc.id ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      value={editingItem.title}
                      onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                    />
                    <Input
                      value={editingItem.type}
                      onChange={(e) => setEditingItem({...editingItem, type: e.target.value})}
                    />
                    <Input
                      value={editingItem.category || ''}
                      onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingItem.isPublic}
                        onChange={(e) => setEditingItem({...editingItem, isPublic: e.target.checked})}
                      />
                      <label>Public</label>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleUpdate(doc.id)}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{doc.title}</h4>
                      <p className="text-sm text-gray-600">
                        Type: {doc.type} | Category: {doc.category || 'None'} | ID: {doc.id.slice(0, 8)}...
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={doc.isPublic ? 'default' : 'secondary'}>
                          {doc.isPublic ? 'Public' : 'Private'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {doc.createdAt?.toDate ? doc.createdAt.toDate().toLocaleDateString() : 'Unknown date'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingItem(doc)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(doc.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No documents found. Create your first document above.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}