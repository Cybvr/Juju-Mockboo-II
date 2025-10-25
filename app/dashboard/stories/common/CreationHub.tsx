import React, { useState, useCallback } from 'react';
import type { FilmProject, Template } from '@/types/storytypes';
import { Sparkles, FileText, Palette, ArrowLeft, Dices, Loader2, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { generateScript, analyzeScript } from '@/services/filmService';
import { TemplateBrowser } from './TemplateBrowser';
import { useRouter } from 'next/navigation';

interface CreationHubProps {
    project: FilmProject;
    templates: Template[];
    onUpdateProject: (updatedProject: FilmProject) => void;
    onBackToDashboard: () => void;
    isAdmin?: boolean;
    onTogglePublic?: () => void;
}

const samplePrompts = [
    "A commercial for a new brand of coffee that gives people the ability to talk to animals.",
    "A short film about an old librarian who discovers a book that writes itself, detailing future events.",
    "An ad for a futuristic car that can fly, showing a family taking a road trip through the clouds.",
    "A lonely astronaut on Mars finds a mysterious, glowing plant that offers a connection back to Earth.",
];

export const CreationHub: React.FC<CreationHubProps> = ({ project, templates, onUpdateProject, onBackToDashboard, isAdmin, onTogglePublic }) => {
    const [prompt, setPrompt] = useState('');
    const [script, setScript] = useState('');
    const [activeMethod, setActiveMethod] = useState<'generate' | 'paste' | 'template' | null>(null);
    const [isGeneratingScript, setIsGeneratingScript] = useState(false);
    const [isAnalyzingScript, setIsAnalyzingScript] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isTemplateBrowserOpen, setIsTemplateBrowserOpen] = useState(false);
    const router = useRouter();

    const handleGenerateScript = useCallback(async () => {
        if (!prompt.trim()) {
            setError("Please enter a film idea.");
            return;
        }
        setIsGeneratingScript(true);
        setError(null);
        try {
            const generatedScript = await generateScript(prompt);
            onUpdateProject({ ...project, script: generatedScript, prompt, updatedAt: Date.now() });
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsGeneratingScript(false);
        }
    }, [prompt, onUpdateProject, project]);

    const handleAnalyzeScript = useCallback(async () => {
        if (!script.trim()) {
            setError("Please paste your script.");
            return;
        }
        setIsAnalyzingScript(true);
        setError(null);
        try {
            const analyzed = await analyzeScript(script);
            const storyboard = analyzed.storyboard.map((scene, index) => ({
                id: `scene_${Date.now()}_${index}`,
                scene_number: scene.scene_number,
                prompt: scene.prompt,
                imageUrl: null,
                generating: false,
                videoUrl: null,
                videoGenerating: false,
                characterId: null,
                locationId: null,
                soundId: null,
            }));
            const characters = analyzed.characters.map((char, index) => ({
                id: `char_${Date.now()}_${index}`,
                name: char.name,
                description: char.description,
                imageUrl: null,
                generatingImage: false,
            }));
            const locations = analyzed.locations.map((loc, index) => ({
                id: `loc_${Date.now()}_${index}`,
                name: loc.name,
                description: loc.description,
                imageUrl: null,
                generatingImage: false,
            }));
            const sound_design = analyzed.sound_design.map((sound, index) => ({
                id: `sound_${Date.now()}_${index}`,
                scene_match: sound.scene_match,
                description: sound.description,
            }));
            const updatedProject = {
                ...project,
                script: script,
                storyboard,
                characters,
                locations,
                sound_design,
                updatedAt: Date.now(),
            };
            onUpdateProject(updatedProject);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred during analysis.');
        } finally {
            setIsAnalyzingScript(false);
        }
    }, [script, onUpdateProject, project]);

    const handleInspireMe = useCallback(() => {
        const randomIndex = Math.floor(Math.random() * samplePrompts.length);
        setPrompt(samplePrompts[randomIndex]);
    }, []);

    const MethodButton: React.FC<{
        method: 'generate' | 'paste' | 'template';
        icon: React.ComponentType<{ className?: string }>;
        title: string;
        description: string;
    }> = ({ method, icon: Icon, title, description }) => (
        <Card
            className={`cursor-pointer transition-all ${
                activeMethod === method ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent/50'
            }`}
            onClick={() => {
                if (method === 'template') {
                    setIsTemplateBrowserOpen(true);
                } else {
                    setActiveMethod(method);
                    setError(null);
                }
            }}
        >
            <CardContent className="p-6 flex items-start gap-4">
                <Icon className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                <div>
                    <h3 className="text-lg font-bold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <>
            {isTemplateBrowserOpen && (
                <TemplateBrowser
                    templates={templates}
                    onClose={() => setIsTemplateBrowserOpen(false)}
                    showPublicTab={true}
                />
            )}
            <div className="w-full max-w-2xl mx-auto py-16 px-4 flex flex-col items-center justify-center min-h-screen">
                <Button
                    onClick={onBackToDashboard}
                    variant="ghost"
                    className="absolute top-8 left-8 flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    All Projects
                </Button>

                {isAdmin && onTogglePublic && (
                    <div className="absolute top-8 right-8 flex items-center gap-2">
                        <Label htmlFor="public-toggle" className="flex items-center gap-2">
                            {project.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            Public
                        </Label>
                        <Switch
                            id="public-toggle"
                            checked={project.isPublic || false}
                            onCheckedChange={onTogglePublic}
                        />
                    </div>
                )}
                <h1 className="text-xl font-normal text-center mb-2">
                    How would you like to get started?
                </h1>
                <p className="text-center text-sm text-muted-foreground mb-8">
                    Choose a starting point for your new video project.
                </p>
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MethodButton method="generate" icon={Sparkles} title="Generate with AI" description="Start with an idea and let AI write the first draft of your script." />
                    <MethodButton method="paste" icon={FileText} title="Paste in a script" description="Already have a script? Paste it here to begin production." />
                    <MethodButton method="template" icon={Palette} title="Remix a template" description="Start from a pre-built structure like a commercial or a short film." />
                </div>
                {activeMethod === 'generate' && (
                    <div className="w-full mt-8 space-y-4">
                        <div className="relative">
                            <Textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., A detective in a neon-lit 1940s city discovers a conspiracy..."
                                className="min-h-28 pr-16"
                            />
                            <Button
                                onClick={handleGenerateScript}
                                className="absolute top-1/2 right-4 -translate-y-1/2"
                                size="icon"
                                disabled={!prompt.trim() || isGeneratingScript}
                            >
                                {isGeneratingScript ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            </Button>
                        </div>
                        <div className="flex justify-center">
                            <Button onClick={handleInspireMe} variant="outline" size="sm">
                                <Dices className="w-4 h-4 mr-2" />
                                Inspire Me
                            </Button>
                        </div>
                    </div>
                )}
                {activeMethod === 'paste' && (
                    <div className="w-full mt-8 space-y-4">
                        <Textarea
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            placeholder="INT. COFFEE SHOP - DAY..."
                            className="min-h-48 font-mono text-sm"
                        />
                        <Button
                            onClick={handleAnalyzeScript}
                            className="w-full"
                            disabled={!script.trim() || isAnalyzingScript}
                        >
                            {isAnalyzingScript ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                            {isAnalyzingScript ? 'Analyzing...' : 'Analyze Script'}
                        </Button>
                    </div>
                )}
                {error && <p className="text-destructive mt-4">{error}</p>}
            </div>
        </>
    );
};