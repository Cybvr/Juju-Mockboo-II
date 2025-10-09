
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { storiesService, StoryDocument } from '@/services/storiesService';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  BookOpen,
  Search,
  Eye,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<StoryDocument[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchAllStories();
  }, []);

  const fetchAllStories = async () => {
    try {
      setLoading(true);
      // Get all public stories first
      const publicStories = await storiesService.getPublicStories(100);
      setStories(publicStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStories(filteredStories.map(story => story.id));
    } else {
      setSelectedStories([]);
    }
  };

  const handleSelectStory = (storyId: string, checked: boolean) => {
    if (checked) {
      setSelectedStories(prev => [...prev, storyId]);
    } else {
      setSelectedStories(prev => prev.filter(id => id !== storyId));
    }
  };

  const handleEdit = (story: StoryDocument) => {
    setEditingItem({
      id: story.id,
      title: story.title,
      description: story.description,
      isPublic: story.isPublic,
      shared: story.shared,
      category: story.category,
    });
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    try {
      await storiesService.updateStory(editingItem.id, {
        title: editingItem.title,
        description: editingItem.description,
        isPublic: editingItem.isPublic,
        shared: editingItem.shared,
        category: editingItem.category,
      });
      
      await fetchAllStories();
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating story:', error);
    }
  };

  const handleDeleteSingle = (storyId: string) => {
    setStoryToDelete(storyId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!storyToDelete) return;

    try {
      await storiesService.deleteStory(storyToDelete);
      await fetchAllStories();
      setSelectedStories(prev => prev.filter(id => id !== storyToDelete));
    } catch (error) {
      console.error('Error deleting story:', error);
    } finally {
      setDeleteDialogOpen(false);
      setStoryToDelete(null);
    }
  };

  const handleBulkDelete = () => {
    if (selectedStories.length === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      await Promise.all(selectedStories.map(id => storiesService.deleteStory(id)));
      await fetchAllStories();
      setSelectedStories([]);
    } catch (error) {
      console.error('Error bulk deleting stories:', error);
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  const filteredStories = stories.filter(story =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allSelected = filteredStories.length > 0 && selectedStories.length === filteredStories.length;
  const someSelected = selectedStories.length > 0 && selectedStories.length < filteredStories.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Stories Management
          </CardTitle>
          <div className="flex gap-2">
            {selectedStories.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedStories.length})
              </Button>
            )}
            <Link href="/dashboard/storymaker">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Story
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Bulk Selection Header */}
        <div className="mb-4 p-3 border rounded-lg bg-muted/20">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              className={someSelected ? "data-[state=checked]:bg-orange-600" : ""}
            />
            <span className="text-sm font-medium">
              {selectedStories.length > 0 
                ? `${selectedStories.length} selected` 
                : `Select all (${filteredStories.length} stories)`
              }
            </span>
          </div>
        </div>

        {/* Stories List */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse mb-2" />
                      <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredStories.length > 0 ? (
            filteredStories.map(story => (
              <div key={story.id} className="p-4 border rounded-lg">
                {editingItem?.id === story.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Story Title"
                        value={editingItem.title}
                        onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                      />
                      <Input
                        placeholder="Category"
                        value={editingItem.category}
                        onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                      />
                    </div>
                    <Input
                      placeholder="Description"
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                    />
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={editingItem.isPublic}
                          onCheckedChange={(checked) => setEditingItem({...editingItem, isPublic: checked})}
                        />
                        <label className="text-sm">Public</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={editingItem.shared}
                          onCheckedChange={(checked) => setEditingItem({...editingItem, shared: checked})}
                        />
                        <label className="text-sm">Shared</label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleUpdate}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        checked={selectedStories.includes(story.id)}
                        onCheckedChange={(checked) => handleSelectStory(story.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{story.title}</h4>
                          <Badge variant={story.isPublic ? 'default' : 'secondary'}>
                            {story.isPublic ? 'Public' : 'Private'}
                          </Badge>
                          {story.shared && <Badge variant="outline">Shared</Badge>}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {story.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {story.updatedAt.toLocaleDateString()}
                          </span>
                          <span>Category: {story.category}</span>
                          <span>Scenes: {story.scenes?.length || 0}</span>
                          <span>ID: {story.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/storymaker/${story.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(story)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDeleteSingle(story.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No stories found. {searchTerm && 'Try adjusting your search term.'}
            </div>
          )}
        </div>
      </CardContent>

      {/* Single Delete Dialog */}
      <AlertDialog open={deleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Story</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this story? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Stories</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedStories.length} stories? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBulkDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete {selectedStories.length} Stories
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
