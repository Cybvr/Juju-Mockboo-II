import React, { useState, useEffect } from 'react';
import type { Template } from '@/types/storytypes';
import { FileText, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { getAllStories, duplicateStory, createStory } from '@/services/storiesService';
import { useRouter } from 'next/navigation';

interface TemplateBrowserProps {
    templates: Template[];
    onClose: () => void;
    showPublicTab?: boolean;
}

const TemplateCard: React.FC<{ template: Template; onSelect: () => void }> = ({ template, onSelect }) => {
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
                {template.isPublic && (
                    <div className="absolute top-2 right-2">
                        <Globe className="w-4 h-4 text-green-500 bg-white rounded-full p-0.5" />
                    </div>
                )}
            </div>
            <CardContent className="p-4">
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate">
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
            </CardContent>
        </Card>
    );
};

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

export const TemplateBrowser: React.FC<TemplateBrowserProps> = ({ templates, onClose, showPublicTab = false }) => {
    const [publicDocs, setPublicDocs] = useState<Template[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const router = useRouter();

    const handleTemplateSelect = async (template: Template) => {
        try {
            let newStoryId: string;

            // Check if this is a Firebase template by trying to get it first
            if (template.id) {
                try {
                    const { getStoryById } = await import('@/services/storiesService');
                    const existingStory = await getStoryById(template.id);
                    if (existingStory) {
                        // Template exists in Firebase - duplicate it
                        newStoryId = await duplicateStory(template.id);
                    } else {
                        throw new Error('Template not found in Firebase');
                    }
                } catch (error) {
                    // Template doesn't exist in Firebase, treat as local template
                    const { id, createdAt, updatedAt, ...templateData } = template as any;
                    newStoryId = await createStory({
                        ...templateData,
                        title: `${template.title} (Copy)`,
                        isTemplate: false,
                    });
                }
            } else {
                // Template is a local object - create new story from it
                const { id, createdAt, updatedAt, ...templateData } = template as any;
                newStoryId = await createStory({
                    ...templateData,
                    title: `${template.title} (Copy)`,
                    isTemplate: false,
                });
            }

            console.log('Template browser - Created story ID:', newStoryId);
            onClose();
            router.push(`/dashboard/stories/${newStoryId}`);
        } catch (error) {
            console.error('Failed to create copy of template:', error);
        }
    };

    useEffect(() => {
        if (showPublicTab) {
            loadPublicDocs();
        }
    }, [showPublicTab]);

    const loadPublicDocs = async () => {
        setLoading(true);
        try {
            const allStories = await getAllStories();
            const publicStories = allStories.filter(story => story.isPublic);
            setPublicDocs(publicStories);
        } catch (error) {
            console.error('Failed to load public docs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterItemsByCategory = (items: Template[]) => {
        if (selectedCategory === 'All') return items;
        return items.filter(item => item.category === selectedCategory);
    };

    const renderTemplateGrid = (items: Template[], isLoading = false) => {
        const filteredItems = filterItemsByCategory(items);

        return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto p-1">
            {isLoading ? (
                <div className="col-span-full flex items-center justify-center py-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Loading...</p>
                    </div>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="col-span-full flex items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground">
                        {selectedCategory === 'All' ? 'No items available' : `No items in ${selectedCategory} category`}
                    </p>
                </div>
            ) : (
                filteredItems.map((item) => (
                    <TemplateCard key={item.id} template={item} onSelect={() => handleTemplateSelect(item)} />
                ))
            )}
            </div>
        </div>
        );
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Choose a Template</DialogTitle>
                </DialogHeader>

                {showPublicTab ? (
                    <Tabs defaultValue="templates" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="templates">Templates</TabsTrigger>
                            <TabsTrigger value="public">Public Docs</TabsTrigger>
                        </TabsList>

                        <TabsContent value="templates" className="mt-4">
                            {renderTemplateGrid(templates)}
                        </TabsContent>

                        <TabsContent value="public" className="mt-4">
                            {renderTemplateGrid(publicDocs, loading)}
                        </TabsContent>
                    </Tabs>
                ) : (
                    renderTemplateGrid(templates)
                )}
            </DialogContent>
        </Dialog>
    );
};