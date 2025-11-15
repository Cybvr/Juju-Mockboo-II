import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { FilmProject, StoryboardScene } from '@/types/storytypes';
import { Camera, Trash2, ArrowUp, Plus, X, ChevronLeft, ChevronRight, Download, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
    const [aspectRatio, setAspectRatio] = useState(project.settings.aspectRatio || "16:9");
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImageIndex, setLightboxImageIndex] = useState(0);

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
        console.log(`📐 Aspect ratio: ${aspectRatio}`);
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
                const imageUrl = await generateSingleImage(builtPrompt, aspectRatio);
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
                        imageUrl: imageUrl,
                        aspectRatio: aspectRatio // Use the scene's current aspect ratio
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

    const handleDeleteImage = (imageIndex: number) => {
        const images = scene.generatedImages || (scene.imageUrl ? [scene.imageUrl] : []);
        const updatedImages = images.filter((_, index) => index !== imageIndex);

        onUpdateScene({
            ...scene,
            generatedImages: updatedImages,
            imageUrl: updatedImages.length > 0 ? updatedImages[0] : null
        });
    };

    const handleImageClick = (imageIndex: number) => {
        setLightboxImageIndex(imageIndex);
        setLightboxOpen(true);
    };

    const navigateLightbox = (direction: 'prev' | 'next') => {
        const images = scene.generatedImages || (scene.imageUrl ? [scene.imageUrl] : []);
        if (direction === 'prev') {
            setLightboxImageIndex(lightboxImageIndex > 0 ? lightboxImageIndex - 1 : images.length - 1);
        } else {
            setLightboxImageIndex(lightboxImageIndex < images.length - 1 ? lightboxImageIndex + 1 : 0);
        }
    };

    const handleDownloadImage = async () => {
        const images = scene.generatedImages || (scene.imageUrl ? [scene.imageUrl] : []);
        const imageUrl = images[lightboxImageIndex];
        if (!imageUrl) return;

        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `scene_${scene.scene_number}_image_${lightboxImageIndex + 1}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download image:', error);
        }
    };

    return (
        <AccordionItem value={scene.id} className="mb-4 bg-card  px-2">
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
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="justify-start">
                                        {scene.characterId ? (() => {
                                            const character = project.characters.find(c => c.id === scene.characterId);
                                            return character ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                                                        {character.imageUrl && character.imageUrl !== 'error' ? (
                                                            <img src={character.imageUrl} alt={character.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="w-4 h-4 text-muted-foreground mx-auto mt-1" />
                                                        )}
                                                    </div>
                                                    <span className="truncate">{character.name}</span>
                                                </div>
                                            ) : "Select Character";
                                        })() : (
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-muted-foreground" />
                                                <span>Select Character</span>
                                            </div>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        {project.characters.map((c) => (
                                            <Button
                                                key={c.id}
                                                variant={scene.characterId === c.id ? "default" : "ghost"}
                                                className="h-auto p-3 flex-col gap-2"
                                                onClick={() => handleFieldChange("characterId", c.id)}
                                            >
                                                <div className="w-12 h-12 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                                                    {c.imageUrl && c.imageUrl !== 'error' ? (
                                                        <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-6 h-6 text-muted-foreground mx-auto mt-3" />
                                                    )}
                                                </div>
                                                <span className="text-xs font-medium truncate w-full">{c.name}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="justify-start">
                                        {scene.locationId ? (() => {
                                            const location = project.locations.find(l => l.id === scene.locationId);
                                            return location ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded bg-muted flex-shrink-0 overflow-hidden">
                                                        {location.imageUrl && location.imageUrl !== 'error' ? (
                                                            <img src={location.imageUrl} alt={location.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <MapPin className="w-4 h-4 text-muted-foreground mx-auto mt-1" />
                                                        )}
                                                    </div>
                                                    <span className="truncate">{location.name}</span>
                                                </div>
                                            ) : "Select Location";
                                        })() : (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                                <span>Select Location</span>
                                            </div>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        {project.locations.map((l) => (
                                            <Button
                                                key={l.id}
                                                variant={scene.locationId === l.id ? "default" : "ghost"}
                                                className="h-auto p-3 flex-col gap-2"
                                                onClick={() => handleFieldChange("locationId", l.id)}
                                            >
                                                <div className="w-12 h-12 rounded bg-muted flex-shrink-0 overflow-hidden">
                                                    {l.imageUrl && l.imageUrl !== 'error' ? (
                                                        <img src={l.imageUrl} alt={l.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <MapPin className="w-6 h-6 text-muted-foreground mx-auto mt-3" />
                                                    )}
                                                </div>
                                                <span className="text-xs font-medium truncate w-full">{l.name}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Select value={aspectRatio} onValueChange={setAspectRatio}>
                                <SelectTrigger className="w-20 h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="16:9">16:9</SelectItem>
                                    <SelectItem value="9:16">9:16</SelectItem>
                                    <SelectItem value="1:1">1:1</SelectItem>
                                    <SelectItem value="4:3">4:3</SelectItem>
                                    <SelectItem value="3:4">3:4</SelectItem>
                                </SelectContent>
                            </Select>
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
                                            <div key={index} className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center relative group">
                                                {!imageUrl && scene.generating && index < generateOutputs ? (
                                                    <p className="text-xs text-muted-foreground">Generating...</p>
                                                ) : imageUrl === "error" ? (
                                                    <p className="text-destructive text-xs">Error</p>
                                                ) : imageUrl ? (
                                                    <>
                                                        <img
                                                            src={imageUrl}
                                                            alt={`Scene ${scene.scene_number} - ${index + 1}`}
                                                            className="w-full h-full object-cover cursor-pointer"
                                                            draggable
                                                            onDragStart={(e) => handleImageDragStart(e, imageUrl)}
                                                            onClick={() => handleImageClick(index)}
                                                        />
                                                        {/* Delete button on hover */}
                                                        <Button
                                                            size="icon"
                                                            variant="destructive"
                                                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteImage(index);
                                                            }}
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </Button>
                                                    </>
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
                                        <Camera className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground mb-4" />
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

            {/* Lightbox Modal */}
            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
                    <div className="relative w-full h-full flex items-center justify-center bg-black rounded-lg overflow-hidden">
                        {(() => {
                            const images = scene.generatedImages || (scene.imageUrl ? [scene.imageUrl] : []);
                            const currentImage = images[lightboxImageIndex];

                            return currentImage ? (
                                <>
                                    {/* Close button */}
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
                                        onClick={() => setLightboxOpen(false)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>

                                    {/* Navigation buttons */}
                                    {images.length > 1 && (
                                        <>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="absolute top-1/2 left-4 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                                                onClick={() => navigateLightbox('prev')}
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="absolute top-1/2 right-4 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                                                onClick={() => navigateLightbox('next')}
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </>
                                    )}

                                    {/* Download button */}
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute bottom-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
                                        onClick={handleDownloadImage}
                                    >
                                        <Download className="w-4 h-4" />
                                    </Button>

                                    {/* Image */}
                                    <img
                                        src={currentImage}
                                        alt={`Scene ${scene.scene_number} - Image ${lightboxImageIndex + 1}`}
                                        className="max-w-full max-h-full object-contain"
                                    />

                                    {/* Image counter */}
                                    <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                                        {lightboxImageIndex + 1} / {images.length}
                                    </div>
                                </>
                            ) : null;
                        })()}
                    </div>
                </DialogContent>
            </Dialog>
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
        <div className="">
            {project.storyboard.length > 0 ? (
                <>
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

                    {/* Add Scene button when scenes exist */}
                    <div className="flex justify-center mt-6">
                        <Button onClick={onAddScene} variant="outline" className="w-full max-w-xs">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Scene
                        </Button>
                    </div>
                </>
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