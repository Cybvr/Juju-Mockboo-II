import React, { useState } from 'react';
import type { FilmProject } from '@/types/storytypes';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { generateProjectPatch } from '@/services/filmService';

interface ChatInterfaceProps {
  project: FilmProject;
  onUpdateProject: (updatedProject: FilmProject) => void;
}

// Simple JSON patch applicator (supports 'replace', 'add', 'remove')
const applyPatch = (doc: FilmProject, patch: any[]): FilmProject => {
  const newDoc = JSON.parse(JSON.stringify(doc)); // Deep copy to avoid mutation

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


export const ChatInterface: React.FC<ChatInterfaceProps> = ({ project, onUpdateProject }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const patch = await generateProjectPatch(message, project);
      const updatedProject = applyPatch(project, patch);
      onUpdateProject(updatedProject);
      setMessage(''); // Clear input on success
    } catch (err: any) {
      console.error("Chat request failed:", err);
      setError(err.message || 'Failed to apply changes. Please try rephrasing your request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-shrink-0 p-4 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            placeholder="Edit Script"
            className="w-full h-14 p-4 pr-16 text-xs rounded-2xl resize-none"
            rows={1}
          />
          <Button
            type="submit"
            disabled={isLoading || !message.trim()}
            size="icon"
            className="absolute top-1/2 right-4 -translate-y-1/2 h-8 w-8 rounded-full"
            aria-label="Send message"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
          </Button>
        </form>
        {error && <p className="text-destructive text-sm mt-2 text-center">{error}</p>}
      </div>
    </div>
  );
};