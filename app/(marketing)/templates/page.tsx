
'use client';

import React, { useState, useEffect } from 'react';
import type { FilmProject } from '@/types/storytypes';
import { templates } from '@/data/filmTemplates';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Globe, Search, ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';

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
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  const firstImageUrl = template.storyboard?.[0]?.imageUrl;
  
  return (
    <Card className="group cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="relative aspect-video bg-muted overflow-hidden">
        {firstImageUrl ? (
          <img 
            src={firstImageUrl} 
            alt="Template thumbnail" 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
            <FileText className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Globe className="w-4 h-4 text-green-500 bg-white rounded-full p-0.5 shadow-sm" />
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
              <Play className="w-6 h-6 text-gray-800" />
            </div>
          </div>
        </div>
      </div>
      <CardContent className="p-6 flex-1 flex flex-col">
        <h3 className="font-bold text-xl group-hover:text-primary transition-colors mb-2 line-clamp-2">
          {template.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1 mb-4">
          {template.prompt}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {template.category && (
              <Badge variant="outline" className="text-xs">
                {template.category}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {template.storyboard?.length || 0} scenes
            </Badge>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </CardContent>
    </Card>
  );
};

export default function MarketingTemplatesPage() {
  const [publicTemplates, setPublicTemplates] = useState<FilmProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6">
              Story Templates
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Discover professionally crafted video templates created by our community. 
              Get inspired and jumpstart your next project with these proven storytelling frameworks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary text-white hover:bg-primary/90 px-8 py-3 text-lg">
                  Start Creating Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                Browse Gallery
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Search and Filters */}
          <div className="space-y-6 mb-12">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-accent transition-colors px-4 py-2 text-sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              {loading ? 'Loading...' : `${filteredTemplates.length} template${filteredTemplates.length !== 1 ? 's' : ''} available`}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-foreground text-lg">Loading amazing templates...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredTemplates.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center max-w-md">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-2xl font-semibold mb-4">No templates found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || selectedCategory !== 'All' 
                    ? 'Try adjusting your search or filters to find more templates' 
                    : 'Be the first to create and share a public template!'}
                </p>
                <Link href="/dashboard">
                  <Button className="bg-primary text-white">
                    Create Your Own Template
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Templates Grid */}
          {!loading && filteredTemplates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTemplates.map((template) => (
                <Link key={template.id} href={`/dashboard/stories/${template.id}`}>
                  <TemplateCard template={template} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Create Your Own?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of creators building amazing video stories with AI-powered tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg">
                Start Creating Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg">
              View Pricing
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
