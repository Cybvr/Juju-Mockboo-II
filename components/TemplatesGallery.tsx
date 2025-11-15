
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, Grid, List } from 'lucide-react';
import { TemplateCard } from './TemplateCard';
import { templateService } from '@/services/templateService';
import { Template } from '@/types/firebase';

interface TemplatesGalleryProps {
  onTemplateSelect?: (templateId: string) => void;
  showSearch?: boolean;
  showCategories?: boolean;
  showStats?: boolean;
}

// Mock categories data
const categories = [
  'All',
  'Business Cards',
  'Brochures',
  'Flyers',
  'Social Media',
  'Presentations',
  'Logos',
  'Banners',
  'Posters',
  'Invitations'
];

export function TemplatesGallery({
  onTemplateSelect,
  showSearch = true,
  showCategories = true,
  showStats = true
}: TemplatesGalleryProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        // Add check to prevent build errors
        if (typeof window === 'undefined') {
          setTemplates([]);
          return;
        }
        const templateData = await templateService.getTemplates();
        setTemplates(templateData || []);
      } catch (error) {
        console.error('Failed to load templates:', error);
        // Set empty array as fallback to prevent build failures
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const getCategories = () => {
    // Add error handling to prevent build failures
    try {
      return categories || [];
    } catch (error) {
      console.warn('Failed to get categories:', error);
      return ['All'];
    }
  };

  const filteredTemplates = (templates || []).filter(template => {
    try {
      const matchesSearch = template.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (template.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    } catch (error) {
      console.warn('Error filtering template:', error);
      return false;
    }
  });

  const handleTemplateSelect = (templateId: string) => {
    if (onTemplateSelect) {
      onTemplateSelect(templateId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      {showSearch && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Categories */}
      {showCategories && (
        <div className="flex flex-wrap gap-2">
          {(getCategories() || []).map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      )}

      {/* Stats */}
      {showStats && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{filteredTemplates.length} templates found</span>
          {selectedCategory !== 'All' && (
            <span>in {selectedCategory}</span>
          )}
        </div>
      )}

      {/* Templates Grid */}
      <div className={`grid gap-4 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUseTemplate={() => handleTemplateSelect(template.id)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No templates found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
