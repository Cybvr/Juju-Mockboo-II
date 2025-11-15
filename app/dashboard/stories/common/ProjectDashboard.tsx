import React, { useState, useRef, useEffect } from 'react';
import type { FilmProject } from '@/types/storytypes';
import { Film, Plus, MoreVertical, Edit, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ProjectDashboardProps {
  projects: FilmProject[];
  onCreateProject: () => void;
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, newTitle: string) => void;
  onDuplicateProject: (id: string) => void;
}

const ProjectCard: React.FC<{
    project: FilmProject;
    onClick: () => void;
    onDelete: () => void;
    onRename: () => void;
    onDuplicate: () => void;
}> = ({ project, onClick, onDelete, onRename, onDuplicate }) => {
    const firstImageUrl = project.storyboard?.[0]?.imageUrl;
    const lastUpdated = new Date(project.updatedAt).toLocaleDateString();

    return (
        <Card
            onClick={onClick}
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
        >
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              {firstImageUrl ? (
                <img
                  src={firstImageUrl}
                  alt="Project thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Film className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              {/* Video element with fallback to image */}
              {project.storyboard?.[0]?.videoUrl && (
                <video
                  src={project.storyboard[0].videoUrl}
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  autoPlay
                  muted
                  loop
                  playsInline
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>
            <CardContent className="p-4 flex-grow flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors truncate pr-2">
                            {project.title}
                        </h3>
                        <div className="relative flex-shrink-0">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => e.stopPropagation()}
                                        className="h-8 w-8"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename(); }}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                        className="text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.prompt || (project.script && project.script.substring(0, 100)) || 'No content yet...'}
                    </p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    Updated: {lastUpdated}
                </p>
            </CardContent>
        </Card>
    );
};

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
    projects,
    onCreateProject,
    onSelectProject,
    onDeleteProject,
    onRenameProject,
    onDuplicateProject,
}) => {
    return (
        <div className="w-full max-w-6xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-md font-bold text-foreground">Stories
                </h1>
                <Button onClick={onCreateProject} className="gap-2">
                    <Plus className="w-5 h-5" />           New        </Button>
            </div>
            {projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {projects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onClick={() => onSelectProject(project.id)}
                            onRename={() => {
                                const newTitle = window.prompt("Enter new project title:", project.title);
                                if (newTitle && newTitle.trim() !== "") {
                                    onRenameProject(project.id, newTitle.trim());
                                }
                            }}
                            onDuplicate={() => onDuplicateProject(project.id)}
                            onDelete={() => onDeleteProject(project.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
                    <Film className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-semibold text-foreground">
                        No projects yet
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        Click "New Project" to start building your first film.
                    </p>
                </div>
            )}
        </div>
    );
};