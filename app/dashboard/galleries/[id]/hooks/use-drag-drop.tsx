
import { useState, useCallback } from 'react';

interface UseDragDropProps {
  onFileDrop: (files: FileList) => void;
  acceptedTypes?: string[];
}

export function useDragDrop({ onFileDrop, acceptedTypes = ['image/*', 'video/*'] }: UseDragDropProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Filter files by accepted types if specified
      const validFiles = Array.from(files).filter(file => 
        acceptedTypes.some(type => file.type.match(type.replace('*', '.*')))
      );
      
      if (validFiles.length > 0) {
        const fileList = new DataTransfer();
        validFiles.forEach(file => fileList.items.add(file));
        onFileDrop(fileList.files);
      }
    }
  }, [onFileDrop, acceptedTypes]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const dragHandlers = {
    onDrop: handleDrop,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
  };

  return {
    isDragging,
    dragHandlers,
  };
}
