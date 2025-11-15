export interface ProjectSettings {
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
  resolution: '1080p' | '4K';
  fps: 24 | 30 | 60;
  stylePreset: string;
  autoTransitions: boolean;
  backgroundMusic: boolean;
  watermark: boolean;
}

export interface StoryboardScene {
  id: string;
  scene_number: number;
  prompt: string;
  imageUrl: string | null;
  generatedImages?: string[];
  generating: boolean;
  videoUrl: string | null;
  videoGenerating: boolean;
  characterId?: string | null;
  locationId?: string | null;
  soundId?: string | null;
}

export interface Character {
  id: string;
  name:string;
  description: string;
  imageUrl: string | null;
  generatingImage?: boolean;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  generatingImage?: boolean;
}

export interface SoundDesign {
  id: string;
  scene_match: string;
  description: string;
}

export interface FilmProject {
  id: string;
  title: string;
  prompt: string;
  script: string;
  storyboard: StoryboardScene[];
  characters: Character[];
  locations: Location[];
  sound_design: SoundDesign[];
  settings: ProjectSettings;
  category?: string;
  isPublic?: boolean;
  createdAt: number;
  updatedAt: number;
  isTemplate?: boolean;
}

export type Template = Omit<FilmProject, 'id' | 'isTemplate'> & {
    id: string;
    isTemplate: true;
};