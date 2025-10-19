
import React from 'react';
import { ArrowLeft, Share2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface StoryHeaderProps {
    title: string;
    onTitleChange: (title: string) => void;
    onTitleBlur: () => void;
    onBackToDashboard: () => void;
    onShareClick: () => void;
    onSettingsClick: () => void;
}

export const StoryHeader: React.FC<StoryHeaderProps> = ({
    title,
    onTitleChange,
    onTitleBlur,
    onBackToDashboard,
    onShareClick,
    onSettingsClick
}) => {
    return (
        <header className="flex-shrink-0 flex items-center justify-between p-2 sm:p-4 border-b border-border bg-card">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <Button variant="ghost" size="icon" onClick={onBackToDashboard} className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <Input
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    onBlur={onTitleBlur}
                    className="text-sm sm:text-base font-bold bg-transparent border-none focus:ring-0 focus:ring-transparent px-2 h-auto flex-1 min-w-0"
                />
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <Button variant="outline" size="icon" onClick={onShareClick} className="h-8 w-8 sm:h-10 sm:w-10">
                    <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={onSettingsClick} className="h-8 w-8 sm:h-10 sm:w-10">
                    <Settings className="w-4 h-4" />
                </Button>
            </div>
        </header>
    );
};
