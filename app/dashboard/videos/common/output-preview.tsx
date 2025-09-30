
import { Button } from "@/components/ui/button"
import { Download, MoreHorizontal, Play, ExternalLink } from "lucide-react"

interface GeneratedVideo {
  url: string;
  id?: string;
}

interface OutputPreviewProps {
  videos?: GeneratedVideo[];
  isGenerating?: boolean;
  error?: string | null;
}

export function OutputPreview({ videos = [], isGenerating = false, error = null }: OutputPreviewProps) {
  const hasVideos = videos.length > 0;

  const handleDownload = (videoUrl: string) => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = 'generated-video.mp4';
    link.target = '_blank';
    link.click();
  };

  return (
    <div className="flex-1 p-2 lg:p-6 flex flex-col h-full max-h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 lg:mb-6 flex-shrink-0">
        <h1 className="text-md font-normal text-foreground">Preview</h1>
        <div className="flex gap-2">
          {hasVideos && videos[0]?.id && (
            <Button 
              className="" 
              onClick={() => window.open(`/m/${videos[0].id}`, '_blank')}
            >
              <ExternalLink className="w-3 h-3 mr-2" />
              <span className="hidden sm:inline">View Full</span>
              <span className="sm:hidden">View</span>
            </Button>
          )}
          <Button className="" disabled={!hasVideos}>
            <MoreHorizontal className="w-3 h-3 ml-2" />
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-black rounded-lg p-2 lg:p-8 flex items-center justify-center relative overflow-hidden min-h-0">
        {isGenerating ? (
          <div className="text-center text-white">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Generating video...</p>
            <p className="text-xs text-muted-foreground mt-2">This may take a few minutes</p>
          </div>
        ) : error ? (
          <div className="text-center text-white">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : hasVideos ? (
          <>
            <div className="flex items-center justify-center max-w-full">
              <video
                src={videos[0].url}
                controls
                autoPlay
                muted
                loop
                className="max-w-full max-h-full object-contain rounded"
                style={{ maxHeight: 'calc(100vh - 200px)' }}
              />
            </div>

            {/* Video controls overlay */}
            <div className="absolute bottom-2 lg:bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-600 text-foreground px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm">
              Video Ready
            </div>

            {/* Download button */}
            <Button
              variant="ghost"
              className="absolute bottom-2 lg:bottom-4 right-2 lg:right-4 text-gray-200 hover:text-white p-2 lg:p-3 bg-black/50 hover:bg-black/70 rounded"
              onClick={() => handleDownload(videos[0].url)}
            >
              <Download className="w-4 h-4 lg:w-5 lg:h-5" />
            </Button>
          </>
        ) : (
          <div className="text-center text-white">
            <Play className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-normal">Enter a prompt and generate to see your video here</p>
          </div>
        )}
      </div>
    </div>
  )
}
