
"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Template } from "@/data/storymakerTemplatesData" 
import { ProjectConfig, createProjectConfigFromTemplate, defaultProjectConfig, Scene, Character, Location, Sound } from "@/data/storymakerData"
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
          // Create new story with default or preset configs
          const documentConfigs: Record<string, Partial<ProjectConfig>> = {
            "lumiere-parfum": {
              projectName: "Lumière Parfum Studio",
              projectDescription: "Elegant fragrance commercial showcasing the artistry and sophistication of Lumière Parfum through cinematic storytelling",
              stylePreset: "cinematic",
              aiModel: "high"
            },
            "product-launch": {
              projectName: "Product Launch Campaign", 
              projectDescription: "Dynamic product reveal campaign with multiple character perspectives",
              stylePreset: "realistic",
              aiModel: "high"
            },
            "travel-adventure": {
              projectName: "Paris Travel Story",
              projectDescription: "Cinematic travel documentary through the streets of Paris", 
              stylePreset: "documentary",
              aiModel: "standard"
            }
          }

          const docConfig = documentConfigs[documentId]
          const newConfig = docConfig ? { ...defaultProjectConfig, ...docConfig } : {
            ...defaultProjectConfig,
            projectName: `Story Project ${documentId.split('-').pop() || documentId}`,
            projectDescription: "New video storytelling project"
          }

          setProjectConfig(newConfig)
          
          // Auto-save new story
          const newStoryId = await storiesService.createStory(user.uid, {
            title: newConfig.projectName,
            description: newConfig.projectDescription,
            projectConfig: newConfig,
            scenes: [],
            characters: [],
            locations: [],
            sounds: []
          })
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
    if (!user) return
    
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

  const updateProjectConfig = async (config: Partial<ProjectConfig>) => {
    const newConfig = { ...projectConfig, ...config }
    setProjectConfig(newConfig)
    
    if (user) {
      try {
        await storiesService.updateProjectConfig(documentId, newConfig)
      } catch (error) {
        console.error('Error updating project config:', error)
      }
    }
  }

  const updateScenes = async (newScenes: Scene[]) => {
    setScenes(newScenes)
    
    if (user) {
      try {
        await storiesService.updateScenes(documentId, newScenes)
      } catch (error) {
        console.error('Error updating scenes:', error)
      }
    }
  }

  const updateCharacters = async (newCharacters: Character[]) => {
    setCharacters(newCharacters)
    
    if (user) {
      try {
        await storiesService.updateCharacters(documentId, newCharacters)
      } catch (error) {
        console.error('Error updating characters:', error)
      }
    }
  }

  const updateLocations = async (newLocations: Location[]) => {
    setLocations(newLocations)
    
    if (user) {
      try {
        await storiesService.updateLocations(documentId, newLocations)
      } catch (error) {
        console.error('Error updating locations:', error)
      }
    }
  }

  const updateSounds = async (newSounds: Sound[]) => {
    setSounds(newSounds)
    
    if (user) {
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
