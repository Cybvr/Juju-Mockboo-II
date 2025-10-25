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

const categories = [
  'All',
  'UGC',
  'Ad/Commercial',
  'Film/Cinema',
  'Documentary',
  'Educational',
  'Social Media',
  'Product Demo',
  'Brand Story',
  'Tutorial',
  'Entertainment',
  'Music Video'
];

interface TemplateCardProps {
  template: FilmProject;
  onSelect: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  const firstImageUrl = template.storyboard?.[0]?.imageUrl;
  return (
    <Card
      onClick={onSelect}
      className="group cursor-pointer overflow-hidden relative aspect-video"
    >
      {firstImageUrl ? (
        <img src={firstImageUrl} alt="Template thumbnail" className="w-full h-full object-cover absolute inset-0" />
      ) : (
        <div className="flex items-center justify-center h-full bg-muted absolute inset-0">
          <FileText className="w-12 h-12 text-muted-foreground" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <CardContent className="p-4 absolute bottom-0 left-0 right-0 text-left">
        <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors truncate">
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
      const allStories = await getAllStories();
      const publicStories = allStories.filter(story => story.isPublic);
      setPublicTemplates(publicStories);
    } catch (error) {
      console.error('Failed to load public templates:', error);
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

  // Get unique categories that have templates
  const availableCategories = ['All', ...new Set(publicTemplates.map(t => t.category).filter(Boolean))];

  const handleSelectTemplate = (template: FilmProject) => {
    router.push(`/dashboard/stories/${template.id}`);
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
            <h1 className="text-sm font-bold">Templates</h1>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((category) => (
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
