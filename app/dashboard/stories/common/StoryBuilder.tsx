import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { FilmProject } from '@/types/storytypes';
import { ArrowLeft, Share2, FileText, Camera, GripVertical, Film, User, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ProfileDropdown } from '@/app/common/dashboard/ProfileDropdown';
import { Scenes } from './Scenes';
import { AssetManager } from './AssetManager';
import { ProjectSettings } from './ProjectSettings';
import { analyzeScript } from '@/services/filmService';
import { VideoStudio } from './VideoStudio';
import { StitchEditor } from './StitchEditor';
import { Modal } from './Modal';
import { ChatInterface } from './ChatInterface';

interface StoryBuilderProps {
    project: FilmProject;
    onUpdateProject: (updatedProject: FilmProject) => void;
    onBackToDashboard: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

type ActiveTab = 'script' | 'storyboard' | 'assets' | 'video' | 'stitch' | 'settings';

const ShareProjectContent: React.FC<{project: FilmProject}> = ({ project }) => {
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

export const StoryBuilder: React.FC<StoryBuilderProps> = ({ project, onUpdateProject, onBackToDashboard, theme, onToggleTheme }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('script');
    const [title, setTitle] = useState(project.title);
    const [script, setScript] = useState(project.script);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {
        setTitle(project.title);
        setScript(project.script);
    }, [project.title, project.script]);

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
    }

    const handleTabChange = async (newTab: ActiveTab) => {
        setMobileNavOpen(false);

        if (activeTab === 'script' && script !== project.script && script.trim()) {
            setIsAnalyzing(true);
            setAnalysisError(null);
            try {
                const projectWithUpdatedScript = { ...project, script };
                onUpdateProject(projectWithUpdatedScript);

                const analysis = await analyzeScript(script);
                const updatedProject: FilmProject = {
                    ...projectWithUpdatedScript,
                    storyboard: analysis.storyboard.map(s => ({ ...s, id: `scene_${Date.now()}_${s.scene_number}`, imageUrl: null, generating: false, videoUrl: null, videoGenerating: false, characterId: null, locationId: null, soundId: null })),
                    characters: analysis.characters.map((c, i) => ({ ...c, id: `char_${Date.now()}_${i}`, imageUrl: null, generatingImage: false })),
                    locations: analysis.locations.map((l, i) => ({ ...l, id: `loc_${Date.now()}_${i}`, imageUrl: null, generatingImage: false })),
                    sound_design: analysis.sound_design.map((s, i) => ({ ...s, id: `sound_${Date.now()}_${i}` })),
                };
                onUpdateProject(updatedProject);
                setActiveTab(newTab);
            } catch (err: any) {
                setAnalysisError(err.message || 'An unknown error occurred during analysis.');
                setActiveTab(newTab);
            } finally {
                setIsAnalyzing(false);
            }
        } else {
            setActiveTab(newTab);
        }
    };

    const TabButton: React.FC<{ tabName: ActiveTab; label: string; icon: React.ReactNode }> = ({ tabName, label, icon }) => (
      <Button
        variant={activeTab === tabName ? "default" : "ghost"}
        onClick={() => handleTabChange(tabName)}
        className="w-full justify-start gap-2"
      >
        {icon}
        <span className="lg:inline">{label}</span>
      </Button>
    );

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'script':
                return (
                    <div className="h-full flex flex-col  rounded-lg sm:rounded-2xl shadow-inner">
                        <div className="flex-grow p-3 sm:p-4 md:p-6 min-h-0">
                            <Textarea
                                value={script}
                                onChange={handleScriptChange}
                                onBlur={handleScriptBlur}
                                placeholder="INT. COFFEE SHOP - DAY..."
                                className="w-full h-full p-2 font-mono text-xs sm:text-sm bg-transparent resize-none border-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <ChatInterface project={project} onUpdateProject={onUpdateProject} />
                    </div>
                );
            case 'storyboard':
                return <Scenes project={project} onUpdateProject={onUpdateProject} />;
            case 'assets':
                return <AssetManager project={project} onUpdateProject={onUpdateProject} />;
            case 'video':
                return <VideoStudio project={project} onUpdateProject={onUpdateProject} />;
             case 'stitch':
                return <StitchEditor project={project} onUpdateProject={onUpdateProject} />;
            case 'settings':
                return <ProjectSettings settings={project.settings} onUpdate={(newSettings) => onUpdateProject({...project, settings: newSettings})} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-screen text-foreground">
            <header className="flex-shrink-0 flex items-center justify-between p-1 border-b border-border">
                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <Button variant="ghost" size="icon" onClick={onBackToDashboard} className="flex-shrink-0">
                        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleTitleBlur}
                        className="text-sm font-bold bg-transparent border-none focus:ring-0 focus:ring-transparent px-2 h-auto flex-1 w-fit"
                    />
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setMobileNavOpen(!mobileNavOpen)}
                        className="lg:hidden"
                    >
                        {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                    <Button variant="outline" onClick={() => setIsShareModalOpen(true)} className="gap-2 hidden sm:flex">
                        <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Share</span>
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setIsShareModalOpen(true)} className="sm:hidden">
                        <Share2 className="w-4 h-4" />
                    </Button>
                    <ProfileDropdown />
                </div>
            </header>

            {isAnalyzing && (
                <div className="bg-primary/20 text-primary p-2 sm:p-3 text-center text-xs sm:text-sm flex items-center justify-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Analyzing script...
                </div>
            )}
            {analysisError && (
                <div className="bg-destructive/20 text-destructive p-2 sm:p-3 text-center text-xs sm:text-sm">{analysisError}</div>
            )}

            <div className="flex-grow flex p-2 sm:p-4 gap-2 sm:gap-4 overflow-hidden relative">
                {/* Mobile Nav Overlay */}
                {mobileNavOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setMobileNavOpen(false)}
                    />
                )}

                {/* Navigation */}
                <nav className={`
                    flex flex-col gap-2 p-2   rounded-lg sm:rounded-2xl shadow-sm 
                    lg:relative lg:translate-x-0 lg:w-48 lg:flex-shrink-0
                    fixed top-0 left-0 bottom-0 w-64 z-50 transition-transform duration-300
                    ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:block
                `}>
                    <div className="flex justify-between items-center lg:hidden mb-2 p-2 ">
                        <span className="font-semibold">Menu</span>
                        <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(false)}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                    <TabButton tabName="script" label="Script" icon={<FileText className="w-4 h-4 sm:w-5 sm:h-5" />} />
                    <TabButton tabName="storyboard" label="Scenes" icon={<Camera className="w-4 h-4 sm:w-5 sm:h-5" />} />
                    <TabButton tabName="assets" label="Assets" icon={<User className="w-4 h-4 sm:w-5 sm:h-5" />} />
                    <TabButton tabName="video" label="Video" icon={<Film className="w-4 h-4 sm:w-5 sm:h-5" />} />
                    <TabButton tabName="stitch" label="Stitch" icon={<GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />} />
                    <TabButton tabName="settings" label="Settings" icon={<Settings className="w-4 h-4 sm:w-5 sm:h-5" />} />
                </nav>

                <main className="flex-grow h-full overflow-y-auto min-w-0">
                    {renderActiveTab()}
                </main>
            </div>

            <Modal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} title="Share Project">
               <ShareProjectContent project={project} />
            </Modal>
        </div>
    );
};