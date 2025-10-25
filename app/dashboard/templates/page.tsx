
'use client';

import React, { useState, useEffect } from 'react';
import type { FilmProject } from '@/types/storytypes';
import { getAllStories } from '@/services/storiesService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Globe, Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

const getAllCategories = (templates: FilmProject[]) => {
  const templateCategories = templates
    .map(template => template.category)
    .filter(Boolean)
    .filter((category, index, self) => self.indexOf(category) === index);
  
  return ['All', ...templateCategories.sort()];
};

interface TemplateCardProps {
  template: FilmProject;
  onSelect: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  const firstImageUrl = template.storyboard?.[0]?.imageUrl;
  
  return (
    <Card
      onClick={onSelect}
      className="group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
    >
      <div className="relative aspect-video bg-muted">
        {firstImageUrl ? (
          <img src={firstImageUrl} alt="Template thumbnail" className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <FileText className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Globe className="w-4 h-4 text-green-500 bg-white rounded-full p-0.5" />
        </div>
      </div>
      <CardContent className="p-4 flex-1">
        <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate">
          {template.title}
        </h3>
        
      </CardContent>
    </Card>
  );
};

export default function TemplatesPage() {
  const [publicTemplates, setPublicTemplates] = useState<FilmProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const router = useRouter();

  useEffect(() => {
    loadPublicTemplates();
  }, []);

  const loadPublicTemplates = async () => {
    setLoading(true);
    try {
      const publicStories = await getAllStories();
      setPublicTemplates(publicStories);
    } catch (error) {
      console.error('Failed to load public templates:', error);
      setPublicTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = publicTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = async (template: FilmProject) => {
    try {
      // Import the duplication service
      const { duplicateStory } = await import('@/services/storiesService');
      const newStory = await duplicateStory(template.id);
      router.push(`/dashboard/stories/${newStory.id}`);
    } catch (error) {
      console.error('Failed to create copy of template:', error);
      // Fallback to direct navigation if duplication fails
      router.push(`/dashboard/stories/${template.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden mx-auto max-w-6xl">
        <main className="flex-1 overflow-y-auto p-3 lg:p-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-foreground">Loading public templates...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden mx-auto max-w-4xl">
      <main className="flex-1 overflow-y-auto p-3 lg:p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Public Templates</h1>
            <p className="text-muted-foreground">
              Discover and use templates created by the community
            </p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {getAllCategories(publicTemplates).map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>

            <div className="text-sm text-muted-foreground">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedCategory !== 'All' 
                    ? 'Try adjusting your search or filters' 
                    : 'No public templates are available at the moment'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={() => handleSelectTemplate(template)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
