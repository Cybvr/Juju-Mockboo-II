import { VideoMaker } from "@/app/common/storymaker/video-maker"
import { StorymakerProvider } from "@/app/common/storymaker/storymaker-context"

export default function Home() {
  return (
    <StorymakerProvider>
      <VideoMaker />
    </StorymakerProvider>
  )
}
