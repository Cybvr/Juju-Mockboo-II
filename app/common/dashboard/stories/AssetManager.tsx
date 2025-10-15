import React, { useState, useCallback } from 'react';
import type { FilmProject, Character, Location, SoundDesign } from '@/types/storytypes';
import { Sparkles, Trash2, User, MapPin, Volume2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { generateSingleImage } from '@/services/filmService';

interface AssetManagerProps {
    project: FilmProject;
    onUpdateProject: (updatedProject: FilmProject) => void;
}

type ActiveAssetTab = 'characters' | 'locations' | 'sound';

const AssetCard: React.FC<{
    id: string;
    field1: string;
    field2: string;
    onUpdate: (id: string, field1: string, field2: string) => void;
    onDelete: (id: string) => void;
    field1Label: string;
    field2Label: string;
    // Image-specific props
    imageUrl?: string | null;
    isGeneratingImage?: boolean;
    onGenerateImage?: (id: string, description: string) => void;
    assetType?: 'character' | 'location';
}> = ({ id, field1, field2, onUpdate, onDelete, field1Label, field2Label, imageUrl, isGeneratingImage, onGenerateImage, assetType }) => {
    const [currentField1, setCurrentField1] = useState(field1);
    const [currentField2, setCurrentField2] = useState(field2);

    const handleBlur = () => {
        if (currentField1 !== field1 || currentField2 !== field2) {
            onUpdate(id, currentField1, currentField2);
        }
    };
    
    const hasImage = assetType === 'character' || assetType === 'location';

    return (
        <Card className="p-4 flex gap-4">
            {hasImage && onGenerateImage && (
                <div className="w-24 h-24 flex-shrink-0 bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                    {isGeneratingImage ? (
                        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : imageUrl === 'error' ? (
                        <p className="text-red-500 text-xs text-center">Error</p>
                    ) : imageUrl ? (
                        <img src={imageUrl} alt={field1} className="w-full h-full object-cover" />
                    ) : (
                        <Button 
                            variant="ghost" 
                            onClick={() => onGenerateImage(id, currentField2)} 
                            disabled={!currentField2.trim()} 
                            className="absolute inset-0 flex flex-col items-center justify-center gap-1 h-full"
                        >
                            <Sparkles className="w-6 h-6" />
                            <span className="text-xs font-semibold">Generate</span>
                        </Button>
                    )}
                </div>
            )}
            <CardContent className="flex-grow flex flex-col space-y-2 p-0">
                 <div className="flex justify-between items-start">
                    <Input
                        value={currentField1}
                        onChange={(e) => setCurrentField1(e.target.value)}
                        onBlur={handleBlur}
                        placeholder={field1Label}
                        className="font-bold bg-transparent border-none focus:ring-1 focus:ring-primary px-1 h-auto"
                    />
                    <Button variant="ghost" size="icon" onClick={() => onDelete(id)} className="text-destructive h-8 w-8">
                        <Trash2 className="w-4 h-4"/>
                    </Button>
                </div>
                <Textarea
                    value={currentField2}
                    onChange={(e) => setCurrentField2(e.target.value)}
                    onBlur={handleBlur}
                    placeholder={field2Label}
                    className="text-sm w-full flex-grow bg-transparent border-none focus:ring-1 focus:ring-primary px-1 resize-none"
                />
            </CardContent>
        </Card>
    );
};


