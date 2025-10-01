'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, Rect, PencilBrush } from 'fabric';
import { Button } from '@/components/ui/button';
import { Pencil, Square, Circle, ZoomIn, ZoomOut, RotateCcw, Chrome as Home, Share2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { documentService } from '@/lib/documentService';
import { useRouter } from 'next/navigation';

interface DrawingCanvasProps {
  documentId: string;
  documentName: string;
  initialCanvasData?: any;
}

type DrawingTool = 'pen' | 'rectangle' | 'square' | 'select';

export default function DrawingCanvas({ documentId, documentName, initialCanvasData }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<DrawingTool>('select');
  const [zoom, setZoom] = useState(1);
  const [name, setName] = useState(documentName);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight - 120,
      backgroundColor: '#ffffff',
    });

    fabricCanvasRef.current = canvas;

    if (initialCanvasData && Object.keys(initialCanvasData).length > 0) {
      canvas.loadFromJSON(initialCanvasData, () => {
        canvas.renderAll();
      });
    }

    canvas.on('object:modified', handleCanvasChange);
    canvas.on('object:added', handleCanvasChange);
    canvas.on('object:removed', handleCanvasChange);

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = activeTool === 'pen';

    if (activeTool === 'pen' && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = '#000000';
      canvas.freeDrawingBrush.width = 2;
    }
  }, [activeTool]);

  function handleCanvasChange() {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveCanvas();
    }, 1000);
  }

  async function saveCanvas() {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    try {
      const json = canvas.toJSON();
      await documentService.updateDocument(documentId, {
        canvas_data: json,
        name: name
      });
    } catch (error) {
      console.error('Error saving canvas:', error);
    }
  }

  function handleToolClick(tool: DrawingTool) {
    setActiveTool(tool);
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (tool === 'rectangle') {
      const rect = new Rect({
        left: 100,
        top: 100,
        width: 200,
        height: 100,
        fill: 'transparent',
        stroke: '#000000',
        strokeWidth: 2,
      });
      canvas.add(rect);
      canvas.setActiveObject(rect);
      setActiveTool('select');
    } else if (tool === 'square') {
      const square = new Rect({
        left: 100,
        top: 100,
        width: 150,
        height: 150,
        fill: 'transparent',
        stroke: '#000000',
        strokeWidth: 2,
      });
      canvas.add(square);
      canvas.setActiveObject(square);
      setActiveTool('select');
    }
  }

  function handleZoomIn() {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const newZoom = Math.min(zoom + 0.1, 3);
    setZoom(newZoom);
    canvas.setZoom(newZoom);
  }

  function handleZoomOut() {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const newZoom = Math.max(zoom - 0.1, 0.1);
    setZoom(newZoom);
    canvas.setZoom(newZoom);
  }

  function handleResetZoom() {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    setZoom(1);
    canvas.setZoom(1);
    canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    canvas.renderAll();
  }

  function handleHome() {
    saveCanvas().then(() => {
      router.push('/dashboard');
    });
  }

  function handleShare() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  }

  function handleSendMessage() {
    if (!message.trim()) return;
    console.log('Message:', message);
    setMessage('');
  }

  return (
    <div className="relative w-full h-screen bg-slate-100">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white rounded-lg shadow-lg px-4 py-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={saveCanvas}
          className="w-64 border-0 focus-visible:ring-0 font-medium"
        />
        <Button variant="ghost" size="icon" onClick={handleHome}>
          <Home className="w-4 h-4" />
        </Button>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <Button onClick={handleShare} className="shadow-lg">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>

      <div className="absolute top-20 left-4 z-10 flex flex-col gap-2 bg-white rounded-lg shadow-lg p-2">
        <Button
          variant={activeTool === 'select' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setActiveTool('select')}
        >
          <Circle className="w-4 h-4" />
        </Button>
        <Button
          variant={activeTool === 'pen' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => handleToolClick('pen')}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant={activeTool === 'rectangle' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => handleToolClick('rectangle')}
        >
          <Square className="w-4 h-4" />
        </Button>
        <Button
          variant={activeTool === 'square' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => handleToolClick('square')}
        >
          <Square className="w-4 h-4" />
        </Button>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 right-4 z-10 flex flex-col gap-2 bg-white rounded-lg shadow-lg p-2">
        <Button variant="ghost" size="icon" onClick={handleZoomIn}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <div className="text-xs text-center px-2 py-1 text-slate-600 font-medium">
          {Math.round(zoom * 100)}%
        </div>
        <Button variant="ghost" size="icon" onClick={handleZoomOut}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <div className="h-px bg-slate-200 my-1" />
        <Button variant="ghost" size="icon" onClick={handleResetZoom}>
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4">
        <div className="bg-white rounded-lg shadow-lg p-4 flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            className="resize-none"
            rows={2}
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </div>

      <canvas ref={canvasRef} />
    </div>
  );
}
