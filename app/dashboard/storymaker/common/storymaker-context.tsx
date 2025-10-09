"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from "react"
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
  storyData: StoryDocument | null
  updateStoryData: (updates: Partial<StoryDocument>) => void
  isLoading: boolean
  saveError: string | null
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
  const [storyData, setStoryData] = useState<StoryDocument | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load story data
  useEffect(() => {
    const loadStory = async () => {
      if (!user) return

      try {
        const story = await storiesService.getStory(documentId)
        if (story) {
          setStoryData(story)
        } else {
          // Create new story if it doesn't exist
          const newStoryId = await storiesService.createStory(user.uid, {
            title: defaultProjectConfig.projectName,
            description: defaultProjectConfig.projectDescription,
            projectConfig: defaultProjectConfig,
            scenes: [],
            characters: [],
            locations: [],
            sounds: [],
          })
          const newStory = await storiesService.getStory(newStoryId)
          setStoryData(newStory)
        }
      } catch (error) {
        console.error('Load error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStory()
  }, [documentId, user])

  // Track last saved data for change detection
  const lastSavedDataRef = useRef<string>('')
  const [saveError, setSaveError] = useState<string | null>(null)

  // Auto-save when data actually changes
  useEffect(() => {
    if (!storyData || !user || isLoading) return

    const saveData = async () => {
      try {
        const currentDataString = JSON.stringify(storyData)
        // Only save if data actually changed
        if (currentDataString === lastSavedDataRef.current) return

        const cleanedData = cleanUndefinedValues(storyData)
        await storiesService.updateStory(documentId, cleanedData)
        lastSavedDataRef.current = currentDataString
        setSaveError(null) // Clear any previous errors
      } catch (error) {
        console.error('Auto-save error:', error)
        setSaveError('Failed to save changes. Please try again.')
      }
    }

    const timeoutId = setTimeout(saveData, 1000) // Debounce saves
    return () => clearTimeout(timeoutId)
  }, [storyData, documentId, user, isLoading])

  // Helper function to recursively clean undefined values
  const cleanUndefinedValues = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return null
    }
    
    if (Array.isArray(obj)) {
      return obj.map(cleanUndefinedValues)
    }
    
    if (typeof obj === 'object') {
      const cleaned: any = {}
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = cleanUndefinedValues(value)
        }
      }
      return cleaned
    }
    
    return obj
  }

  const updateStoryData = useCallback(async (updates: Partial<StoryDocument>) => {
    if (!storyData) return

    const newData = { ...storyData, ...updates }
    setStoryData(newData)

    try {
      // Deep clean undefined values before sending to Firestore
      const cleanUpdates = cleanUndefinedValues(updates)
      await storiesService.updateStory(documentId, cleanUpdates)
      setSaveError(null)
    } catch (error) {
      console.error('Failed to save changes:', error)
      setSaveError('Failed to save changes. Please try again.')
    }
  }, [storyData, documentId])


  const value = {
    storyData,
    selectedTemplate: storyData?.selectedTemplate || null,
    projectConfig: storyData?.projectConfig || {
      projectName: "",
      projectDescription: "",
      aspectRatio: "16:9",
      duration: "30",
      fps: "30",
      resolution: "1920x1080",
      autoTransitions: true,
      backgroundMusic: false,
      autoSave: true,
      watermark: false,
      aiModel: "flux-dev",
      stylePreset: "photorealistic",
      variations: "4"
    },
    scenes: storyData?.scenes || [],
    characters: storyData?.characters || [],
    locations: storyData?.locations || [],
    sounds: storyData?.sounds || [],
    updateStoryData,
    updateProjectConfig: (config: ProjectConfig) => updateStoryData({ projectConfig: config }),
    updateScenes: (scenes: Scene[]) => updateStoryData({ scenes }),
    updateCharacters: (characters: Character[]) => updateStoryData({ characters }),
    updateLocations: (locations: Location[]) => updateStoryData({ locations }),
    updateSounds: (sounds: Sound[]) => updateStoryData({ sounds }),
    setSelectedTemplate: (template: Template) => updateStoryData({ selectedTemplate: template }),
    isLoading,
    saveError
  }


  return (
    <StorymakerContext.Provider
      value={value}
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