import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { FilmProject } from '@/types/storytypes';
import { ArrowLeft, Share2, User, Settings, Sun, Moon, LogOut, FileText, Camera, GripVertical, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { StoryboardEditor } from './StoryboardEditor';
import { AssetManager } from './AssetManager';
import { ProjectSettings } from './ProjectSettings';
import { analyzeScript } from '@/services/filmService';
import { VideoStudio } from './VideoStudio';
import { StitchEditor } from './StitchEditor';
import { Modal } from './Modal';
import { ChatInterface } from './ChatInterface';

interface FilmEditorProps {
    project: FilmProject;
    onUpdateProject: (updatedProject: FilmProject) => void;
    onBackToDashboard: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

type ActiveTab = 'script' | 'storyboard' | 'assets' | 'video' | 'stitch';

const ShareProjectContent: React.FC<{project: FilmProject}> = ({ project }) => {
    const [shareLink, setShareLink] = useState('Generating link...');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        try {
            const projectToShare = JSON.parse(JSON.stringify(project));
            // Strip large data fields to keep the URL manageable.
            // The recipient will need to regenerate images and videos.
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
        <div className="p-6">
            <p className="text-sm text-muted-foreground mb-4">
                Share this link to send a copy of your project's script and assets. The recipient will need to regenerate images and videos.
            </p>
            <div className="flex items-center gap-2">
                <input 
                    type="text" 
                    readOnly 
                    value={shareLink} 
                    className="w-full p-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                />
                <button 
                    onClick={handleCopy}
                    className="px-4 py-2 font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors w-24 flex-shrink-0"
                >
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
        </div>
    );
};


const ProfileDropdown: React.FC<{
    onOpenSettings: () => void;
    onToggleTheme: () => void;
    theme: 'light' | 'dark';
}> = ({ onOpenSettings, onToggleTheme, theme }) => {

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full">
                    <User className="w-6 h-6" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={onOpenSettings}>
                    <Settings className="w-4 h-4 mr-2" />
                    Project Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleTheme}>
                    {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                    Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => alert('Logout is not yet implemented.')} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const FilmEditor: React.FC<FilmEditorProps> = ({ project, onUpdateProject, onBackToDashboard, theme, onToggleTheme }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('script');
    const [title, setTitle] = useState(project.title);
    const [script, setScript] = useState(project.script);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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
        {label}
      </Button>
    );

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'script':
                return (
                    <div className="h-full flex flex-col bg-card rounded-2xl shadow-inner">
                        <div className="flex-grow p-4 md:p-6 min-h-0">
                            <Textarea
                                value={script}
                                onChange={handleScriptChange}
                                onBlur={handleScriptBlur}
                                placeholder="INT. COFFEE SHOP - DAY..."
                                className="w-full h-full p-2 font-mono text-sm bg-transparent resize-none border-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <ChatInterface project={project} onUpdateProject={onUpdateProject} />
                    </div>
                );
            case 'storyboard':
                return <StoryboardEditor project={project} onUpdateProject={onUpdateProject} />;
            case 'assets':
                return <AssetManager project={project} onUpdateProject={onUpdateProject} />;
            case 'video':
                return <VideoStudio project={project} onUpdateProject={onUpdateProject} />;
             case 'stitch':
                return <StitchEditor project={project} onUpdateProject={onUpdateProject} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBackToDashboard}>
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleTitleBlur}
                        className="text-2xl font-bold bg-transparent border-none focus:ring-2 focus:ring-primary px-2 h-auto"
                    />
                </div>
                <div className="flex items-center gap-2">
                     <Button variant="outline" onClick={() => setIsShareModalOpen(true)} className="gap-2">
                        <Share2 className="w-5 h-5" />
                        Share
                    </Button>
                    <ProfileDropdown
                        onOpenSettings={() => setIsSettingsModalOpen(true)}
                        onToggleTheme={onToggleTheme}
                        theme={theme}
                    />
                </div>
            </header>
            
            {isAnalyzing && <div className="bg-primary/20 text-primary p-3 text-center text-sm flex items-center justify-center gap-2"> <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> Analyzing script...</div>}
            {analysisError && <div className="bg-destructive/20 text-destructive p-3 text-center text-sm">{analysisError}</div>}

            <div className="flex-grow flex p-4 gap-4 overflow-hidden">
                <nav className="flex flex-col gap-2 p-2 bg-card rounded-2xl shadow-sm w-48 flex-shrink-0">
                    <TabButton tabName="script" label="Script" icon={<FileText className="w-5 h-5" />} />
                    <TabButton tabName="storyboard" label="Storyboard" icon={<Camera className="w-5 h-5" />} />
                    <TabButton tabName="assets" label="Assets" icon={<User className="w-5 h-5" />} />
                    <TabButton tabName="video" label="Video" icon={<Film className="w-5 h-5" />} />
                    <TabButton tabName="stitch" label="Stitch" icon={<GripVertical className="w-5 h-5" />} />
                </nav>
                <main className="flex-grow h-full overflow-y-auto">
                    {renderActiveTab()}
                </main>
            </div>
            
            <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Project Settings">
                <ProjectSettings settings={project.settings} onUpdate={(newSettings) => onUpdateProject({...project, settings: newSettings})} />
            </Modal>
            <Modal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} title="Share Project">
               <ShareProjectContent project={project} />
            </Modal>
        </div>
    );
};