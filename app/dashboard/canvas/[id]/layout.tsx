import type { Metadata } from 'next'
import { documentService } from '@/services/documentService'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params
    const document = await documentService.getDocumentById(id)

    return {
      title: document?.title ? `${document.title} - Juju` : 'Canvas Editor - Juju',
      description: document?.title ? `Edit ${document.title} canvas` : 'Interactive canvas editor for creating and editing visual content',
    }
  } catch (error) {
    return {
      title: 'Canvas Editor - Juju',
      description: 'Interactive canvas editor for creating and editing visual content',
    }
  }
}

export default function CanvasEditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-screen h-screen overflow-hidden">
      {children}
    </div>
  )
}