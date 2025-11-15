'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { FilmProject } from '@/types/storytypes';
import { ProjectDashboard } from './common/ProjectDashboard';
import { StoryBuilder } from './common/StoryBuilder';
import { CreationHub } from './common/CreationHub';
import { templates } from '@/data/filmTemplates';
import {
  getAllStories,
  createStory,
  updateStory,
  duplicateStory,
  deleteStory,
} from '@/services/storiesService';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [projects, setProjects] = useState<FilmProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('light');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // ---------------- Load Projects & Theme ----------------
  useEffect(() => {
    const loadData = async () => {
      try {
        const storiesFromFirebase = await getAllStories();
        setProjects(storiesFromFirebase);

        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme) {
          setTheme(savedTheme);
        } else if (
          window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches
        ) {
          setTheme('dark');
        }

        const hash = window.location.hash;
        if (hash && hash.startsWith('#project=')) {
          const encodedData = hash.substring('#project='.length);
          const decodedData = atob(encodedData);
          const importedProjectData: Omit<FilmProject, 'id' | 'createdAt' | 'updatedAt'> =
            JSON.parse(decodedData);

          if (importedProjectData) {
            const projectExists = storiesFromFirebase.some(
              (p) =>
                p.script === importedProjectData.script &&
                p.prompt === importedProjectData.prompt
            );

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

              setProjects((prev) => [newProject, ...prev]);
              setActiveProjectId(newProjectId);
            }

            window.history.replaceState(
              null,
              document.title,
              window.location.pathname + window.location.search
            );
          }
        }
      } catch (error) {
        console.error('Failed to load data from Firebase or URL', error);
        window.history.replaceState(
          null,
          document.title,
          window.location.pathname + window.location.search
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ---------------- Theme Handling ----------------
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleToggleTheme = () =>
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  // ---------------- Project CRUD ----------------
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

      setProjects((prev) => [newProject, ...prev]);
      setActiveProjectId(newProject.id);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleUpdateProject = useCallback(async (updatedProject: FilmProject) => {
    try {
      await updateStory(updatedProject.id, updatedProject);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === updatedProject.id
            ? { ...updatedProject, updatedAt: Date.now() }
            : p
        )
      );
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  }, []);

  const handleSelectProject = (id: string) => {
    window.location.href = `/dashboard/stories/${id}`;
  };

  const handleBackToDashboard = () => setActiveProjectId(null);

  const handleRenameProject = async (id: string, newTitle: string) => {
    try {
      await updateStory(id, { title: newTitle.trim() });
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, title: newTitle.trim(), updatedAt: Date.now() } : p
        )
      );
    } catch (error) {
      console.error('Failed to rename project:', error);
    }
  };

  const handleDuplicateProject = async (id: string) => {
    try {
      const projectToDuplicate = projects.find((p) => p.id === id);
      if (!projectToDuplicate) return;

      const newProjectId = await duplicateStory(
        id,
        `${projectToDuplicate.title} (Copy)`
      );

      const newProject: FilmProject = {
        ...JSON.parse(JSON.stringify(projectToDuplicate)),
        id: newProjectId,
        title: `${projectToDuplicate.title} (Copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isTemplate: false,
      };

      setProjects((prev) => [newProject, ...prev]);
    } catch (error) {
      console.error('Failed to duplicate project:', error);
    }
  };

  const handleDeleteProject = (id: string) => {
    setProjectToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      await deleteStory(projectToDelete);
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete));

      if (activeProjectId === projectToDelete) {
        setActiveProjectId(null);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }

    // Always close dialog, even on error
    closeDeleteDialog();
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  // ---------------- Render Sections ----------------
  const renderContent = () => {
    const activeProject = projects.find((p) => p.id === activeProjectId);

    if (activeProject) {
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

    return (
      <ProjectDashboard
        projects={projects}
        onCreateProject={handleCreateProject}
        onSelectProject={handleSelectProject}
        onRenameProject={handleRenameProject}
        onDuplicateProject={handleDuplicateProject}
        onDeleteProject={handleDeleteProject}
      />
    );
  };

  // ---------------- UI ----------------
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-foreground">Loading your stories...</p>
        </div>
      </div>
    );
  }

  const projectToDeleteTitle = projectToDelete
    ? projects.find((p) => p.id === projectToDelete)?.title
    : '';

  return (
    <main className="min-h-screen w-full transition-colors duration-300 mx-auto max-w-4xl" suppressHydrationWarning>
      {renderContent()}

      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop - clicking closes dialog */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={closeDeleteDialog}
          />

          {/* Dialog Content */}
          <div className="relative bg-background border rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Delete Project</h3>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete "{projectToDeleteTitle}"? This action cannot be undone.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0">
              <button
                onClick={closeDeleteDialog}
                className="px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default App;