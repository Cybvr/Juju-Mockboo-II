
"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { Template } from "@/data/storymakerTemplatesData" 
import { ProjectConfig, createProjectConfigFromTemplate, defaultProjectConfig } from "@/data/storymakerData"

interface StorymakerContextType {
  selectedTemplate: Template | null
  projectConfig: ProjectConfig
  setSelectedTemplate: (template: Template) => void
  updateProjectConfig: (config: Partial<ProjectConfig>) => void
}

const StorymakerContext = createContext<StorymakerContextType | undefined>(undefined)

export function StorymakerProvider({ children }: { children: ReactNode }) {
  const [selectedTemplate, setSelectedTemplateState] = useState<Template | null>(null)
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>(defaultProjectConfig)

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
        selectedTemplate, 
        projectConfig, 
        setSelectedTemplate, 
        updateProjectConfig 
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
