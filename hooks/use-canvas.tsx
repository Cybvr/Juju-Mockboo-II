'use client'

import { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, Rect, Circle, Triangle, Text, FabricImage, Object as FabricObject } from 'fabric';

export type Tool = 'cursor' | 'hand' | 'pen' | 'rectangle' | 'circle' | 'line' | 'triangle' | 'star' | 'hexagon' | 'image';

interface CanvasState {
  selectedTool: Tool;
  selectedObject: FabricObject | null;
  zoom: number;
  history: any[];
  historyIndex: number;
}

export function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  
  const [state, setState] = useState<CanvasState>({
    selectedTool: 'cursor',
    selectedObject: null,
    zoom: 1,
    history: [],
    historyIndex: -1,
  });

  const initCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
    });

    fabricCanvasRef.current = canvas;

    // Handle object selection
    canvas.on('selection:created', (e: any) => {
      setState(prev => ({ ...prev, selectedObject: e.selected?.[0] || null }));
    });

    canvas.on('selection:updated', (e: any) => {
      setState(prev => ({ ...prev, selectedObject: e.selected?.[0] || null }));
    });

    canvas.on('selection:cleared', () => {
      setState(prev => ({ ...prev, selectedObject: null }));
    });

    // Handle object modifications for history
    canvas.on('object:modified', () => {
      saveState();
    });

    return canvas;
  }, []);

  const selectTool = useCallback((tool: Tool) => {
    setState(prev => ({ ...prev, selectedTool: tool }));
    
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Reset canvas interaction mode
    canvas.isDrawingMode = tool === 'pen';
    canvas.selection = tool === 'cursor';
    canvas.forEachObject((obj: any) => {
      obj.selectable = tool === 'cursor';
    });

    if (tool === 'hand') {
      canvas.selection = false;
      canvas.defaultCursor = 'grab';
    } else {
      canvas.defaultCursor = 'default';
    }

    canvas.renderAll();
  }, []);

  const addShape = useCallback((type: 'rectangle' | 'circle' | 'triangle' | 'star' | 'hexagon') => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let shape: FabricObject;

    switch (type) {
      case 'rectangle':
        shape = new Rect({
          left: 100,
          top: 100,
          width: 100,
          height: 100,
          fill: '#164e63',
          stroke: '#000000',
          strokeWidth: 1,
        });
        break;
      case 'circle':
        shape = new Circle({
          left: 100,
          top: 100,
          radius: 50,
          fill: '#164e63',
          stroke: '#000000',
          strokeWidth: 1,
        });
        break;
      case 'triangle':
        shape = new Triangle({
          left: 100,
          top: 100,
          width: 100,
          height: 100,
          fill: '#164e63',
          stroke: '#000000',
          strokeWidth: 1,
        });
        break;
      default:
        return;
    }

    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
    saveState();
  }, []);

  const addText = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const text = new Text('Text', {
      left: 100,
      top: 100,
      fontSize: 20,
      fill: '#164e63',
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    saveState();
  }, []);

  const addImage = useCallback((fileOrUrl: File | string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (typeof fileOrUrl === 'string') {
      // Handle URL string
      const imgElement = document.createElement('img');
      imgElement.crossOrigin = 'anonymous';
      imgElement.onload = () => {
        FabricImage.fromURL(imgElement.src).then((img) => {
          // Scale image to fit reasonably on canvas
          const maxWidth = 400;
          const maxHeight = 400;
          const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!, 1);
          
          img.set({
            left: (canvas.width! - img.width! * scale) / 2,
            top: (canvas.height! - img.height! * scale) / 2,
            scaleX: scale,
            scaleY: scale,
          });

          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
          saveState();
        });
      };
      imgElement.src = fileOrUrl;
    } else {
      // Handle File object
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgElement = document.createElement('img');
        imgElement.onload = () => {
          FabricImage.fromURL(imgElement.src).then((img) => {
            // Scale image to fit reasonably on canvas
            const maxWidth = 400;
            const maxHeight = 400;
            const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!, 1);
            
            img.set({
              left: (canvas.width! - img.width! * scale) / 2,
              top: (canvas.height! - img.height! * scale) / 2,
              scaleX: scale,
              scaleY: scale,
            });

            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
            saveState();
          });
        };
        imgElement.src = e.target?.result as string;
      };
      reader.readAsDataURL(fileOrUrl);
    }
  }, []);

  const deleteSelected = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
      saveState();
    }
  }, []);

  const updateObjectProperty = useCallback((property: string, value: any) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set(property, value);
      canvas.renderAll();
    }
  }, []);

  const zoomIn = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const zoom = Math.min(canvas.getZoom() * 1.1, 3);
    canvas.setZoom(zoom);
    setState(prev => ({ ...prev, zoom: zoom * 100 }));
  }, []);

  const zoomOut = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const zoom = Math.max(canvas.getZoom() * 0.9, 0.1);
    canvas.setZoom(zoom);
    setState(prev => ({ ...prev, zoom: zoom * 100 }));
  }, []);

  const resetZoom = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.setZoom(1);
    setState(prev => ({ ...prev, zoom: 100 }));
  }, []);

  const fitToScreen = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.setZoom(1);
    setState(prev => ({ ...prev, zoom: 100 }));
  }, []);

  const saveState = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const currentState = JSON.stringify(canvas.toJSON());
    setState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(currentState);
      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const undo = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || state.historyIndex <= 0) return;

    const newIndex = state.historyIndex - 1;
    const previousState = state.history[newIndex];
    
    canvas.loadFromJSON(previousState, () => {
      canvas.renderAll();
      setState(prev => ({ ...prev, historyIndex: newIndex }));
    });
  }, [state.historyIndex, state.history]);

  const redo = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || state.historyIndex >= state.history.length - 1) return;

    const newIndex = state.historyIndex + 1;
    const nextState = state.history[newIndex];
    
    canvas.loadFromJSON(nextState, () => {
      canvas.renderAll();
      setState(prev => ({ ...prev, historyIndex: newIndex }));
    });
  }, [state.historyIndex, state.history]);

  const exportCanvas = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return null;

    return canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });
  }, []);

  useEffect(() => {
    const canvas = initCanvas();
    if (canvas) {
      saveState(); // Save initial state
    }

    return () => {
      if (canvas) {
        canvas.dispose();
      }
    };
  }, [initCanvas]);

  return {
    canvasRef,
    canvas: fabricCanvasRef.current,
    state,
    selectTool,
    addShape,
    addText,
    addImage,
    deleteSelected,
    updateObjectProperty,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    undo,
    redo,
    exportCanvas,
  };
}