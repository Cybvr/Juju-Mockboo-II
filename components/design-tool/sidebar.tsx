import { Button } from '@/components/ui/button';
import { 
  MousePointer, 
  Hand, 
  Pen, 
  Square, 
  Circle, 
  Minus, 
  Triangle, 
  Star, 
  Hexagon, 
  Type, 
  Image 
} from 'lucide-react';
import type { Tool } from '@/hooks/use-canvas';

interface SidebarProps {
  selectedTool: Tool;
  onSelectTool: (tool: Tool) => void;
  onAddShape: (type: 'rectangle' | 'circle' | 'triangle' | 'star' | 'hexagon') => void;
  onAddText: () => void;
  onAddImage: (file: File) => void;
}

export function Sidebar({ selectedTool, onSelectTool, onAddShape, onAddText, onAddImage }: SidebarProps) {
  const tools = [
    { id: 'cursor', icon: MousePointer, label: 'Select' },
    { id: 'hand', icon: Hand, label: 'Pan' },
    { id: 'pen', icon: Pen, label: 'Draw' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'triangle', icon: Triangle, label: 'Triangle' },
    { id: 'star', icon: Star, label: 'Star' },
    { id: 'hexagon', icon: Hexagon, label: 'Hexagon' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'image', icon: Image, label: 'Image' },
  ] as const;

  const handleToolClick = (toolId: string) => {
    if (toolId === 'rectangle' || toolId === 'circle' || toolId === 'triangle' || toolId === 'star' || toolId === 'hexagon') {
      onAddShape(toolId);
    } else if (toolId === 'text') {
      onAddText();
    } else if (toolId === 'image') {
      // Trigger file input for image upload
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          onAddImage(file);
        }
      };
      input.click();
    } else {
      onSelectTool(toolId as Tool);
    }
  };

  return (
    <aside className="w-16 bg-card border-r border-border flex flex-col py-4 z-10">
      <div className="flex flex-col space-y-2 px-2">
        {tools.map(({ id, icon: Icon, label }) => (
          <Button
            key={id}
            variant={selectedTool === id ? "default" : "ghost"}
            size="sm"
            onClick={() => handleToolClick(id)}
            data-testid={`tool-${id}`}
            className={`tool-button ${selectedTool === id ? 'active' : ''}`}
            title={label}
          >
            <Icon className="w-4 h-4" />
          </Button>
        ))}
      </div>
    </aside>
  );
}