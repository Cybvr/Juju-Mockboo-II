"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Template } from "@/data/storymakerTemplatesData" 
import { storiesService, StoryDocument } from "@/services/storiesService"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"

export interface ProjectConfig {
  projectName: string
  projectDescription: string
  aspectRatio: string
  duration: string
  fps: string
  resolution: string
  autoTransitions: boolean
  backgroundMusic: boolean
  autoSave: boolean
  watermark: boolean
  aiModel: string
  stylePreset: string
  variations: string
}

export interface Scene {
  id: string
  name: string
  prompt: string
  variations?: Array<{
    id: string
    imageUrl: string
    timestamp: string
  }>
  videos?: Array<{
    id: string
    videoUrl: string
    thumbnailUrl: string
    status: "pending" | "processing" | "complete" | "error"
    prompt: string
    duration: string
    timestamp: string
  }>
  character?: {
    id: string
    name: string
    imageUrl: string
  }
  location?: {
    id: string
    name: string
    imageUrl: string
  }
  sound?: {
    id: string
    name: string
  }
}

export interface Character {
  id: string
  name: string
  imageUrl: string
  description: string
  traits: string[]
}

export interface Location {
  id: string
  name: string
  imageUrl: string
  description: string
  type: string
}

export interface Sound {
  id: string
  name: string
  description: string
  type: string
  audioUrl?: string
}

const defaultProjectConfig: ProjectConfig = {
  projectName: "New Story Project",
  projectDescription: "A new video storytelling project",
  aspectRatio: "16:9",
  duration: "60",
  fps: "30",
  resolution: "1080p",
  autoTransitions: true,
  backgroundMusic: false,
  autoSave: true,
  watermark: true,
  aiModel: "standard",
  stylePreset: "realistic",
  variations: "4",
}

interface StorymakerContextType {
  documentId: string
  selectedTemplate: Template | null
  projectConfig: ProjectConfig
  scenes: Scene[]
  characters: Character[]
  locations: Location[]
  sounds: Sound[]
  storyData: StoryDocument | null
  setSelectedTemplate: (template: Template) => void
  updateProjectConfig: (config: Partial<ProjectConfig>) => void
  updateScenes: (scenes: Scene[]) => void
  updateCharacters: (characters: Character[]) => void
  updateLocations: (locations: Location[]) => void
  updateSounds: (sounds: Sound[]) => void
  saveStory: () => Promise<void>
  isLoading: boolean
  isSaving: boolean
}

const StorymakerContext = createContext<StorymakerContextType | undefined>(undefined)

export function StorymakerProvider({ 
  children, 
  documentId 
}: { 
  children: ReactNode
  documentId: string 
}) {
  const [user] = useAuthState(auth)
  const [selectedTemplate, setSelectedTemplateState] = useState<Template | null>(null)
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>(defaultProjectConfig)
  const [scenes, setScenes] = useState<Scene[]>([])
  const [characters, setCharacters] = useState<Character[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [sounds, setSounds] = useState<Sound[]>([])
  const [storyData, setStoryData] = useState<StoryDocument | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Simple data loading - no auto-save nonsense
  useEffect(() => {
    const loadStory = async () => {
      if (!user) return

      try {
        const story = await storiesService.getStory(documentId)
        if (story) {
          setStoryData(story)
          setProjectConfig(story.projectConfig || defaultProjectConfig)
          setScenes(story.scenes || [])
          setCharacters(story.characters || [])
          setLocations(story.locations || [])
          setSounds(story.sounds || [])
          setSelectedTemplateState(story.selectedTemplate || null)
        }
      } catch (error) {
        console.error('Load error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStory()
  }, [documentId, user])

  const setSelectedTemplate = (template: Template) => {
    setSelectedTemplateState(template)
    const newConfig = { ...defaultProjectConfig, projectName: template.name, projectDescription: template.description }
    setProjectConfig(newConfig)
  }

  const updateProjectConfig = (updates: Partial<ProjectConfig>) => {
    setProjectConfig(prev => ({ ...prev, ...updates }))
  }

  const updateScenes = (newScenes: Scene[]) => {
    setScenes(newScenes)
  }

  const updateCharacters = (newCharacters: Character[]) => {
    setCharacters(newCharacters)
  }

  const updateLocations = (newLocations: Location[]) => {
    setLocations(newLocations)
  }

  const updateSounds = (newSounds: Sound[]) => {
    setSounds(newSounds)
  }

  const saveStory = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      if (storyData) {
        // Update existing story
        await storiesService.updateStory(documentId, {
          title: projectConfig.projectName,
          description: projectConfig.projectDescription,
          projectConfig,
          scenes,
          characters,
          locations,
          sounds,
          selectedTemplate
        })
      } else {
        // Create new story
        await storiesService.createStory(user.uid, {
          title: projectConfig.projectName,
          description: projectConfig.projectDescription,
          projectConfig,
          scenes,
          characters,
          locations,
          sounds,
          selectedTemplate
        })
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <StorymakerContext.Provider 
      value={{ 
        documentId,
        selectedTemplate,
        projectConfig,
        scenes,
        characters,
        locations,
        sounds,
        storyData,
        setSelectedTemplate,
        updateProjectConfig,
        updateScenes,
        updateCharacters,
        updateLocations,
        updateSounds,
        saveStory,
        isLoading,
        isSaving
      }}
    >
      {children}
    </StorymakerContext.Provider>
  )
}

export function useStorymaker() {
  const context = useContext(StorymakerContext)
  if (context === undefined) {
    throw new Error('useStorymaker must be used within a StorymakerProvider')
  }
  return context
}