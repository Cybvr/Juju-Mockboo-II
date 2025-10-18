'use client';
import React, { useState, useEffect, useCallback } from 'react';
import type { FilmProject } from '@/types/storytypes';
import { ProjectDashboard } from './common/ProjectDashboard';
import { StoryBuilder } from './common/StoryBuilder';
import { CreationHub } from './common/CreationHub';
import { templates } from '@/data/filmTemplates';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  getAllStories,
  createStory,
  updateStory,
  deleteStory,
  duplicateStory
} from '@/services/storiesService';
import { StoryBuilder } from './common/StoryBuilder';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [projects, setProjects] = useState<FilmProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('light');
  const [loading, setLoading] = useState(true);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load projects from Firebase
        const storiesFromFirebase = await getAllStories();
        setProjects(storiesFromFirebase);
        // Load theme from localStorage
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme) {
          setTheme(savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setTheme('dark');
        }
      // Handle importing project from URL
        const hash = window.location.hash;
        if (hash && hash.startsWith('#project=')) {
            const encodedData = hash.substring('#project='.length);
            const decodedData = atob(encodedData);
            const importedProjectData: Omit<FilmProject, 'id' | 'createdAt' | 'updatedAt'> = JSON.parse(decodedData);
            if (importedProjectData) {
                const projectExists = storiesFromFirebase.some(p => p.script === importedProjectData.script && p.prompt === importedProjectData.prompt);
                if (!projectExists) {
                    const importedProject = {
                        ...importedProjectData,
                        title: `Imported: ${importedProjectData.title}`,
                        isTemplate: false,
                    };
                    const newProjectId = await createStory(importedProject);
                    const newProject: FilmProject = {
                        ...importedProject,
                        id: newProjectId,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                    };
                    setProjects(prev => [newProject, ...prev]);
                    setActiveProjectId(newProjectId);
                }
                // Clean the URL hash after import
                window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
            }
        }
      } catch (error) {
        console.error("Failed to load data from Firebase or URL", error);
        // Clean the URL hash if parsing fails
        window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleCreateProject = async () => {
    try {
      const newProjectData = {
        title: 'Untitled Film',
        prompt: '',
        script: '',
        storyboard: [],
        characters: [],
        locations: [],
        sound_design: [],
        settings: {
          aspectRatio: '16:9',
          resolution: '1080p',
          fps: 24,
          stylePreset: 'Cinematic',
          autoTransitions: true,
          backgroundMusic: false,
          watermark: false,
        },
      };
      const newProjectId = await createStory(newProjectData);
      const newProject: FilmProject = {
        ...newProjectData,
        id: newProjectId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setProjects(prevProjects => [newProject, ...prevProjects]);
      setActiveProjectId(newProject.id);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleUpdateProject = useCallback(async (updatedProject: FilmProject) => {
    try {
      await updateStory(updatedProject.id, updatedProject);
      setProjects(prevProjects =>
        prevProjects.map(p => (p.id === updatedProject.id ? { ...updatedProject, updatedAt: Date.now() } : p))
      );
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  }, []);

  const handleSelectProject = (id: string) => {
    window.location.href = `/dashboard/stories/${id}`;
  };

  const handleBackToDashboard = () => {
    setActiveProjectId(null);
  };

  const handleDeleteProject = (id: string) => {
    setDeleteProjectId(id);
  };

  const confirmDeleteProject = async () => {
    if (!deleteProjectId) return;

    const projectIdToDelete = deleteProjectId;
    // Close the dialog immediately to prevent hanging
    setDeleteProjectId(null);

    try {
      await deleteStory(projectIdToDelete);
      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectIdToDelete));
      if (activeProjectId === projectIdToDelete) {
        setActiveProjectId(null);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleRenameProject = async (id: string, newTitle: string) => {
    try {
      await updateStory(id, { title: newTitle.trim() });
      setProjects(prevProjects =>
        prevProjects.map(p =>
          p.id === id ? { ...p, title: newTitle.trim(), updatedAt: Date.now() } : p
        )
      );
    } catch (error) {
      console.error('Failed to rename project:', error);
    }
  };

  const handleDuplicateProject = async (id: string) => {
    try {
      const projectToDuplicate = projects.find(p => p.id === id);
      if (projectToDuplicate) {
        const newProjectId = await duplicateStory(id, `${projectToDuplicate.title} (Copy)`);
        const newProject: FilmProject = {
          ...JSON.parse(JSON.stringify(projectToDuplicate)), // Deep copy
          id: newProjectId,
          title: `${projectToDuplicate.title} (Copy)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isTemplate: false,
        };
        setProjects(prevProjects => [newProject, ...prevProjects]);
      }
    } catch (error) {
      console.error('Failed to duplicate project:', error);
    }
  };

  const renderContent = () => {
    const activeProject = projects.find(p => p.id === activeProjectId);
    if (activeProject) {
      // If the project is brand new (no prompt and no script), show the Creation Hub
      if (!activeProject.prompt && !activeProject.script) {
        return (
            <CreationHub
                project={activeProject}
                templates={templates}
                onUpdateProject={handleUpdateProject}
                onBackToDashboard={handleBackToDashboard}
            />
        );
      }
      // Otherwise, show the full editor
      return (
        <StoryBuilder
          key={activeProject.id}
          project={activeProject}
          onUpdateProject={handleUpdateProject}
          onBackToDashboard={handleBackToDashboard}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      );
    }
    // If no project is active, show the dashboard
    return (
      <ProjectDashboard
        projects={projects}
        onCreateProject={handleCreateProject}
        onSelectProject={handleSelectProject}
        onDeleteProject={handleDeleteProject}
        onRenameProject={handleRenameProject}
        onDuplicateProject={handleDuplicateProject}
      />
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full  transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-foreground">Loading your stories...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full transition-colors duration-300 mx-auto max-w-4xl">
      {renderContent()}

      <AlertDialog open={!!deleteProjectId} onOpenChange={(open) => {
        if (!open) setDeleteProjectId(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Story</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this story? This action cannot be undone and will permanently remove all content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteProjectId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProject}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Story
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

export default App;