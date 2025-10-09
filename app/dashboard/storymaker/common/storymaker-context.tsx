"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Template } from "@/data/storymakerTemplatesData" 

// Inline types since we moved to Firebase
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

const createProjectConfigFromTemplate = (template: Template): ProjectConfig => {
  return {
    ...defaultProjectConfig,
    projectName: template.name,
    projectDescription: template.description,
  }
}
import { storiesService, StoryDocument } from "@/services/storiesService"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"

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

  // Load story from Firebase
  useEffect(() => {
    const loadStoryData = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      // Wait for auth to fully initialize
      await new Promise(resolve => setTimeout(resolve, 100))

      setIsLoading(true)

      try {
        // Try to load existing story
        const story = await storiesService.getStory(documentId)

        if (story && story.userId === user.uid) {
          // Load existing story
          setStoryData(story)
          setProjectConfig(story.projectConfig)
          setScenes(story.scenes || [])
          setCharacters(story.characters || [])
          setLocations(story.locations || [])
          setSounds(story.sounds || [])
          if (story.selectedTemplate) {
            setSelectedTemplateState(story.selectedTemplate)
          }
        } else {
          // Create new story with default config
          setProjectConfig(defaultProjectConfig)

          // Auto-save new story
          const newStoryId = await storiesService.createStory(user.uid, {
            title: defaultProjectConfig.projectName,
            description: defaultProjectConfig.projectDescription,
            projectConfig: defaultProjectConfig,
            scenes: [],
            characters: [],
            locations: [],
            sounds: []
          })

          // Load the newly created story
          const newStory = await storiesService.getStory(newStoryId)
          if (newStory) {
            setStoryData(newStory)
          }
        }
      } catch (error) {
        console.error('Error loading story:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStoryData()
  }, [documentId, user])

  const setSelectedTemplate = async (template: Template) => {
    if (!user || !storyData) return

    setSelectedTemplateState(template)
    const newConfig = createProjectConfigFromTemplate(template)
    setProjectConfig(newConfig)

    try {
      await storiesService.setTemplate(documentId, template)
      await storiesService.updateProjectConfig(documentId, newConfig)
    } catch (error) {
      console.error('Error setting template:', error)
    }
  }

  const updateProjectConfig = async (updates: Partial<ProjectConfig>) => {
    const newConfig = { ...projectConfig, ...updates }
    setProjectConfig(newConfig)

    if (user && storyData) {
      try {
        await storiesService.updateProjectConfig(documentId, newConfig)
      } catch (error) {
        console.error('Error updating project config:', error)
      }
    }
  }

  const updateScenes = async (newScenes: Scene[]) => {
    setScenes(newScenes)

    if (user && storyData) {
      try {
        await storiesService.updateScenes(documentId, newScenes)
      } catch (error) {
        console.error('Error updating scenes:', error)
      }
    }
  }

  const updateCharacters = async (newCharacters: Character[]) => {
    setCharacters(newCharacters)

    if (user && storyData) {
      try {
        await storiesService.updateCharacters(documentId, newCharacters)
      } catch (error) {
        console.error('Error updating characters:', error)
      }
    }
  }

  const updateLocations = async (newLocations: Location[]) => {
    setLocations(newLocations)

    if (user && storyData) {
      try {
        await storiesService.updateLocations(documentId, newLocations)
      } catch (error) {
        console.error('Error updating locations:', error)
      }
    }
  }

  const updateSounds = async (newSounds: Sound[]) => {
    setSounds(newSounds)

    if (user && storyData) {
      try {
        await storiesService.updateSounds(documentId, newSounds)
      } catch (error) {
        console.error('Error updating sounds:', error)
      }
    }
  }

  const saveStory = async () => {
    if (!user) return

    setIsSaving(true)
    try {
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
    } catch (error) {
      console.error('Error saving story:', error)
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