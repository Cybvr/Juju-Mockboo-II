
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { ChatInterface } from './ChatInterface';
import type { FilmProject } from '@/types/storytypes';

interface ScriptPanelProps {
  script: string;
  onScriptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onScriptBlur: () => void;
  project: FilmProject;
  onUpdateProject: (updatedProject: FilmProject) => void;
}

export const ScriptPanel: React.FC<ScriptPanelProps> = ({
  script,
  onScriptChange,
  onScriptBlur,
  project,
  onUpdateProject
}) => {
  return (
    <div className="w-full lg:w-1/3 h-96 lg:h-full bg-card rounded-lg sm:rounded-2xl overflow-hidden flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 md:p-6">
        <Textarea
          value={script}
          onChange={onScriptChange}
          onBlur={onScriptBlur}
          placeholder="INT. COFFEE SHOP - DAY..."
          className="w-full h-full min-h-[200px] p-2 text-xs sm:text-sm bg-transparent resize-none border-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="border-t border-border">
        <ChatInterface project={project} onUpdateProject={onUpdateProject} />
      </div>
    </div>
  );
};
