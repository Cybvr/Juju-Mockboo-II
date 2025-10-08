import { VideoMaker } from "./video-maker"
import { StorymakerProvider } from "../common/storymaker-context"

export default function Home() {
  return (
    <StorymakerProvider>
      <VideoMaker />
    </StorymakerProvider>
  )
}
