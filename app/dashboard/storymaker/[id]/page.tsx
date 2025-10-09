import { VideoMaker } from "./video-maker"
import { StorymakerProvider } from "../common/storymaker-context"

export default async function StorymakerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  return (
    <StorymakerProvider documentId={id}>
      <VideoMaker />
    </StorymakerProvider>
  )
}
