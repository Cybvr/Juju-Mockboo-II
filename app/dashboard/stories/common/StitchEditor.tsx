
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
        <div className="h-full flex flex-col bg-gray-900">
            {/* Video Preview Area */}
            <div className="flex-grow bg-black flex items-center justify-center relative">
                <video 
                    ref={playerRef} 
                    onEnded={handleVideoEnd} 
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="max-w-full max-h-full" 
                    playsInline
                />
                {!isPlaying && !currentScene && (
                    <div className="absolute text-center text-gray-400">
                        <Film className="w-16 h-16 mx-auto mb-2" />
                        <p>Timeline Preview</p>
                    </div>
                )}
            </div>

            {/* Controls Bar */}
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-700">
                <Button onClick={handlePlayPause} disabled={!hasVideos} className="flex items-center gap-2">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </Button>
                
                <div className="text-center text-white">
                    {currentScene && (
                        <>
                            <p className="font-semibold">Scene {currentScene.scene_number}</p>
                            <p className="text-xs text-gray-400">({currentPlayingIndex + 1} of {videoScenes.length})</p>
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
                    <span>Export</span>
                </Button>
            </div>

            {/* Timeline */}
            <div className="h-32 bg-gray-800 border-t border-gray-700 p-2">
                <h3 className="text-sm font-medium text-white mb-2">Timeline</h3>
                <div className="flex gap-1 overflow-x-auto">
                    {hasVideos ? videoScenes.map((scene, index) => (
                        <div
                            key={scene.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, scene)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, scene)}
                            className={`relative flex-shrink-0 w-20 h-16 bg-gray-700 rounded overflow-hidden cursor-grab transition-all ${
                                draggedItem?.id === scene.id ? 'opacity-50' : ''
                            } ${
                                currentPlayingIndex !== -1 && videoScenes[currentPlayingIndex]?.id === scene.id ? 'ring-2 ring-blue-500' : ''
                            }`}
                        >
                            <video src={scene.videoUrl!} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1">
                                {scene.scene_number}
                            </div>
                            <GripVertical className="absolute top-1 right-1 w-3 h-3 text-white opacity-70" />
                        </div>
                    )) : (
                        <div className="flex items-center justify-center w-full h-full text-gray-400">
                            <div className="text-center">
                                <GripVertical className="w-8 h-8 mx-auto mb-1" />
                                <p className="text-xs">Generate videos to build timeline</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .cursor-grab { cursor: grab; }
                .cursor-grab:active { cursor: grabbing; }
            `}</style>
        </div>
    );
};
