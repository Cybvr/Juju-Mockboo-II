import { VideoMaker } from "./video-maker"
import { StorymakerProvider } from "../common/storymaker-context"

export default function StorymakerPage({ params }: { params: { id: string } }) {
  return (
    <StorymakerProvider documentId={params.id}>
      <VideoMaker />
    </StorymakerProvider>
  )
}
