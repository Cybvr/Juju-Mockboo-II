
import React from 'react';
import type { Template } from '@/types/storytypes';
import { FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TemplateBrowserProps {
  templates: Template[];
  onSelect: (template: Template) => void;
  onClose: () => void;
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

export const TemplateBrowser: React.FC<TemplateBrowserProps> = ({ templates, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-4xl h-[90vh] flex flex-col">
            <CardHeader className="p-4 border-b flex flex-row justify-between items-center">
                <h2 className="text-xl font-bold">Choose a Template</h2>
                <Button onClick={onClose} variant="ghost" size="icon">
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="p-6 overflow-y-auto flex-grow">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map(template => (
                        <TemplateCard key={template.id} template={template} onSelect={() => onSelect(template)} />
                    ))}
                </div>
            </CardContent>
        </Card>
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        `}</style>
    </div>
  );
};
