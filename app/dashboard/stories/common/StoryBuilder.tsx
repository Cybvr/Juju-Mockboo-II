import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { FilmProject, StoryboardScene } from '@/types/storytypes';
import { ArrowLeft, Share2, FileText, Camera, GripVertical, User, Settings, Menu, X, Plus, Trash2, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ProfileDropdown } from '@/app/common/dashboard/ProfileDropdown';
import { AssetManager } from './AssetManager';
import { ProjectSettings } from './ProjectSettings';
import { analyzeScript } from '@/services/filmService';
import { StitchEditor } from './StitchEditor';
import { Modal } from './Modal';
import { ChatInterface } from './ChatInterface';
import { generateSingleImage } from "@/services/filmService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface StoryBuilderProps {
    project: FilmProject;
    onUpdateProject: (updatedProject: FilmProject) => void;
    onBackToDashboard: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

type ActiveTab = 'script' | 'storyboard' | 'assets';

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

const SceneCard: React.FC<{
    scene: StoryboardScene;
    project: FilmProject;
    onUpdateScene: (updatedScene: StoryboardScene) => void;
    onDeleteScene: (sceneId: string) => void;
}> = ({ scene, project, onUpdateScene, onDeleteScene }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [localPrompt, setLocalPrompt] = useState(scene.prompt || "");
    const [generateOutputs, setGenerateOutputs] = useState(1);

    const adjustHeight = useCallback(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, []);

    useEffect(() => {
        setLocalPrompt(scene.prompt || "");
    }, [scene.prompt]);

    useEffect(() => {
        adjustHeight();
    }, [localPrompt, adjustHeight]);

    const handleGenerateImage = useCallback(async () => {
        console.log(`🎬 SCENE ${scene.scene_number}: Starting image generation...`);
        console.log(`📝 User requested ${generateOutputs} outputs`);
        const character = project.characters.find((c) => c.id === scene.characterId);
        const location = project.locations.find((l) => l.id === scene.locationId);
        let builtPrompt = scene.prompt || "A cinematic scene.";
        if (character) {
            builtPrompt = `${character.name} ${builtPrompt}. Description of ${character.name}: ${character.description}.`;
            console.log(`👤 Added character: ${character.name}`);
        }
        if (location) {
            builtPrompt = `${builtPrompt} The setting is ${location.name}. Description of location: ${location.description}.`;
            console.log(`📍 Added location: ${location.name}`);
        }
        console.log(`🎯 Final prompt: "${builtPrompt}"`);
        console.log(`📐 Aspect ratio: ${project.settings.aspectRatio}`);
        if (character?.imageUrl) {
            console.log("Character image available, but not yet used in generation.", character.imageUrl);
        }
        onUpdateScene({ ...scene, generating: true });
        console.log(`🔄 Set generating state to true for scene ${scene.scene_number}`);
        try {
            const images = [];
            console.log(`📡 Starting ${generateOutputs} API calls...`);
            for (let i = 0; i < generateOutputs; i++) {
                console.log(`📡 API Call ${i + 1}/${generateOutputs} - Sending to generateSingleImage...`);
                const imageUrl = await generateSingleImage(builtPrompt, project.settings.aspectRatio);
                console.log(`✅ API Call ${i + 1} SUCCESS - Got image: ${imageUrl ? imageUrl.substring(0, 50) + '...' : 'null'}`);
                images.push(imageUrl);
                onUpdateScene({
                    ...scene,
                    imageUrl: images[0],
                    generatedImages: [...images],
                    generating: i < generateOutputs - 1
                });
            }
            console.log(`🎉 All ${generateOutputs} images generated successfully!`);
            console.log(`📦 Total images received: ${images.length}`);
            onUpdateScene({
                ...scene,
                imageUrl: images[0],
                generatedImages: images,
                generating: false
            });
            console.log(`✨ Scene ${scene.scene_number} updated with ${images.length} images - COMPLETE!`);
        } catch (error) {
            console.error(`❌ SCENE ${scene.scene_number} - Image generation FAILED:`, error);
            console.error(`💥 Error details:`, error.message || error);
            onUpdateScene({ ...scene, generating: false, imageUrl: "error" });
            console.log(`🔴 Set scene ${scene.scene_number} to error state`);
        }
    }, [scene, project, onUpdateScene, generateOutputs]);

    const handleFieldChange = (field: keyof StoryboardScene, value: string | null) => {
        onUpdateScene({ ...scene, [field]: value });
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLocalPrompt(e.target.value);
        requestAnimationFrame(() => {
            adjustHeight();
        });
    };

    const handleTextareaBlur = () => {
        if (localPrompt !== scene.prompt) {
            handleFieldChange("prompt", localPrompt);
        }
    };

    const handleImageDragStart = (e: React.DragEvent, imageUrl: string) => {
        e.dataTransfer.setData('text/plain', imageUrl);
        e.dataTransfer.setData('application/x-scene-id', scene.id);
    };

    const handleVideoDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const imageUrl = e.dataTransfer.getData('text/plain');
        const draggedSceneId = e.dataTransfer.getData('application/x-scene-id');
        if (imageUrl && draggedSceneId === scene.id) {
            onUpdateScene({ ...scene, videoGenerating: true });
            try {
                const base64Image = imageUrl.includes('base64,')
                    ? imageUrl.split('base64,')[1]
                    : imageUrl;
                const response = await fetch('/api/stories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'generateVideo',
                        prompt: localPrompt || 'A cinematic scene',
                        base64Image: base64Image
                    })
                });
                const data = await response.json();
                if (data.success) {
                    onUpdateScene({ ...scene, videoUrl: data.videoUrl, videoGenerating: false });
                } else {
                    throw new Error(data.error || 'Video generation failed');
                }
            } catch (error) {
                console.error('Video generation failed:', error);
                onUpdateScene({ ...scene, videoGenerating: false });
            }
        }
    };

    const handleVideoDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <AccordionItem value={scene.id} className="mb-4 bg-card rounded-lg border px-4">
            <div className="flex justify-between items-center">
                <AccordionTrigger className="hover:no-underline flex-1 py-4">
                    <Badge variant="outline" className="text-sm font-semibold">
                        Scene {scene.scene_number}
                    </Badge>
                </AccordionTrigger>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeleteScene(scene.id);
                    }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
            <AccordionContent>
                <div className="space-y-4 pb-4">
                    <Textarea
                        ref={textareaRef}
                        value={localPrompt}
                        onChange={handleTextareaChange}
                        onBlur={handleTextareaBlur}
                        placeholder="Action prompt: e.g., 'looks out the window at the rain...'"
                        className="flex-grow resize-none min-h-[60px]"
                        rows={2}
                    />
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col sm:flex-row gap-3 text-left">
                            <Select
                                value={scene.characterId || undefined}
                                onValueChange={(value) => handleFieldChange("characterId", value || null)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Character" />
                                </SelectTrigger>
                                <SelectContent>
                                    {project.characters.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={scene.locationId || undefined}
                                onValueChange={(value) => handleFieldChange("locationId", value || null)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Location" />
                                </SelectTrigger>
                                <SelectContent>
                                    {project.locations.map((l) => (
                                        <SelectItem key={l.id} value={l.id}>
                                            {l.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={scene.soundId || undefined}
                                onValueChange={(value) => handleFieldChange("soundId", value || null)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Sound" />
                                </SelectTrigger>
                                <SelectContent>
                                    {project.sound_design.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.scene_match}: {s.description.substring(0, 20)}...
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Select value={generateOutputs.toString()} onValueChange={(value) => setGenerateOutputs(parseInt(value))}>
                                <SelectTrigger className="w-16 h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1</SelectItem>
                                    <SelectItem value="2">2</SelectItem>
                                    <SelectItem value="3">3</SelectItem>
                                    <SelectItem value="4">4</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleGenerateImage} disabled={!localPrompt.trim() || scene.generating} size="icon">
                                <ArrowUp className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-2">
                            <div className="w-full aspect-video bg-muted/50 rounded-lg p-2 border-2 border-dashed border-muted-foreground/20">
                                <div className="grid grid-cols-2 gap-2 w-full h-full">
                                    {Array.from({ length: 4 }, (_, index) => {
                                        const images = scene.generatedImages || (scene.imageUrl ? [scene.imageUrl] : []);
                                        const imageUrl = images[index];
                                        return (
                                            <div key={index} className="w-full aspect-video bg-muted rounded-lg  flex items-center justify-center">
                                                {!imageUrl && scene.generating && index < generateOutputs ? (
                                                    <p className="text-xs text-muted-foreground">Generating...</p>
                                                ) : imageUrl === "error" ? (
                                                    <p className="text-destructive text-xs">Error</p>
                                                ) : imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={`Scene ${scene.scene_number} - ${index + 1}`}
                                                        className="w-full h-full object-cover cursor-grab"
                                                        draggable
                                                        onDragStart={(e) => handleImageDragStart(e, imageUrl)}
                                                    />
                                                ) : (
                                                    <Camera className="w-4 h-4 text-muted-foreground/50" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-3">
                            <div
                                className="w-full aspect-video bg-muted/50 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-muted-foreground/20 relative"
                                onDrop={handleVideoDrop}
                                onDragOver={handleVideoDragOver}
                            >
                                {scene.videoGenerating ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <p className="text-sm text-muted-foreground">Generating video...</p>
                                    </div>
                                ) : scene.videoUrl ? (
                                    <video src={scene.videoUrl} className="w-full h-full object-cover" controls muted loop />
                                ) : (
                                    <div className="text-center">
                                        <Camera className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">Drag image here to generate video</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};

export const StoryBuilder: React.FC<StoryBuilderProps> = ({ project, onUpdateProject, onBackToDashboard, theme, onToggleTheme }) => {
    const [title, setTitle] = useState(project.title);
    const [script, setScript] = useState(project.script);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [expandedScenes, setExpandedScenes] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'scenes' | 'assets'>('scenes');

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
                    <Button variant="outline" onClick={() => setIsShareModalOpen(true)} className="gap-2 hidden sm:flex">
                        <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Share</span>
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setIsShareModalOpen(true)} className="sm:hidden">
                        <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" onClick={() => setIsSettingsModalOpen(true)} className="gap-2 hidden sm:flex">
                        <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Settings</span>
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setIsSettingsModalOpen(true)} className="sm:hidden">
                        <Settings className="w-4 h-4" />
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
            <div className="flex-grow flex p-2 sm:p-4 gap-2 sm:gap-4 overflow-hidden relative bg-accent">
                {/* Left section with stitch editor and tabs */}
                <div className="flex flex-col w-2/3 px-2 lg:px-8 overflow-auto">
                    <StitchEditor project={project} onUpdateProject={onUpdateProject} />
                    <div className="flex border-b border-border">
                        <button
                            onClick={() => setActiveTab('scenes')}
                            className={`px-4 py-2 ${activeTab === 'scenes' ? 'border-b-2 border-primary' : ''}`}
                        >
                            Scenes
                        </button>
                        <button
                            onClick={() => setActiveTab('assets')}
                            className={`px-4 py-2 ${activeTab === 'assets' ? 'border-b-2 border-primary' : ''}`}
                        >
                            Assets
                        </button>
                    </div>
                    {activeTab === 'scenes' ? (
                        <div className="">
                            {project.storyboard.length > 0 ? (
                                <Accordion type="multiple" value={expandedScenes} onValueChange={setExpandedScenes}>
                                    {project.storyboard
                                        .sort((a, b) => a.scene_number - b.scene_number)
                                        .map((scene) => (
                                            <SceneCard
                                                key={scene.id}
                                                scene={scene}
                                                project={project}
                                                onUpdateScene={handleUpdateScene}
                                                onDeleteScene={handleDeleteScene}
                                            />
                                        ))}
                                </Accordion>
                            ) : (
                                <div className="text-center py-20">
                                    <Camera className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                    <h2 className="text-xl font-semibold text-foreground">Empty Storyboard</h2>
                                    <p className="text-muted-foreground mt-2">Analyze your script or add a scene to get started.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <AssetManager project={project} onUpdateProject={onUpdateProject} />
                    )}
                </div>
                {/* Right section with sticky script */}
                <div className="w-1/3 h-full sticky top-0 bg-card rounded-2xl overflow">
                    <div className="h-full flex flex-col rounded-lg sm:rounded-2xl shadow-inner">
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
                </div>
            </div>
            <Modal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} title="Share Project">
                <ShareProjectContent project={project} />
            </Modal>
            <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Project Settings">
                <ProjectSettings settings={project.settings} onUpdate={(newSettings) => onUpdateProject({ ...project, settings: newSettings })} />
            </Modal>
        </div>
    );
};
