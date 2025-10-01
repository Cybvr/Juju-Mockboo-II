'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { documentService } from '@/lib/documentService';
import { supabase } from '@/lib/supabase';
import DrawingCanvas from './DrawingCanvas';
import { Loader as Loader2 } from 'lucide-react';

function CanvasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = searchParams.get('id');
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserAndLoadDocument();
  }, [documentId]);

  async function checkUserAndLoadDocument() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/');
      return;
    }

    if (!documentId) {
      router.push('/dashboard');
      return;
    }

    try {
      const doc = await documentService.getDocument(documentId);
      if (!doc) {
        router.push('/dashboard');
        return;
      }
      setDocument(doc);
    } catch (error) {
      console.error('Error loading document:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!document) {
    return null;
  }

  return (
    <DrawingCanvas
      documentId={document.id}
      documentName={document.name}
      initialCanvasData={document.canvas_data}
    />
  );
}

export default function CanvasPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    }>
      <CanvasContent />
    </Suspense>
  );
}
