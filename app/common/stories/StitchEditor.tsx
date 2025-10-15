
import React, { useState, useEffect, useRef } from 'react';
import type { FilmProject, StoryboardScene } from '@/types/storytypes';
import { Film, GripVertical, Play, Pause, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface StitchEditorProps {
    project: FilmProject;
    onUpdateProject: (updatedProject: FilmProject) => void;
}

export const StitchEditor: React.FC<StitchEditorProps> = ({ project, onUpdateProject }) => {
    const [videoScenes, setVideoScenes] = useState<StoryboardScene[]>([]);
    const [draggedItem, setDraggedItem] = useState<StoryboardScene | null>(null);
    const playerRef = useRef<HTMLVideoElement>(null);
    const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number>(-1);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const sortedVideoScenes = project.storyboard
            .filter(s => s.videoUrl)
            .sort((a, b) => a.scene_number - b.scene_number);
        setVideoScenes(sortedVideoScenes);
    }, [project.storyboard]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, scene: StoryboardScene) => {
        setDraggedItem(scene);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetScene: StoryboardScene) => {
        e.preventDefault();
        if (!draggedItem || draggedItem.id === targetScene.id) {
            setDraggedItem(null);
            return;
        }

        const newStoryboard = [...project.storyboard];
        const draggedIdx = newStoryboard.findIndex(s => s.id === draggedItem.id);
        const targetIdx = newStoryboard.findIndex(s => s.id === targetScene.id);

        if (draggedIdx === -1 || targetIdx === -1) return;

        const [removed] = newStoryboard.splice(draggedIdx, 1);
        newStoryboard.splice(targetIdx, 0, removed);
        
        const renumberedStoryboard = newStoryboard.map((scene, index) => ({
            ...scene,
            scene_number: index + 1,
        }));

        onUpdateProject({
            ...project,
            storyboard: renumberedStoryboard,
        });

        setDraggedItem(null);
    };

    const handlePlayPause = () => {
        if (playerRef.current) {
            if (isPlaying) {
                playerRef.current.pause();
            } else {
                if (currentPlayingIndex === -1 && videoScenes.length > 0) {
                    setCurrentPlayingIndex(0);
                } else {
                    playerRef.current.play();
                }
            }
            setIsPlaying(!isPlaying);
        }
    };

    useEffect(() => {
        if (currentPlayingIndex >= 0 && currentPlayingIndex < videoScenes.length && playerRef.current) {
            playerRef.current.src = videoScenes[currentPlayingIndex].videoUrl!;
            playerRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error("Playback failed", e));
        } else if (currentPlayingIndex >= videoScenes.length) {
            setCurrentPlayingIndex(-1);
            setIsPlaying(false);
            if(playerRef.current) playerRef.current.src = '';
        }
    }, [currentPlayingIndex, videoScenes]);

    const handleVideoEnd = () => {
        setCurrentPlayingIndex(prev => prev + 1);
    };

    const hasVideos = videoScenes.length > 0;
    const currentScene = videoScenes[currentPlayingIndex];

    return (
        <div className="h-full flex flex-col md:flex-row gap-4">
            <main className="flex-grow h-full flex flex-col">
                <Card className="flex-grow">
                    <div className="flex-grow bg-black flex items-center justify-center relative rounded-lg overflow-hidden">
                        <video 
                            ref={playerRef} 
                            onEnded={handleVideoEnd} 
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            className="max-w-full max-h-full" 
                            playsInline
                        />
                        {!isPlaying && !currentScene && (
                            <div className="absolute text-center text-muted-foreground">
                                <Film className="w-16 h-16 mx-auto mb-2" />
                                <p>Timeline Preview</p>
                            </div>
                        )}
                    </div>
                    <CardContent className="p-4 border-t flex items-center justify-between">
                        <Button onClick={handlePlayPause} disabled={!hasVideos} className="flex items-center gap-2">
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            <span>{isPlaying ? 'Pause' : 'Play Sequence'}</span>
                        </Button>
                        <div className="text-center">
                            {currentScene && (
                                <>
                                    <p className="font-semibold">Playing: Scene {currentScene.scene_number}</p>
                                    <p className="text-sm text-muted-foreground">({currentPlayingIndex + 1} of {videoScenes.length})</p>
                                </>
                            )}
                        </div>
                        <Button 
                            onClick={() => alert("Exporting the final stitched video is not yet implemented.")} 
                            disabled={!hasVideos} 
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            <span>Export Final Film</span>
                        </Button>
                    </CardContent>
                </Card>
            </main>
            <aside className="md:w-72 lg:w-96 flex-shrink-0 flex flex-col h-full">
                <Card className="h-full flex flex-col">
                    <CardContent className="p-4 border-b">
                        <h3 className="text-lg font-bold">Scene Sequence</h3>
                    </CardContent>
                    <div className="flex-grow overflow-y-auto p-2 space-y-2">
                        {hasVideos ? videoScenes.map(scene => (
                            <Card 
                                key={scene.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, scene)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, scene)}
                                className={`cursor-grab transition-all ${
                                    draggedItem?.id === scene.id ? 'opacity-50' : ''
                                } ${
                                    currentPlayingIndex !== -1 && videoScenes[currentPlayingIndex]?.id === scene.id ? 'ring-2 ring-primary' : ''
                                }`}
                            >
                                <CardContent className="flex items-center gap-3 p-3">
                                    <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    <div className="w-20 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                                        <video src={scene.videoUrl!} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">Scene {scene.scene_number}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{scene.prompt}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )) : (
                            <div className="text-center p-8 text-muted-foreground">
                                <GripVertical className="w-12 h-12 mx-auto mb-2" />
                                <p className="text-sm">Generate videos in the 'Video' tab to start stitching your film.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </aside>
            <style>{`
                .cursor-grab { cursor: grab; }
                .cursor-grab:active { cursor: grabbing; }
            `}</style>
        </div>
    );
};
