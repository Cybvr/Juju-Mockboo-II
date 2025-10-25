import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { FilmProject, StoryboardScene } from '@/types/storytypes';
import { ChevronsLeft, Share2, FileText, Camera, GripVertical, User, Settings, Menu, ChevronsRight, Plus, Trash2, ArrowUp, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AssetManager } from './AssetManager';
import { ProjectSettings } from './ProjectSettings';
import { StitchEditor } from './StitchEditor';
import { Modal } from './Modal';
import { StoryHeader } from './StoryHeader';
import { ScriptPanel } from './ScriptPanel';
import { CommentsInterface } from './CommentsInterface';
import { Scenes } from './Scenes';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface StoryBuilderProps {
    project: FilmProject;
    onUpdateProject: (updatedProject: FilmProject) => void;
    onBackToDashboard: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    isAdmin?: boolean;
    onTogglePublic?: () => void;
}

const ShareModal: React.FC<{
    shareLink: string;
    project: any;
    onClose: () => void;
    onTogglePublic?: () => void;
}> = ({ shareLink, project, onClose, onTogglePublic }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAccessLevelChange = (accessLevel: 'private' | 'public') => {
        if (onTogglePublic && project.isPublic !== (accessLevel === 'public')) {
            onTogglePublic();
        }
    };

    return (
        <div className="p-4 sm:p-6 space-y-4">
            {/* Access Level Controls */}
            <div className="space-y-3">
                <div className="text-sm font-medium">Who can access this story?</div>
                <div className="space-y-2">
                    <button
                        onClick={() => handleAccessLevelChange('private')}
                        className={`w-full p-3 text-left rounded-lg border transition-colors flex items-center gap-3 ${
                            !project.isPublic
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border hover:bg-muted/50'
                        }`}
                    >
                        <div className="w-4 h-4 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-medium">Private</div>
                            <div className="text-xs text-muted-foreground">Only you can view this story</div>
                        </div>
                    </button>
                    <button
                        onClick={() => handleAccessLevelChange('public')}
                        className={`w-full p-3 text-left rounded-lg border transition-colors flex items-center gap-3 ${
                            project.isPublic
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border hover:bg-muted/50'
                        }`}
                    >
                        <div className="w-4 h-4 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-medium">Public</div>
                            <div className="text-xs text-muted-foreground">Anyone with the link can view this story</div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Share Link Section */}
            {project.isPublic && (
                <div className="space-y-2">
                    <div className="text-sm font-medium">Share Link</div>
                    <p className="text-sm text-muted-foreground">
                        Share this link to send a copy of your project's script and assets. The recipient will need to regenerate images and videos.
                    </p>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                            type="text"
                            readOnly
                            value={shareLink}
                            className="w-full p-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                        />
                        <button
                            onClick={handleCopy}
                            className="px-4 py-2 font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors sm:w-24 flex-shrink-0"
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>
            )}

            {!project.isPublic && (
                <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                    Story is private. Switch to public to share with others.
                </div>
            )}
        </div>
    );
};

const ShareProjectContent: React.FC<{ project: FilmProject }> = ({ project }) => {
    const [shareLink, setShareLink] = useState('Generating link...');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
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
            const encoded = btoa(jsonString);
            const url = `${window.location.origin}${window.location.pathname}#project=${encoded}`;
            setShareLink(url);
        } catch (e) {
            console.error("Failed to generate share link", e);
            setShareLink('Could not generate share link.');
        }
    }, [project]);

    const handleCopy = () => {
        navigator.clipboard.writeText(shareLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="p-4 sm:p-6">
            <p className="text-sm text-muted-foreground mb-4">
                Share this link to send a copy of your project's script and assets. The recipient will need to regenerate images and videos.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                    type="text"
                    readOnly
                    value={shareLink}
                    className="w-full p-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                />
                <button
                    onClick={handleCopy}
                    className="px-4 py-2 font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors sm:w-24 flex-shrink-0"
                >
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
        </div>
    );
};



