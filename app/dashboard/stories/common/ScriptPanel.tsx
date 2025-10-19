import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, MessageSquare, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommentsInterface } from './CommentsInterface';
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
      setMessage(''); // Clear input on success
    } catch (err: any) {
      console.error("Chat request failed:", err);
      setError(err.message || 'Failed to apply changes. Please try rephrasing your request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-shrink-0 p-2 border-t border-border">
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
  const [activeTab, setActiveTab] = useState('script');

  return (
    <div className="w-full lg:w-1/3 h-96 lg:h-full bg-card rounded-lg sm:rounded-2xl overflow-hidden flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="flex-shrink-0 p-3 border-b border-border">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="script" className="flex items-center gap-2 text-xs">
              <FileText className="w-3 h-3" />
              Script
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2 text-xs">
              <MessageSquare className="w-3 h-3" />
              Comments
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="script" className="flex-1 flex flex-col m-0">
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
        </TabsContent>

        <TabsContent value="comments" className="flex-1 flex flex-col m-0">
          <CommentsInterface project={project} onUpdateProject={onUpdateProject} />
        </TabsContent>
      </Tabs>
    </div>
  );
};