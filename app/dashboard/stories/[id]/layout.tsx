
import type { Metadata } from 'next'
import { getStoryById } from '@/services/storiesService'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params
    const story = await getStoryById(id)

    return {
      title: story?.title ? `${story.title} - Juju` : 'Story Editor - Juju',
      description: story?.prompt ? `Edit "${story.title}" - ${story.prompt.substring(0, 150)}...` : 'AI-powered story editor for creating and editing visual narratives',
      openGraph: story?.storyboard?.[0]?.imageUrl ? {
        images: [story.storyboard[0].imageUrl],
        title: story.title,
        description: story.prompt || 'AI-generated story'
      } : undefined,
    }
  } catch (error) {
    return {
      title: 'Story Editor - Juju',
      description: 'AI-powered story editor for creating and editing visual narratives',
    }
  }
}

export default function StoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
