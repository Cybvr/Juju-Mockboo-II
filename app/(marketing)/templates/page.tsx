
'use client';
import React, { useState, useEffect } from 'react';
import type { FilmProject } from '@/types/storytypes';
import { templates } from '@/data/filmTemplates';
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
        {/* Video element with fallback to image */}
        {template.storyboard?.[0]?.videoUrl && (
          <video
            src={template.storyboard[0].videoUrl}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            autoPlay
            muted
            loop
            playsInline
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <div className="absolute top-2 right-2">
          <Globe className="w-4 h-4 text-green-500 bg-white rounded-full p-0.5" />
        </div>
      </div>
      <CardContent className="p-4 flex-1">
        <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate text-left bg-transparent">
          {template.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {template.prompt}
        </p>
        {template.category && (
          <Badge variant="outline" className="mt-2 text-xs">
            {template.category}
          </Badge>
        )}
        <div className="mt-3 text-xs text-muted-foreground">
          {template.storyboard?.length || 0} scenes
        </div>
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
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    setLoading(true);
    try {
      // Convert templates to FilmProject format
      const filmTemplates: FilmProject[] = templates.map(template => ({
        id: template.id,
        title: template.title,
        prompt: template.prompt,
        category: template.category,
        storyboard: template.storyboard,
        characters: template.characters,
        locations: template.locations,
        sound_design: template.sound_design,
        settings: template.settings,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        isTemplate: template.isTemplate,
        isPublic: true,
        script: template.script || ''
      }));
      setPublicTemplates(filmTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
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
            <h1 className="text-3xl font-bold">Templates</h1>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
