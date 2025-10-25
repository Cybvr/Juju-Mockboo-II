import React, { useState, useEffect } from 'react';
import type { Template } from '@/types/storytypes';
import { FileText, X, Globe, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllStories } from '@/services/storiesService';

interface TemplateBrowserProps {
    templates: Template[];
    onSelect: (template: Template) => void;
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
                    <img src={firstImageUrl} alt="Concept art" className="w-full h-full object-cover" />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <FileText className="w-12 h-12 text-muted-foreground" />
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
            </CardContent>
        </Card>
    );
};

const categories = [
    'All',
    'Commercial',
    'Horror',
    'Sci-Fi',
    'Travel',
    'Cooking',
    'UGC',
    'Tech',
    'Fashion',
    'Food',
    'Pet',
    'App'
];

export const TemplateBrowser: React.FC<TemplateBrowserProps> = ({ templates, onSelect, onClose, showPublicTab = false }) => {
    const [publicDocs, setPublicDocs] = useState<Template[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');

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
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                    {category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                    {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
                </div>
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
                    <Card key={item.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => onSelect(item)}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                <h3 className="font-semibold text-sm">{item.title}</h3>
                                {item.isPublic && <Globe className="w-4 h-4 text-green-500" />}
                            </div>
                        </CardHeader>
                        <CardContent>
                        </CardContent>
                    </Card>
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