export const StoryBuilder: React.FC<StoryBuilderProps> = ({ project, onUpdateProject, onBackToDashboard, theme, onToggleTheme, isAdmin, onTogglePublic }) => {
    const [title, setTitle] = useState(project.title);
    const [script, setScript] = useState(project.script);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [expandedScenes, setExpandedScenes] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'scenes' | 'assets'>('scenes');
    const [rightPanelTab, setRightPanelTab] = useState<'script' | 'comments'>('script');
    const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);

    useEffect(() => {
        setTitle(project.title);
        setScript(project.script);
    }, [project.title, project.script]);

    useEffect(() => {
        const hasStuckGenerating = project.storyboard.some(s => s.generating);
        if (hasStuckGenerating) {
            const cleanedStoryboard = project.storyboard.map(s => ({
                ...s,
                generating: false,
                videoGenerating: false
            }));
            onUpdateProject({ ...project, storyboard: cleanedStoryboard });
        }
    }, []);

    useEffect(() => {
        setExpandedScenes(project.storyboard.map(s => s.id));
    }, [project.storyboard.length]);

    const handleTitleBlur = () => {
        if (title.trim() && title !== project.title) {
            onUpdateProject({ ...project, title: title.trim() });
        }
    };

    const handleScriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setScript(e.target.value);
    };

    const handleScriptBlur = () => {
        if (script !== project.script) {
            onUpdateProject({ ...project, script });
        }
    };

    const handleUpdateScene = (updatedScene: StoryboardScene) => {
        const newStoryboard = project.storyboard.map((s) => (s.id === updatedScene.id ? updatedScene : s));
        onUpdateProject({ ...project, storyboard: newStoryboard });
    };

    const handleDeleteScene = (sceneId: string) => {
        const newStoryboard = project.storyboard
            .filter((s) => s.id !== sceneId)
            .map((s, index) => ({ ...s, scene_number: index + 1 }));
        onUpdateProject({ ...project, storyboard: newStoryboard });
    };

    const handleAddScene = () => {
        const newSceneNumber =
            project.storyboard.length > 0 ? Math.max(...project.storyboard.map((s) => s.scene_number)) + 1 : 1;
        const newScene: StoryboardScene = {
            id: `scene_${Date.now()}`,
            scene_number: newSceneNumber,
            prompt: "",
            imageUrl: null,
            generating: false,
            videoUrl: null,
            videoGenerating: false,
            characterId: null,
            locationId: null,
            soundId: null,
        };
        onUpdateProject({ ...project, storyboard: [...project.storyboard, newScene] });
    };

    const toggleRightPanel = () => {
        setIsRightPanelCollapsed(!isRightPanelCollapsed);
    };

    return (
        <div className="flex flex-col h-screen text-foreground ">
            {isAnalyzing && (
                <div className="bg-primary/20 text-primary p-2 sm:p-3 text-center text-xs sm:text-sm flex items-center justify-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Analyzing script...
                </div>
            )}
            {analysisError && (
                <div className="bg-destructive/20 text-destructive p-2 sm:p-3 text-center text-xs sm:text-sm">{analysisError}</div>
            )}
            <div className="lg:overflow-hidden overflow-auto-y">
                {/* Main Content Area */}
                <div className="flex flex-col lg:flex-row lg:h-full w-full ">
                    {/* Left section - storyboard/assets */}
                    <div className={`w-full ${isRightPanelCollapsed ? 'lg:w-full' : 'lg:w-2/3'} lg:h-full lg:overflow-y-auto overflow-none lg:flex-shrink-0 relative px-2 py-2 lg:px-12 lg:py-4 justify-center space-y-2 `}>
                        {/* Floating toggle button for collapsed state */}
                        {isRightPanelCollapsed && (
                            <Button
                                variant="default"
                                size="icon"
                                onClick={toggleRightPanel}
                                className="fixed right-4 top-20 z-20 shadow-lg lg:flex hidden"
                            >
                                <ChevronsLeft className="w-4 h-4" />
                            </Button>
                        )}
                        <StitchEditor project={project} onUpdateProject={onUpdateProject} />
                         {/* Emoji list */}
                        <div className="flex items-center justify-center gap-2 sm:gap-4 bg-card backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-lg w-fit mx-auto">
                            <button className="text-xl sm:text-2xl hover:scale-110 transition-transform">😂</button>
                            <button className="text-xl sm:text-2xl hover:scale-110 transition-transform">😍</button>
                            <button className="text-xl sm:text-2xl hover:scale-110 transition-transform">😱</button>
                            <button className="text-xl sm:text-2xl hover:scale-110 transition-transform">🙌</button>
                            <button className="text-xl sm:text-2xl hover:scale-110 transition-transform">👍</button>
                            <button className="text-xl sm:text-2xl hover:scale-110 transition-transform">👎</button>
                            <button className="text-xl sm:text-2xl hover:scale-110 transition-transform">😊</button>
                        </div>
                        <div className="flex justify-between items-center border-b border-border">
                            <div className="flex">
                                <button
                                    onClick={() => setActiveTab('scenes')}
                                    className={`px-3 sm:px-4 py-2 text-sm sm:text-base ${activeTab === 'scenes' ? 'border-b-2 border-primary font-semibold' : ''}`}
                                >
                                    Scenes
                                </button>
                                <button
                                    onClick={() => setActiveTab('assets')}
                                    className={`px-3 sm:px-4 py-2 text-sm sm:text-base ${activeTab === 'assets' ? 'border-b-2 border-primary font-semibold' : ''}`}
                                >
                                    Assets
                                </button>
                            </div>
                        </div>
                        {activeTab === 'scenes' ? (
                            <Scenes
                                project={project}
                                onUpdateScene={handleUpdateScene}
                                onDeleteScene={handleDeleteScene}
                                onAddScene={handleAddScene}
                                expandedScenes={expandedScenes}
                                onExpandedScenesChange={setExpandedScenes}
                            />
                        ) : (
                            <AssetManager project={project} onUpdateProject={onUpdateProject} />
                        )}
                    </div>

                    {/* Right Panel section - stacked below on mobile */}
                    {!isRightPanelCollapsed && (
                        <div className="w-full lg:w-1/3 lg:h-full flex-shrink-0 flex flex-col relative bg-card">
                            {/* Close button in top-right corner */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleRightPanel}
                                className="absolute right-2 top-2 z-10 lg:flex hidden"
                            >
                                <ChevronsRight className="w-4 h-4" />
                            </Button>
                            <Tabs value={rightPanelTab} onValueChange={(value) => setRightPanelTab(value as 'script' | 'comments')} className="h-full flex flex-col">
                                <div className="flex-shrink-0 p-3 border-b border-border ">
                                    <TabsList className="grid w-fit grid-cols-2">
                                        <TabsTrigger value="script" className="flex items-center gap-2 text-xs">
                                            <FileText className="w-3 h-3" />
                                            Script
                                        </TabsTrigger>
                                        <TabsTrigger value="comments" className="flex items-center gap-2 text-xs">
                                            <MessageSquare className="w-3 h-3" />
                                            Comments
                                        </TabsTrigger>
                                    </TabsList>
                                </div>
                                <TabsContent value="script" className="flex-1 flex flex-col m-0">
                                    <ScriptPanel
                                        script={script}
                                        onScriptChange={handleScriptChange}
                                        onScriptBlur={handleScriptBlur}
                                        project={project}
                                        onUpdateProject={onUpdateProject}
                                    />
                                </TabsContent>
                                <TabsContent value="comments" className="flex-1 flex flex-col m-0">
                                    <CommentsInterface project={project} onUpdateProject={onUpdateProject} />
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </div>
            </div>
            <Modal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} title="Share Story">
                <ShareModal
                    shareLink={''} // Assuming shareLink will be generated or passed appropriately
                    project={project}
                    onClose={() => setIsShareModalOpen(false)}
                    onTogglePublic={onTogglePublic}
                />
            </Modal>
            <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Project Settings">
                <ProjectSettings
                    settings={project.settings}
                    onUpdate={(newSettings) => onUpdateProject({ ...project, settings: newSettings })}
                />
            </Modal>
        </div>
    );
};