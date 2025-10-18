import React, { useCallback, useState, useRef, useEffect } from 'react';
import type { FilmProject, StoryboardScene } from '@/types/storytypes';
import { Camera, Trash2, RotateCcw, Sparkles, Plus } from 'lucide-react';
import { generateSingleImage } from '@/services/filmService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface StoryboardEditorProps {
    project: FilmProject;
    onUpdateProject: (updatedProject: FilmProject) => void;
}

const SceneCard: React.FC<{
    scene: StoryboardScene;
    project: FilmProject;
    onUpdateScene: (updatedScene: StoryboardScene) => void;
    onDeleteScene: (sceneId: string) => void;
}> = ({ scene, project, onUpdateScene, onDeleteScene }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [scene.prompt]);

    const handleGenerateImage = useCallback(async () => {
        const character = project.characters.find(c => c.id === scene.characterId);
        const location = project.locations.find(l => l.id === scene.locationId);

        let builtPrompt = scene.prompt || "A cinematic scene.";

        if (character) {
             builtPrompt = `${character.name} ${builtPrompt}. Description of ${character.name}: ${character.description}.`;
        }
        if (location) {
            builtPrompt = `${builtPrompt} The setting is ${location.name}. Description of location: ${location.description}.`;
        }

        if (character?.imageUrl) {
            console.log("Character image available, but not yet used in generation.", character.imageUrl);
        }

        onUpdateScene({ ...scene, generating: true });
        try {
            const imageUrl = await generateSingleImage(builtPrompt, project.settings.aspectRatio);
            onUpdateScene({ ...scene, imageUrl, generating: false });
        } catch (error) {
            console.error("Image generation failed:", error);
            onUpdateScene({ ...scene, generating: false, imageUrl: 'error' });
        }
    }, [scene, project, onUpdateScene]);

    const handleFieldChange = (field: keyof StoryboardScene, value: string | null) => {
        onUpdateScene({ ...scene, [field]: value });
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        handleFieldChange('prompt', e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    return (
        <Card className="mb-4">
            <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="aspect-video md:w-1/3 bg-muted rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                         {scene.generating ? (
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        ) : scene.imageUrl === 'error' ? (
                             <p className="text-destructive">Error</p>
                        ) : scene.imageUrl ? (
                            <img src={scene.imageUrl} alt={`Scene ${scene.scene_number}`} className="w-full h-full object-cover" />
                        ) : (
                            <Camera className="w-12 h-12 text-muted-foreground" />
                        )}
                    </div>

                    <div className="flex-grow flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <Badge variant="outline" className="text-sm font-semibold">
                                Scene {scene.scene_number}
                            </Badge>
                            <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => onDeleteScene(scene.id)} 
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="w-4 h-4"/>
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Select 
                                value={scene.characterId || undefined} 
                                onValueChange={(value) => handleFieldChange('characterId', value || null)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Character" />
                                </SelectTrigger>
                                <SelectContent>
                                    {project.characters.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select 
                                value={scene.locationId || undefined} 
                                onValueChange={(value) => handleFieldChange('locationId', value || null)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Location" />
                                </SelectTrigger>
                                <SelectContent>
                                    {project.locations.map(l => (
                                        <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select 
                                value={scene.soundId || undefined} 
                                onValueChange={(value) => handleFieldChange('soundId', value || null)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Sound" />
                                </SelectTrigger>
                                <SelectContent>
                                    {project.sound_design.map(s => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.scene_match}: {s.description.substring(0, 20)}...
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Textarea
                            ref={textareaRef}
                            value={scene.prompt}
                            onChange={handleTextareaChange}
                            placeholder="Action prompt: e.g., 'looks out the window at the rain...'"
                            className="flex-grow resize-none overflow-hidden min-h-[60px]"
                            rows={2}
                        />

                        <div className="flex justify-end items-center gap-2">
                            <Button 
                                variant="ghost" 
                                size="icon"
                                className="hover:bg-muted"
                                title="Regenerate"
                            >
                                <RotateCcw className="w-4 h-4"/>
                            </Button>
                            <Button 
                                onClick={handleGenerateImage}
                                disabled={scene.generating}
                                className="flex items-center gap-2"
                            >
                                 <Sparkles className="w-4 h-4" />
                                 Generate
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export const StoryboardEditor: React.FC<StoryboardEditorProps> = ({ project, onUpdateProject }) => {

    const handleUpdateScene = (updatedScene: StoryboardScene) => {
        const newStoryboard = project.storyboard.map(s => s.id === updatedScene.id ? updatedScene : s);
        onUpdateProject({ ...project, storyboard: newStoryboard });
    };

    const handleDeleteScene = (sceneId: string) => {
        const newStoryboard = project.storyboard.filter(s => s.id !== sceneId).map((s, index) => ({...s, scene_number: index + 1}));
        onUpdateProject({ ...project, storyboard: newStoryboard });
    };

    const handleAddScene = () => {
        const newSceneNumber = project.storyboard.length > 0 ? Math.max(...project.storyboard.map(s => s.scene_number)) + 1 : 1;
        const newScene: StoryboardScene = {
            id: `scene_${Date.now()}`,
            scene_number: newSceneNumber,
            prompt: '',
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
        <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto pr-2">
                {project.storyboard.length > 0 ? (
                    project.storyboard.sort((a,b) => a.scene_number - b.scene_number).map(scene => (
                        <SceneCard key={scene.id} scene={scene} project={project} onUpdateScene={handleUpdateScene} onDeleteScene={handleDeleteScene} />
                    ))
                ) : (
                    <div className="text-center py-20">
                        <Camera className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold text-foreground">Empty Storyboard</h2>
                        <p className="text-muted-foreground mt-2">Analyze your script or add a scene to get started.</p>
                    </div>
                )}
            </div>
            <div className="flex-shrink-0 pt-4">
                <Button 
                    onClick={handleAddScene} 
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 py-3"
                >
                    <Plus className="w-5 h-5" />
                    Add Scene
                </Button>
            </div>
        </div>
    );
};