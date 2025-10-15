import React, { useCallback, useState } from 'react';
import type { FilmProject, StoryboardScene } from '@/types/storytypes';
import { Camera, Trash2, RotateCcw, Sparkles, Plus } from 'lucide-react';
import { generateSingleImage } from '@/services/filmService';

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
            // This part is a placeholder for future functionality where an image can be passed to the model.
            // For now, we rely on the detailed text prompt.
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

    return (
        <div className="bg-muted/50 rounded-2xl p-4 flex flex-col md:flex-row gap-4">
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
            <div className="flex-grow flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-foreground">Scene {scene.scene_number}</h3>
                    <div className="flex items-center gap-1">
                        <button onClick={() => onDeleteScene(scene.id)} className="p-2 rounded-full text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-5 h-5"/></button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <select value={scene.characterId || ''} onChange={e => handleFieldChange('characterId', e.target.value || null)} className="w-full p-2 text-sm bg-muted border border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:outline-none">
                        <option value="">No Character</option>
                        {project.characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select value={scene.locationId || ''} onChange={e => handleFieldChange('locationId', e.target.value || null)} className="w-full p-2 text-sm bg-muted border border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:outline-none">
                        <option value="">No Location</option>
                        {project.locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    <select value={scene.soundId || ''} onChange={e => handleFieldChange('soundId', e.target.value || null)} className="w-full p-2 text-sm bg-muted border border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:outline-none">
                        <option value="">No Sound</option>
                        {project.sound_design.map(s => <option key={s.id} value={s.id}>{s.scene_match}: {s.description.substring(0, 20)}...</option>)}
                    </select>
                </div>

                <textarea
                    value={scene.prompt}
                    onChange={(e) => handleFieldChange('prompt', e.target.value)}
                    placeholder="Action prompt: e.g., 'looks out the window at the rain...'"
                    className="w-full flex-grow text-sm p-2 bg-transparent text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={2}
                />
                <div className="flex justify-end items-center gap-2">
                    <button className="p-2 rounded-full hover:bg-muted transition-colors" title="Regenerate"><RotateCcw className="w-4 h-4"/></button>
                    <button 
                        onClick={handleGenerateImage}
                        disabled={scene.generating}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-full hover:bg-primary/90 disabled:bg-primary/50 transition-colors">
                         <Sparkles className="w-4 h-4" />
                         Generate
                    </button>
                </div>
            </div>
        </div>
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
            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
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
                <button onClick={handleAddScene} className="w-full flex items-center justify-center gap-2 py-3 font-semibold text-foreground bg-muted rounded-full hover:bg-muted/80 transition-colors">
                    <Plus className="w-5 h-5" />
                    Add Scene
                </button>
            </div>
        </div>
    );
};
