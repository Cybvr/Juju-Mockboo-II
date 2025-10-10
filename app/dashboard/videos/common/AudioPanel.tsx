
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, Volume2, Play, Pause } from "lucide-react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { toast } from "sonner"

interface Voice {
  voice_id: string
  name: string
  category: string
}

export function AudioPanel() {
  const [user] = useAuthState(auth)
  const [prompt, setPrompt] = useState("")
  const [selectedVoice, setSelectedVoice] = useState("")
  const [voices, setVoices] = useState<Voice[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAudio, setGeneratedAudio] = useState<string[]>([])
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)

  useEffect(() => {
    fetchVoices()
  }, [])

  const fetchVoices = async () => {
    try {
      const response = await fetch('/api/audio/voices')
      const data = await response.json()
      if (data.voices) {
        setVoices(data.voices)
        if (data.voices.length > 0) {
          setSelectedVoice(data.voices[0].voice_id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch voices:', error)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedVoice || !user) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: prompt,
          voice_id: selectedVoice,
          userId: user.uid
        }),
      })

      const data = await response.json()
      if (data.success && data.audioUrl) {
        setGeneratedAudio(prev => [data.audioUrl, ...prev])
        toast.success("Audio generated successfully!")
      } else {
        toast.error("Failed to generate audio")
      }
    } catch (error) {
      console.error('Error generating audio:', error)
      toast.error("Failed to generate audio")
    } finally {
      setIsGenerating(false)
    }
  }

  const playAudio = (audioUrl: string) => {
    if (currentlyPlaying === audioUrl) {
      setCurrentlyPlaying(null)
      return
    }
    
    const audio = new Audio(audioUrl)
    setCurrentlyPlaying(audioUrl)
    audio.onended = () => setCurrentlyPlaying(null)
    audio.play()
  }

  return (
    <div className="w-80 border-r border-border bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Volume2 className="w-4 h-4" />
          <h2 className="font-semibold text-sm">Audio</h2>
        </div>

        {/* Text-to-Speech */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium mb-2 block">Voice</label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.voice_id} value={voice.voice_id}>
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium mb-2 block">Script</label>
            <Textarea
              placeholder="Enter text to convert to speech..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              className="resize-none min-h-[80px] text-sm"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || !selectedVoice}
            size="sm"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              "Generate Audio"
            )}
          </Button>
        </div>
      </div>

      {/* Audio Files */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-dashed"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Audio
          </Button>
        </div>

        {generatedAudio.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-center">
            <Volume2 className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No audio files yet</p>
            <p className="text-xs">Generate or upload audio</p>
          </div>
        )}

        <div className="space-y-2">
          {generatedAudio.map((audioUrl, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer group"
              draggable
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Audio {index + 1}</p>
                  <p className="text-xs text-muted-foreground">Generated audio</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => playAudio(audioUrl)}
                >
                  {currentlyPlaying === audioUrl ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
