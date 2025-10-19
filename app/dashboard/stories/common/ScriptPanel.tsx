

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, MessageSquare } from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { CommentsInterface } from './CommentsInterface';
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
        </TabsContent>

        <TabsContent value="comments" className="flex-1 flex flex-col m-0">
          <CommentsInterface project={project} onUpdateProject={onUpdateProject} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

