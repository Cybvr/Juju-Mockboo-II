import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { FileText, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { generateProjectPatch } from '@/services/filmService';
import type { FilmProject } from '@/types/storytypes';

interface ScriptPanelProps {
  script: string;
  onScriptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onScriptBlur: () => void;
  project: FilmProject;
  onUpdateProject: (updatedProject: FilmProject) => void;
}

interface ChatInterfaceProps {
  project: FilmProject;
  onUpdateProject: (updatedProject: FilmProject) => void;
}

const applyPatch = (doc: FilmProject, patch: any[]): FilmProject => {
  const newDoc = JSON.parse(JSON.stringify(doc));

  patch.forEach(operation => {
    try {
        const pathParts = operation.path.split('/').slice(1);
        let parent = newDoc as any;

        for (let i = 0; i < pathParts.length - 1; i++) {
          parent = parent[pathParts[i]];
        }

        const finalKey = pathParts[pathParts.length - 1];

        switch (operation.op) {
          case 'replace':
            parent[finalKey] = operation.value;
            break;
          case 'add':
             if (Array.isArray(parent)) {
                if (finalKey === '-') {
                    parent.push(operation.value);
                } else {
                    parent.splice(parseInt(finalKey, 10), 0, operation.value);
                }
            } else if (Array.isArray(parent[finalKey])) {
                 parent[finalKey].push(operation.value);
            } else {
              parent[finalKey] = operation.value;
            }
            break;
          case 'remove':
             if (Array.isArray(parent)) {
              parent.splice(parseInt(finalKey, 10), 1);
            } else {
              delete parent[finalKey];
            }
            break;
          default:
            console.warn(`Unsupported patch op: ${operation.op}`);
        }
    } catch (e) {
        console.error("Failed to apply patch operation:", operation, e);
    }
  });

  return newDoc;
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ project, onUpdateProject }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const patch = await generateProjectPatch(message, project);
      const updatedProject = applyPatch(project, patch);
      onUpdateProject(updatedProject);
      setMessage('');
    } catch (err: any) {
      console.error("Chat request failed:", err);
      setError(err.message || 'Failed to apply changes. Please try rephrasing your request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-2 border-t border-border">
      <div className="relative">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Edit Script"
          className="w-full h-9 py-2 pl-3 pr-10 text-xs rounded-lg resize-none"
          rows={1}
        />
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !message.trim()}
          size="icon"
          className="absolute top-1/2 right-1.5 -translate-y-1/2 h-6 w-6 rounded-full"
          aria-label="Send message"
        >
          {isLoading ? (
            <div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <ArrowUp className="w-3 h-3" />
          )}
        </Button>
        {error && <p className="text-destructive text-xs mt-1">{error}</p>}
      </div>
    </div>
  );
};

export const ScriptPanel: React.FC<ScriptPanelProps> = ({
  script,
  onScriptChange,
  onScriptBlur,
  project,
  onUpdateProject
}) => {
  return (
    <div className="w-full rounded-lg sm:rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="flex-shrink-0 p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <h3 className="font-medium">Script</h3>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
        <Textarea
          value={script}
          onChange={onScriptChange}
          onBlur={onScriptBlur}
          placeholder="INT. COFFEE SHOP - DAY..."
          className="w-full h-full p-2 text-xs sm:text-sm bg-transparent resize-none border-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <ChatInterface project={project} onUpdateProject={onUpdateProject} />
    </div>
  );
};