export const AssetManager: React.FC<AssetManagerProps> = ({ project, onUpdateProject }) => {
    const [activeTab, setActiveTab] = useState<ActiveAssetTab>('characters');

    const handleGenerateAssetImage = useCallback(async (assetType: 'character' | 'location', id: string) => {
        let assetList: (Character[] | Location[]);
        let promptPrefix = '';
        let updatedProject: FilmProject;

        if (assetType === 'character') {
            assetList = project.characters;
            promptPrefix = 'Character concept art, portrait of';
            updatedProject = {...project, characters: project.characters.map(c => c.id === id ? { ...c, generatingImage: true } : c)};
        } else {
            assetList = project.locations;
            promptPrefix = 'Environment concept art for';
            updatedProject = {...project, locations: project.locations.map(l => l.id === id ? { ...l, generatingImage: true } : l)};
        }
        
        const asset = assetList.find(a => a.id === id);
        if (!asset || !asset.description) return;

        onUpdateProject(updatedProject);

        try {
            const prompt = `${promptPrefix} ${asset.name}: ${asset.description}.`;
            const imageUrl = await generateSingleImage(prompt, '1:1');
            
            if (assetType === 'character') {
                 onUpdateProject({...project, characters: project.characters.map(c => c.id === id ? { ...c, imageUrl, generatingImage: false } : c)});
            } else {
                 onUpdateProject({...project, locations: project.locations.map(l => l.id === id ? { ...l, imageUrl, generatingImage: false } : l)});
            }
        } catch (error) {
            console.error(`Image generation failed for ${assetType} ${id}:`, error);
             if (assetType === 'character') {
                 onUpdateProject({...project, characters: project.characters.map(c => c.id === id ? { ...c, imageUrl: 'error', generatingImage: false } : c)});
            } else {
                 onUpdateProject({...project, locations: project.locations.map(l => l.id === id ? { ...l, imageUrl: 'error', generatingImage: false } : l)});
            }
        }
    }, [project, onUpdateProject]);


    const handleUpdateCharacter = (id: string, name: string, description: string) => {
        const newCharacters = project.characters.map(c => c.id === id ? {...c, name, description} : c);
        onUpdateProject({...project, characters: newCharacters});
    };
    const handleDeleteCharacter = (id: string) => onUpdateProject({...project, characters: project.characters.filter(c => c.id !== id)});
    const handleAddCharacter = () => {
        const newChar: Character = {id: `char_${Date.now()}`, name: 'New Character', description: '', imageUrl: null, generatingImage: false};
        onUpdateProject({...project, characters: [...project.characters, newChar]});
    };

    const handleUpdateLocation = (id: string, name: string, description: string) => {
        const newLocations = project.locations.map(l => l.id === id ? {...l, name, description} : l);
        onUpdateProject({...project, locations: newLocations});
    };
    const handleDeleteLocation = (id: string) => onUpdateProject({...project, locations: project.locations.filter(l => l.id !== id)});
    const handleAddLocation = () => {
        const newLoc: Location = {id: `loc_${Date.now()}`, name: 'New Location', description: '', imageUrl: null, generatingImage: false};
        onUpdateProject({...project, locations: [...project.locations, newLoc]});
    };
    
    const handleUpdateSound = (id: string, scene_match: string, description: string) => {
        const newSounds = project.sound_design.map(s => s.id === id ? {...s, scene_match, description} : s);
        onUpdateProject({...project, sound_design: newSounds});
    };
    const handleDeleteSound = (id: string) => onUpdateProject({...project, sound_design: project.sound_design.filter(s => s.id !== id)});
    const handleAddSound = () => {
        const newSound: SoundDesign = {id: `sound_${Date.now()}`, scene_match: 'Scene', description: ''};
        onUpdateProject({...project, sound_design: [...project.sound_design, newSound]});
    };

    const onAdd = activeTab === 'characters' ? handleAddCharacter : activeTab === 'locations' ? handleAddLocation : handleAddSound;
    const addLabel = activeTab === 'characters' ? 'Add Character' : activeTab === 'locations' ? 'Add Location' : 'Add Sound Cue';

    return (
         <div className="h-full flex flex-col">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ActiveAssetTab)} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="characters" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Characters ({project.characters.length})
                    </TabsTrigger>
                    <TabsTrigger value="locations" className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Locations ({project.locations.length})
                    </TabsTrigger>
                    <TabsTrigger value="sound" className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />
                        Sound ({project.sound_design.length})
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="characters" className="flex-grow overflow-y-auto pr-2 pt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 content-start">
                    {project.characters.map(c => <AssetCard key={c.id} id={c.id} field1={c.name} field2={c.description} onUpdate={handleUpdateCharacter} onDelete={handleDeleteCharacter} field1Label="Name" field2Label="Description" assetType="character" imageUrl={c.imageUrl} isGeneratingImage={c.generatingImage} onGenerateImage={(id, desc) => handleGenerateAssetImage('character', id)} />)}
                </TabsContent>
                
                <TabsContent value="locations" className="flex-grow overflow-y-auto pr-2 pt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 content-start">
                    {project.locations.map(l => <AssetCard key={l.id} id={l.id} field1={l.name} field2={l.description} onUpdate={handleUpdateLocation} onDelete={handleDeleteLocation} field1Label="Name" field2Label="Description" assetType="location" imageUrl={l.imageUrl} isGeneratingImage={l.generatingImage} onGenerateImage={(id, desc) => handleGenerateAssetImage('location', id)} />)}
                </TabsContent>
                
                <TabsContent value="sound" className="flex-grow overflow-y-auto pr-2 pt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 content-start">
                    {project.sound_design.map(s => <AssetCard key={s.id} id={s.id} field1={s.scene_match} field2={s.description} onUpdate={handleUpdateSound} onDelete={handleDeleteSound} field1Label="Scene Match" field2Label="Sound Description" />)}
                </TabsContent>
                
                <div className="flex-shrink-0 pt-4">
                    <Button onClick={onAdd} className="w-full gap-2" variant="outline">
                        <Plus className="w-5 h-5" />
                        {addLabel}
                    </Button>
                </div>
            </Tabs>
        </div>
    );
};
