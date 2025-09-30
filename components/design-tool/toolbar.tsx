import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Undo, Redo, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ToolbarProps {
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitToScreen: () => void;
}

export function Toolbar({
  zoom,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToScreen,
}: ToolbarProps) {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 z-10">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            disabled={!canUndo}
            onClick={onUndo}
            data-testid="button-undo"
            className="h-8 border-none"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!canRedo}
            onClick={onRedo}
            data-testid="button-redo"
            className="h-8 border-none"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {/* Buttons for adding square and circle shapes have been removed */}
        </div>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onZoomOut}
            data-testid="button-zoom-out"
            className="w-8 h-8 p-0 border-none"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onResetZoom}
            data-testid="button-zoom-reset"
            className="min-w-[50px] h-8 text-sm font-medium border-none"
          >
            {Math.round(zoom)}%
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onZoomIn}
            data-testid="button-zoom-in"
            className="w-8 h-8 p-0 border-none"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onFitToScreen}
            data-testid="button-fit-screen"
            className="w-8 h-8 p-0 border-none"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}