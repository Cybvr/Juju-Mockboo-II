import React, { useState, useEffect, useRef } from 'react';
import { Film, Camera, Download, Share, Heart, ThumbsDown, Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';

interface StoryboardScene {
    id: string;
    scene_number: number;
    description?: string;
    videoUrl?: string;
    trimStart?: number;
    trimEnd?: number;
}

interface FilmProject {
    storyboard: StoryboardScene[];
}

interface StitchPlayerProps {
    project: FilmProject;
    onUpdateProject?: (updatedProject: FilmProject) => void;
}

export const StitchEditor: React.FC<StitchPlayerProps> = ({ project }) => {
    const [videoScenes, setVideoScenes] = useState<StoryboardScene[]>([]);
    const playerRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentGlobalTime, setCurrentGlobalTime] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const [sceneDurations, setSceneDurations] = useState<Map<string, number>>(new Map());
    const [videosLoaded, setVideosLoaded] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [volume, setVolume] = useState(1);
    const hideControlsTimeout = useRef<NodeJS.Timeout>();

    useEffect(() => {
        const sortedVideoScenes = project.storyboard
            .filter(s => s.videoUrl)
            .sort((a, b) => a.scene_number - b.scene_number);
        console.log('🎬 StitchEditor: Updated video scenes:', sortedVideoScenes);
        setVideoScenes(sortedVideoScenes);
        setVideosLoaded(false);
    }, [project.storyboard]);

    useEffect(() => {
        if (videoScenes.length === 0) {
            console.log('🎬 StitchEditor: No video scenes to load');
            return;
        }
        console.log('🎬 StitchEditor: Loading durations for', videoScenes.length, 'scenes');
        const loadDurations = async () => {
            const durationsMap = new Map<string, number>();
            let total = 0;
            for (const scene of videoScenes) {
                if (scene.videoUrl) {
                    console.log('📹 Loading video metadata for scene', scene.scene_number, ':', scene.videoUrl);
                    const video = document.createElement('video');
                    video.src = scene.videoUrl;
                    await new Promise<void>((resolve) => {
                        video.onloadedmetadata = () => {
                            const trimStart = scene.trimStart || 0;
                            const trimEnd = scene.trimEnd || video.duration;
                            const duration = trimEnd - trimStart;
                            durationsMap.set(scene.id, duration);
                            total += duration;
                            console.log('✅ Scene', scene.scene_number, 'duration:', duration + 's');
                            resolve();
                        };
                        video.onerror = () => {
                            console.error('❌ Failed to load video for scene', scene.scene_number);
                            resolve();
                        };
                    });
                }
            }
            setSceneDurations(durationsMap);
            setTotalDuration(total);
            setVideosLoaded(true);
            console.log('🎬 StitchEditor: All videos loaded. Total duration:', total + 's');
            if (playerRef.current && videoScenes[0]?.videoUrl) {
                playerRef.current.src = videoScenes[0].videoUrl;
                playerRef.current.currentTime = videoScenes[0].trimStart || 0;
            }
        };
        loadDurations();
    }, [videoScenes]);

    useEffect(() => {
        if (!isPlaying || !playerRef.current || !videosLoaded) return;
        const step = () => {
            if (!playerRef.current) return;
            let accumulatedTime = 0;
            let sceneIndex = 0;
            for (let i = 0; i < videoScenes.length; i++) {
                const duration = sceneDurations.get(videoScenes[i].id) || 0;
                if (currentGlobalTime < accumulatedTime + duration) {
                    sceneIndex = i;
                    break;
                }
                accumulatedTime += duration;
            }
            const scene = videoScenes[sceneIndex];
            const timeInScene = currentGlobalTime - accumulatedTime;
            const trimStart = scene.trimStart || 0;
            const targetTime = trimStart + timeInScene;
            if (playerRef.current.src !== scene.videoUrl) {
                playerRef.current.src = scene.videoUrl!;
                playerRef.current.currentTime = targetTime;
                playerRef.current.play();
            } else if (Math.abs(playerRef.current.currentTime - targetTime) > 0.3) {
                playerRef.current.currentTime = targetTime;
            }
            setCurrentGlobalTime(prev => {
                const next = prev + 1 / 60;
                if (next >= totalDuration) {
                    setIsPlaying(false);
                    return totalDuration;
                }
                return next;
            });
        };
        const interval = setInterval(step, 1000 / 60);
        return () => clearInterval(interval);
    }, [isPlaying, currentGlobalTime, videoScenes, sceneDurations, totalDuration, videosLoaded]);

    const handlePlayPause = () => {
        if (videoScenes.length === 0 || !videosLoaded) return;
        if (currentGlobalTime >= totalDuration) {
            setCurrentGlobalTime(0);
            if (playerRef.current && videoScenes[0]?.videoUrl) {
                playerRef.current.src = videoScenes[0].videoUrl;
                playerRef.current.currentTime = videoScenes[0].trimStart || 0;
            }
        }
        setIsPlaying(!isPlaying);
        if (!isPlaying && playerRef.current) playerRef.current.play();
        if (isPlaying && playerRef.current) playerRef.current.pause();
    };

    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videosLoaded || totalDuration === 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const clickedTime = (x / rect.width) * totalDuration;
        setCurrentGlobalTime(clickedTime);
        let accumulated = 0;
        for (let i = 0; i < videoScenes.length; i++) {
            const duration = sceneDurations.get(videoScenes[i].id) || 0;
            if (clickedTime < accumulated + duration) {
                const scene = videoScenes[i];
                const trimStart = scene.trimStart || 0;
                const timeInScene = clickedTime - accumulated;
                const newSceneTime = trimStart + timeInScene;
                if (playerRef.current) {
                    playerRef.current.src = scene.videoUrl!;
                    playerRef.current.currentTime = newSceneTime;
                    if (isPlaying) playerRef.current.play();
                }
                break;
            }
            accumulated += duration;
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (hideControlsTimeout.current) {
            clearTimeout(hideControlsTimeout.current);
        }
        hideControlsTimeout.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    const handleFullscreen = () => {
        if (containerRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                containerRef.current.requestFullscreen();
            }
        }
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return '0:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const progressPercent = totalDuration > 0 ? (currentGlobalTime / totalDuration) * 100 : 0;
    const hasVideos = videoScenes.length > 0;

    return (
        <div
            ref={containerRef}
            className="relative w-full max-auto bg-red-500 group overflow-auto-y rounded-xl"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            {/* Video Player */}
            {hasVideos && (
                <video
                    ref={playerRef}
                    className="w-full h-full object-contain cursor-pointer rounded-xl"
                    playsInline
                    onClick={handlePlayPause}
                />
            )}
            {/* Controls Overlay */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity rounded-xl duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0'
                }`}
            >
                {/* Timeline */}
                <div className="px-4 pb-2 ">
                    <div
                        className="relative h-1 bg-white/30 rounded-full cursor-pointer group/timeline hover:h-1.5 transition-all"
                        onClick={handleTimelineClick}
                    >
                        <div
                            className="absolute h-full bg-red-600 rounded-full transition-all"
                            style={{ width: `${progressPercent}%` }}
                        />
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover/timeline:opacity-100 transition-opacity"
                            style={{ left: `${progressPercent}%`, transform: 'translate(-50%, -50%)' }}
                        />
                    </div>
                </div>
                {/* Control Bar */}
                <div className="flex items-center gap-4 px-4 pb-4">
                    <button
                        onClick={handlePlayPause}
                        disabled={!hasVideos || !videosLoaded}
                        className="text-white hover:text-white/80 transition-colors disabled:opacity-50"
                    >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-white" />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setVolume(val);
                                if (playerRef.current) playerRef.current.volume = val;
                            }}
                            className="w-20 h-1 accent-white"
                        />
                    </div>
                    <span className="text-white text-sm font-medium">
                        {formatTime(currentGlobalTime)} / {formatTime(totalDuration)}
                    </span>
                    <div className="flex-1" />
                    <button className="text-white hover:text-white/80 transition-colors">
                        <Download className="w-5 h-5" />
                    </button>
                    <button className="text-white hover:text-white/80 transition-colors">
                        <Share className="w-5 h-5" />
                    </button>
                    <button className="text-white hover:text-white/80 transition-colors">
                        <Heart className="w-5 h-5" />
                    </button>
                    <button className="text-white hover:text-white/80 transition-colors">
                        <ThumbsDown className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleFullscreen}
                        className="text-white hover:text-white/80 transition-colors"
                    >
                        <Maximize className="w-5 h-5" />
                    </button>
                </div>
            </div>
            {/* Center Play Button (when paused) */}
            {!isPlaying && hasVideos && videosLoaded && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 rounded-full bg-black/50 flex items-center justify-center">
                        <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                </div>
            )}

        </div>
    );
};