
import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { FilmProject, StoryboardScene } from '@/types/storytypes';
import { Camera, Trash2, ArrowUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { generateSingleImage } from "@/services/filmService";

interface SceneCardProps {
    scene: StoryboardScene;
    project: FilmProject;
    onUpdateScene: (updatedScene: StoryboardScene) => void;
    onDeleteScene: (sceneId: string) => void;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, project, onUpdateScene, onDeleteScene }) => {
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
                const response = await fetch('/api/stories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'generateVideo',
                        prompt: localPrompt || 'A cinematic scene',
                        imageUrl: imageUrl
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
            <AccordionTrigger className="hover:no-underline py-4">
                <Badge variant="outline" className="text-sm font-semibold">
                    Scene {scene.scene_number}
                </Badge>
            </AccordionTrigger>
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
                    
                    {/* Delete button at bottom right */}
                    <div className="flex justify-end mt-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteScene(scene.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Scene
                        </Button>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};

interface ScenesProps {
    project: FilmProject;
    onUpdateScene: (updatedScene: StoryboardScene) => void;
    onDeleteScene: (sceneId: string) => void;
    onAddScene: () => void;
    expandedScenes: string[];
    onExpandedScenesChange: (expandedScenes: string[]) => void;
}

export const Scenes: React.FC<ScenesProps> = ({
    project,
    onUpdateScene,
    onDeleteScene,
    onAddScene,
    expandedScenes,
    onExpandedScenesChange
}) => {
    return (
        <div className="p-2">
            {project.storyboard.length > 0 ? (
                <Accordion type="multiple" value={expandedScenes} onValueChange={onExpandedScenesChange}>
                    {project.storyboard
                        .sort((a, b) => a.scene_number - b.scene_number)
                        .map((scene) => (
                            <SceneCard
                                key={scene.id}
                                scene={scene}
                                project={project}
                                onUpdateScene={onUpdateScene}
                                onDeleteScene={onDeleteScene}
                            />
                        ))}
                </Accordion>
            ) : (
                <div className="text-center py-12 sm:py-20">
                    <Camera className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground">Empty Storyboard</h2>
                    <p className="text-sm sm:text-base text-muted-foreground mt-2 px-4">Analyze your script or add a scene to get started.</p>
                    <Button onClick={onAddScene} className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Scene
                    </Button>
                </div>
            )}
        </div>
    );
};
