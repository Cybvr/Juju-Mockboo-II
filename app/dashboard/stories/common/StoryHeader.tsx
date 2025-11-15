
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Settings, Copy, Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FilmProject } from '@/types/storytypes';
import { ProjectSettings } from './ProjectSettings';

interface StoryHeaderProps {
    title: string;
    onTitleChange: (title: string) => void;
    onTitleBlur: () => void;
    onBackToDashboard: () => void;
    onShareClick: () => void;
    onSettingsClick: () => void;
    project: FilmProject;
    onTogglePublic: () => void;
    onUpdateProject?: (project: FilmProject) => void;
}

export const StoryHeader: React.FC<StoryHeaderProps> = ({
    title,
    onTitleChange,
    onTitleBlur,
    onBackToDashboard,
    onShareClick,
    onSettingsClick,
    project,
    onTogglePublic,
    onUpdateProject
}) => {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [shareLink, setShareLink] = useState('Generating link...');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isShareModalOpen && project) {
            try {
                const projectToShare = JSON.parse(JSON.stringify(project));
                projectToShare.storyboard.forEach((scene: any) => {
                    scene.imageUrl = null;
                    scene.videoUrl = null;
                    scene.generating = false;
                    scene.videoGenerating = false;
                });
                projectToShare.characters.forEach((c: any) => {
                    c.imageUrl = null;
                    c.generatingImage = false;
                });
                projectToShare.locations.forEach((l: any) => {
                    l.imageUrl = null;
                    l.generatingImage = false;
                });
                const jsonString = JSON.stringify(projectToShare);
                const encoded = btoa(unescape(encodeURIComponent(jsonString)));
                const url = `${window.location.origin}${window.location.pathname}#project=${encoded}`;
                setShareLink(url);
            } catch (e) {
                console.error("Failed to generate share link", e);
                setShareLink('Could not generate share link.');
            }
        }
    }, [isShareModalOpen, project]);

    const handleShareClick = () => {
        setIsShareModalOpen(true);
        if (onShareClick) onShareClick();
    };

    const handleSettingsClick = () => {
        setIsSettingsModalOpen(true);
        if (onSettingsClick) onSettingsClick();
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(shareLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleAccessLevelChange = async (accessLevel: 'private' | 'public') => {
        if (project) {
            const shouldBePublic = accessLevel === 'public';
            if (project.isPublic !== shouldBePublic) {
                await onTogglePublic();
            }
        }
    };

    return (
        <>
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
                    <Button variant="outline" size="icon" onClick={handleShareClick} className="h-8 w-8 sm:h-10 sm:w-10">
                        <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleSettingsClick} className="h-8 w-8 sm:h-10 sm:w-10">
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>
            </header>

            {/* Share Modal */}
            <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Share Story</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {/* Access Level Controls */}
                        <div className="space-y-3">
                            <div className="text-sm font-medium">Who can access this story?</div>
                            <div className="space-y-2">
                                <Button
                                    variant={!project?.isPublic ? 'default' : 'outline'}
                                    className="w-full justify-start"
                                    onClick={() => handleAccessLevelChange('private')}
                                >
                                    <Lock className="w-4 h-4 mr-3" />
                                    Private - Only you can view
                                </Button>
                                <Button
                                    variant={project?.isPublic ? 'default' : 'outline'}
                                    className="w-full justify-start"
                                    onClick={() => handleAccessLevelChange('public')}
                                >
                                    <Globe className="w-4 h-4 mr-3" />
                                    Public - Anyone with the link can view
                                </Button>
                            </div>
                        </div>

                        {/* Share Link */}
                        {project?.isPublic && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Share Link</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={shareLink}
                                        readOnly
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={handleCopy}
                                        size="icon"
                                        variant="outline"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                {copied && (
                                    <div className="text-xs text-green-600">Link copied to clipboard!</div>
                                )}
                            </div>
                        )}

                        {!project?.isPublic && (
                            <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                                Story is private. Switch to public to share with others.
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Settings Modal */}
            {isSettingsModalOpen && onUpdateProject && (
                <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                        <DialogHeader>
                            <DialogTitle>Project Settings</DialogTitle>
                        </DialogHeader>
                        <div className="overflow-y-auto max-h-[60vh] pr-2">
                            <ProjectSettings
                                settings={project.settings}
                                onUpdate={(newSettings) => onUpdateProject({ ...project, settings: newSettings })}
                                project={project}
                                onUpdateProject={onUpdateProject}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};
