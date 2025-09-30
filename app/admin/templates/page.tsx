'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { templateService } from '@/services/templateService';
import { Template } from '@/types/firebase';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Layout
} from 'lucide-react';

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItem, setNewItem] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const allTemplates = await templateService.getTemplatesByCategory('all');
        setTemplates(allTemplates);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleCreate = async () => {
    try {
      const templateData: Template = {
        id: `template_${Date.now()}`,
        name: newItem.name || 'Untitled Template',
        category: newItem.category || 'general',
        description: newItem.description || '',
        image: '/placeholder.svg',
        tags: [],
        premium: newItem.premium || false,
        rating: newItem.rating || 0,
        uses: '0',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await templateService.createTemplate(templateData);
      
      // Refresh the templates list
      const allTemplates = await templateService.getTemplatesByCategory('all');
      setTemplates(allTemplates);
      setNewItem({});
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await templateService.updateTemplate(id, {
        name: editingItem.name,
        category: editingItem.category,
        premium: editingItem.premium,
        rating: editingItem.rating,
        updatedAt: new Date()
      });
      
      // Refresh the templates list
      const allTemplates = await templateService.getTemplatesByCategory('all');
      setTemplates(allTemplates);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await templateService.deleteTemplate(id);
      
      // Refresh the templates list
      const allTemplates = await templateService.getTemplatesByCategory('all');
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layout className="h-5 w-5" />
          Templates Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Create Form */}
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-3">Create New Template</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Template Name"
              value={newItem.name || ''}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
            />
            <Input
              placeholder="Category"
              value={newItem.category || ''}
              onChange={(e) => setNewItem({...newItem, category: e.target.value})}
            />
            <Input
              type="number"
              step="0.1"
              placeholder="Rating"
              value={newItem.rating || ''}
              onChange={(e) => setNewItem({...newItem, rating: parseFloat(e.target.value)})}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newItem.premium || false}
                onChange={(e) => setNewItem({...newItem, premium: e.target.checked})}
              />
              <label>Premium</label>
            </div>
          </div>
          <Button onClick={handleCreate} className="mt-3">
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>

        {/* Templates List */}
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
          ) : templates.length > 0 ? (
            templates.map(template => (
              <div key={template.id} className="p-4 border rounded-lg">
                {editingItem?.id === template.id ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                    />
                    <Input
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                    />
                    <Input
                      type="number"
                      step="0.1"
                      value={editingItem.rating}
                      onChange={(e) => setEditingItem({...editingItem, rating: parseFloat(e.target.value)})}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingItem.premium}
                        onChange={(e) => setEditingItem({...editingItem, premium: e.target.checked})}
                      />
                      <label>Premium</label>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleUpdate(template.id)}>
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
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-sm text-gray-600">
                        Category: {template.category} | Rating: {template.rating} | Uses: {template.uses}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={template.premium ? 'default' : 'secondary'}>
                          {template.premium ? 'Premium' : 'Free'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          ID: {template.id.slice(0, 12)}...
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingItem(template)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(template.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No templates found. Create your first template above.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}