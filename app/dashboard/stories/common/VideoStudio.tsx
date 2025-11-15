
import React, { useCallback } from 'react';
import type { FilmProject, StoryboardScene } from '@/types/storytypes';
import { Film, Camera, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateVideo } from '@/services/filmService';

interface VideoStudioProps {
    project: FilmProject;
    onUpdateProject: (updatedProject: FilmProject) => void;
}

const getBase64FromDataUrl = (dataUrl: string): string => {
    return dataUrl.split(',')[1];
}

const SceneVideoCard: React.FC<{
    scene: StoryboardScene;
    project: FilmProject;
    onUpdateScene: (updatedScene: StoryboardScene) => void;
}> = ({ scene, project, onUpdateScene }) => {

    const handleGenerateVideo = useCallback(async () => {
        if (!scene.imageUrl || scene.imageUrl === 'error') return;

        onUpdateScene({ ...scene, videoGenerating: true });
        try {
            const base64Image = getBase64FromDataUrl(scene.imageUrl);
            const videoPrompt = `
                Cinematic Style: ${project.settings.stylePreset}.
                Scene Prompt: ${scene.prompt}.
                Create a short, dynamic video clip that brings this scene to life, starting from the provided image.
            `;
            const generatedVideoUrl = await generateVideo(videoPrompt, base64Image);
            onUpdateScene({ ...scene, videoUrl: generatedVideoUrl, videoGenerating: false });
        } catch (error) {
            console.error(`Video generation failed for scene ${scene.scene_number}:`, error);
            onUpdateScene({ ...scene, videoGenerating: false });
        }
    }, [scene, project.settings.stylePreset, onUpdateScene]);
    
    React.useEffect(() => {
        return () => {
            if (scene.videoUrl && scene.videoUrl.startsWith('blob:')) {
                URL.revokeObjectURL(scene.videoUrl);
            }
        };
    }, [scene.videoUrl]);

    return (
        <Card className="flex flex-col md:flex-row gap-4 p-4">
            <div className="aspect-video md:w-1/3 bg-muted rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                 {scene.videoUrl ? (
                    <video controls src={scene.videoUrl} className="w-full h-full object-cover" />
                 ) : scene.imageUrl && scene.imageUrl !== 'error' ? (
                    <img src={scene.imageUrl} alt={`Scene ${scene.scene_number}`} className="w-full h-full object-cover" />
                ) : (
                    <Camera className="w-12 h-12 text-muted-foreground" />
                )}
            </div>
            <div className="flex-grow flex flex-col gap-2 justify-between">
                <div>
                    <h3 className="font-bold">Scene {scene.scene_number}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{scene.prompt}</p>
                </div>
                {scene.videoGenerating ? (
                    <div className="flex items-center gap-2 text-sm text-primary">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating video... This may take a few minutes.</span>
                    </div>
                ) : scene.videoUrl ? (
                     <Button 
                        asChild
                        variant="outline"
                        size="sm"
                        className="self-start"
                     >
                        <a href={scene.videoUrl} download={`scene_${scene.scene_number}.mp4`}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </a>
                    </Button>
                ) : (
                    <Button 
                        onClick={handleGenerateVideo}
                        disabled={!scene.imageUrl || scene.imageUrl === 'error'}
                        size="sm"
                        className="self-start"
                    >
                         <Film className="w-4 h-4 mr-2" />
                         Generate Video
                    </Button>
                )}
            </div>
        </Card>
    );
};

export const VideoStudio: React.FC<VideoStudioProps> = ({ project, onUpdateProject }) => {

    const handleUpdateScene = (updatedScene: StoryboardScene) => {
        const newStoryboard = project.storyboard.map(s => s.id === updatedScene.id ? updatedScene : s);
        onUpdateProject({ ...project, storyboard: newStoryboard });
    };
    
    const scenesWithImages = project.storyboard.filter(s => s.imageUrl && s.imageUrl !== 'error');

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Film className="w-5 h-5" />
                    Video Studio
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Generate video clips for each scene that has a concept image.
                </p>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
                {scenesWithImages.length > 0 ? (
                    scenesWithImages.sort((a,b) => a.scene_number - b.scene_number).map(scene => (
                        <SceneVideoCard key={scene.id} scene={scene} project={project} onUpdateScene={handleUpdateScene} />
                    ))
                ) : (
                    <div className="text-center py-20 flex flex-col items-center justify-center h-full">
                        <Film className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold">Ready to Animate?</h2>
                        <p className="text-muted-foreground mt-2 max-w-sm">
                            Go to the "Storyboard" tab and generate some concept images. Once you have images, you can come back here to bring them to life as video clips.
                        </p>
                    </div>
                )}
            </CardContent>
            <div className="flex-shrink-0 p-4 border-t">
                <Button 
                    onClick={() => alert("Bulk video generation is not yet implemented.")}
                    className="w-full"
                    disabled={scenesWithImages.length === 0}
                >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate All Videos (Coming Soon)
                </Button>
            </div>
        </Card>
    );
};
