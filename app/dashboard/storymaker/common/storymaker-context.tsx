
"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Template } from "@/data/storymakerTemplatesData" 
import { ProjectConfig, createProjectConfigFromTemplate, defaultProjectConfig } from "@/data/storymakerData"

interface StorymakerContextType {
  documentId: string
  selectedTemplate: Template | null
  projectConfig: ProjectConfig
  setSelectedTemplate: (template: Template) => void
  updateProjectConfig: (config: Partial<ProjectConfig>) => void
  isLoading: boolean
}

const StorymakerContext = createContext<StorymakerContextType | undefined>(undefined)

export function StorymakerProvider({ 
  children, 
  documentId 
}: { 
  children: ReactNode
  documentId: string 
}) {
  const [selectedTemplate, setSelectedTemplateState] = useState<Template | null>(null)
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>(defaultProjectConfig)
  const [isLoading, setIsLoading] = useState(true)

  // Load document-specific data based on documentId
  useEffect(() => {
    const loadDocumentData = () => {
      setIsLoading(true)
      
      // Map document IDs to specific project configurations
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

      // Load config for this specific document
      const docConfig = documentConfigs[documentId]
      if (docConfig) {
        setProjectConfig(prev => ({ ...prev, ...docConfig }))
      } else {
        // For new documents, generate a default config
        setProjectConfig({
          ...defaultProjectConfig,
          projectName: `Story Project ${documentId.split('-').pop() || documentId}`,
          projectDescription: "New video storytelling project"
        })
      }
      
      setIsLoading(false)
    }

    loadDocumentData()
  }, [documentId])

  const setSelectedTemplate = (template: Template) => {
    setSelectedTemplateState(template)
    const newConfig = createProjectConfigFromTemplate(template)
    setProjectConfig(newConfig)
  }

  const updateProjectConfig = (config: Partial<ProjectConfig>) => {
    setProjectConfig(prev => ({ ...prev, ...config }))
  }

  return (
    <StorymakerContext.Provider 
      value={{ 
        documentId,
        selectedTemplate, 
        projectConfig, 
        setSelectedTemplate, 
        updateProjectConfig,
        isLoading
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
