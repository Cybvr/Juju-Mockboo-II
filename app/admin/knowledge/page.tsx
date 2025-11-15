
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { knowledgeBaseService, KnowledgeDocument } from '@/services/knowledgeBaseService';
import { useToast } from '@/hooks/use-toast';

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDoc, setEditingDoc] = useState<KnowledgeDocument | null>(null);
  const [newDoc, setNewDoc] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await knowledgeBaseService.getAllDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast({
        title: "Error",
        description: "Failed to load knowledge base documents.",
        variant: "destructive",
      });
    }
  };

  const handleAddDocument = async () => {
    if (!newDoc.title || !newDoc.content) {
      toast({
        title: "Error",
        description: "Title and content are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      await knowledgeBaseService.addDocument(newDoc);
      setNewDoc({ title: '', content: '', category: '', tags: [] });
      setTagInput('');
      setIsAdding(false);
      loadDocuments();
      toast({
        title: "Success",
        description: "Knowledge base document added successfully.",
      });
    } catch (error) {
      console.error('Failed to add document:', error);
      toast({
        title: "Error",
        description: "Failed to add document.",
        variant: "destructive",
      });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !newDoc.tags.includes(tagInput.trim())) {
      setNewDoc(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewDoc(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleEditDocument = (doc: KnowledgeDocument) => {
    setEditingDoc(doc);
    setIsAdding(false);
  };

  const handleUpdateDocument = async () => {
    if (!editingDoc || !editingDoc.title || !editingDoc.content) {
      toast({
        title: "Error",
        description: "Title and content are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      await knowledgeBaseService.updateDocument(editingDoc.id!, {
        title: editingDoc.title,
        content: editingDoc.content,
        category: editingDoc.category,
        tags: editingDoc.tags
      });
      setEditingDoc(null);
      loadDocuments();
      toast({
        title: "Success",
        description: "Document updated successfully.",
      });
    } catch (error) {
      console.error('Failed to update document:', error);
      toast({
        title: "Error",
        description: "Failed to update document.",
        variant: "destructive",
      });
    }
  };

  const addEditTag = (tag: string) => {
    if (tag.trim() && editingDoc && !editingDoc.tags.includes(tag.trim())) {
      setEditingDoc(prev => prev ? {
        ...prev,
        tags: [...prev.tags, tag.trim()]
      } : null);
    }
  };

  const removeEditTag = (tagToRemove: string) => {
    if (editingDoc) {
      setEditingDoc(prev => prev ? {
        ...prev,
        tags: prev.tags.filter(tag => tag !== tagToRemove)
      } : null);
    }
  };

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Knowledge Base Management</h1>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Document
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Add Document Form */}
      {isAdding && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Document title"
              value={newDoc.title}
              onChange={(e) => setNewDoc(prev => ({ ...prev, title: e.target.value }))}
            />
            <Input
              placeholder="Category"
              value={newDoc.category}
              onChange={(e) => setNewDoc(prev => ({ ...prev, category: e.target.value }))}
            />
            <Textarea
              placeholder="Document content"
              value={newDoc.content}
              onChange={(e) => setNewDoc(prev => ({ ...prev, content: e.target.value }))}
              rows={6}
            />
            <div>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} variant="outline">Add Tag</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newDoc.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddDocument}>Save Document</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Document Form */}
      {editingDoc && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Document title"
              value={editingDoc.title}
              onChange={(e) => setEditingDoc(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
            />
            <Input
              placeholder="Category"
              value={editingDoc.category}
              onChange={(e) => setEditingDoc(prev => prev ? ({ ...prev, category: e.target.value }) : null)}
            />
            <Textarea
              placeholder="Document content"
              value={editingDoc.content}
              onChange={(e) => setEditingDoc(prev => prev ? ({ ...prev, content: e.target.value }) : null)}
              rows={6}
            />
            <div>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addEditTag(tagInput);
                      setTagInput('');
                    }
                  }}
                />
                <Button onClick={() => {
                  addEditTag(tagInput);
                  setTagInput('');
                }} variant="outline">Add Tag</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editingDoc.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeEditTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateDocument}>Update Document</Button>
              <Button variant="outline" onClick={() => setEditingDoc(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents List */}
      <div className="grid gap-4">
        {filteredDocs.map(doc => (
          <Card key={doc.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{doc.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Category: {doc.category} • Updated: {doc.updatedAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditDocument(doc)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2">{doc.content.substring(0, 200)}...</p>
              <div className="flex flex-wrap gap-1">
                {doc.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
