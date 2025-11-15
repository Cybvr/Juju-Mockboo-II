import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
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

export const ScriptPanel: React.FC<ScriptPanelProps> = ({
  script,
  onScriptChange,
  onScriptBlur,
  project,
  onUpdateProject
}) => {
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
    <div className="h-screen flex flex-col pb-4">
      {/* Script content */}
      <div className="flex-1 overflow-y-auto h-2/3 p-3">
        <Textarea
          value={script}
          onChange={onScriptChange}
          onBlur={onScriptBlur}
          placeholder="INT. COFFEE SHOP - DAY..."
          className="min-h-full"
        />
      </div>

      {/* Edit script input */}
      <div className="h-1/3 flex-shrink-0 p-3 border-t border-border">
        <div className="flex gap-2">
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
            className="flex-1 text-xs resize-none"
            rows={2}
          />
          <Button
            size="icon"
            className="h-12 w-12"
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      </div>
    </div>
  );
};