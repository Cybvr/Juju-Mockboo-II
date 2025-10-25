
"use client"

import { use } from "react"
import { useState, useEffect } from "react"
import { getStoryById, updateStory } from "@/services/storiesService"
import type { FilmProject } from "@/types/storytypes"
import { StoryBuilder } from "../common/StoryBuilder"
import { CreationHub } from "../common/CreationHub"
import { templates } from "@/data/filmTemplates"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

interface StoryPageProps {
  params: Promise<{ id: string }>
}

export default function StoryPage({ params }: StoryPageProps) {
  const { id } = use(params)
  const [project, setProject] = useState<FilmProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const router = useRouter()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    const loadProject = async () => {
      try {
        const story = await getStoryById(id)
        if (story) {
          setProject(story)
        } else {
          router.push('/dashboard/stories')
        }
      } catch (error) {
        console.error('Failed to load story:', error)
        router.push('/dashboard/stories')
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [id, router])

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
    }
  }, [])

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const handleUpdateProject = async (updatedProject: FilmProject) => {
    try {
      await updateStory(updatedProject.id, updatedProject)
      setProject({ ...updatedProject, updatedAt: Date.now() })
    } catch (error) {
      console.error('Failed to update project:', error)
    }
  }

  const handleBackToDashboard = () => {
    router.push('/dashboard/stories')
  }

  const handleToggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'))
  }

  const handleTogglePublic = async () => {
    if (!project || !isAdmin) return
    
    const updatedProject = {
      ...project,
      isPublic: !project.isPublic
    }
    
    try {
      await updateStory(project.id, updatedProject)
      setProject(updatedProject)
    } catch (error) {
      console.error('Failed to update public status:', error)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen w-full  transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-foreground">Loading story...</p>
        </div>
      </main>
    )
  }

  if (!project) {
    return null
  }

  // If the project is brand new (no prompt and no script), show the Creation Hub
  if (!project.prompt && !project.script) {
    return (
      <CreationHub
        project={project}
        templates={templates}
        onUpdateProject={handleUpdateProject}
        onBackToDashboard={handleBackToDashboard}
        isAdmin={isAdmin}
        onTogglePublic={handleTogglePublic}
      />
    )
  }

  // Otherwise, show the full editor
  return (
    <StoryBuilder
      key={project.id}
      project={project}
      onUpdateProject={handleUpdateProject}
      onBackToDashboard={handleBackToDashboard}
      theme={theme}
      onToggleTheme={handleToggleTheme}
      isAdmin={isAdmin}
      onTogglePublic={handleTogglePublic}
    />
  )
}
