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





export const StoryBuilder: React.FC<StoryBuilderProps> = ({ project, onUpdateProject, onBackToDashboard, theme, onToggleTheme, isAdmin, onTogglePublic }) => {
    const [title, setTitle] = useState(project.title);
    const [script, setScript] = useState(project.script);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
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
            <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Project Settings">
                <ProjectSettings
                    settings={project.settings}
                    onUpdate={(newSettings) => onUpdateProject({ ...project, settings: newSettings })}
                />
            </Modal>
        </div>
    );
};