"use client"

import { useState, useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ttsService } from "@/services/ttsService"
import { TTSDocument } from "@/types/firebase"
import { Loader2, Volume2, Trash2, Play, FileAudio } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TextToSpeechPage() {
  const [user, loading] = useAuthState(auth)
  const router = useRouter()
  const { toast } = useToast()
  const [text, setText] = useState("")
  const [title, setTitle] = useState("")
  const [voiceId, setVoiceId] = useState("JBFqnCBsd6RMkjVDRZzb")
  const [modelId, setModelId] = useState("eleven_multilingual_v2")
  const [isGenerating, setIsGenerating] = useState(false)
  const [ttsDocs, setTtsDocs] = useState<TTSDocument[]>([])
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadTTSDocs()
    }
  }, [user])

  const loadTTSDocs = async () => {
    if (!user) return
    try {
      const docs = await ttsService.getUserRecentTTS(user.uid, 50)
      setTtsDocs(docs)
    } catch (error) {
      console.error("Error loading TTS documents:", error)
    } finally {
      setLoadingDocs(false)
    }
  }

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to convert to speech",
        variant: "destructive"
      })
      return
    }

    if (!user) return

    setIsGenerating(true)
    let ttsId = ""
    try {
      ttsId = await ttsService.createTTS(user.uid, text, title || undefined)
      
      await ttsService.updateTTS(ttsId, { 
        status: 'processing',
        voiceId,
        modelId
      })

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          voiceId,
          modelId,
          userId: user.uid,
          ttsId
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate speech')
      }

      const { audioUrl } = await response.json()

      await ttsService.setAudioUrl(ttsId, audioUrl)

      toast({
        title: "Success",
        description: "Speech generated successfully!"
      })

      setText("")
      setTitle("")
      loadTTSDocs()
    } catch (error: any) {
      if (ttsId) {
        await ttsService.updateStatus(ttsId, 'error', error.message || 'Failed to generate speech')
      }
      toast({
        title: "Error",
        description: error.message || "Failed to generate speech",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await ttsService.deleteTTS(id)
      toast({
        title: "Success",
        description: "TTS document deleted"
      })
      loadTTSDocs()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive"
      })
    }
  }

  const handlePlay = (doc: TTSDocument) => {
    if (!doc.audioUrl) return
    
    if (playingId === doc.id) {
      setPlayingId(null)
      return
    }

    const audio = new Audio(doc.audioUrl)
    audio.play()
    setPlayingId(doc.id)
    
    audio.onended = () => {
      setPlayingId(null)
    }
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Text to Speech</h1>
          <p className="text-gray-600 dark:text-gray-400">Convert your text into natural-sounding speech using AI</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Generate Speech</CardTitle>
            <CardDescription>Enter your text below and click generate to create audio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                data-testid="input-title"
                placeholder="My Speech"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isGenerating}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="voice">Voice</Label>
                <Select value={voiceId} onValueChange={setVoiceId} disabled={isGenerating}>
                  <SelectTrigger id="voice" data-testid="select-voice">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JBFqnCBsd6RMkjVDRZzb">Rachel (Default)</SelectItem>
                    <SelectItem value="21m00Tcm4TlvDq8ikWAM">Josh</SelectItem>
                    <SelectItem value="AZnzlk1XvdvUeBnXmlld">Domi</SelectItem>
                    <SelectItem value="EXAVITQu4vr4xnSDxMaL">Bella</SelectItem>
                    <SelectItem value="ErXwobaYiN019PkySvjV">Antoni</SelectItem>
                    <SelectItem value="MF3mGyEYCl7XYWbV9V6O">Elli</SelectItem>
                    <SelectItem value="TxGEqnHWrfWFTfGW9XjX">Josh (Narrative)</SelectItem>
                    <SelectItem value="VR6AewLTigWG4xSOukaG">Arnold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Select value={modelId} onValueChange={setModelId} disabled={isGenerating}>
                  <SelectTrigger id="model" data-testid="select-model">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eleven_multilingual_v2">Multilingual V2</SelectItem>
                    <SelectItem value="eleven_monolingual_v1">Monolingual V1</SelectItem>
                    <SelectItem value="eleven_turbo_v2">Turbo V2 (Fast)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="text">Text</Label>
              <Textarea
                id="text"
                data-testid="input-text"
                placeholder="Enter the text you want to convert to speech..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isGenerating}
                rows={6}
                className="resize-none"
              />
            </div>
            <Button 
              data-testid="button-generate"
              onClick={handleGenerate} 
              disabled={isGenerating || !text.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Volume2 className="mr-2 h-4 w-4" />
                  Generate Speech
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your TTS Documents</h2>
        </div>

        {loadingDocs ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : ttsDocs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12">
              <FileAudio className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No TTS documents yet. Create your first one above!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ttsDocs.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg truncate">{doc.title || 'Untitled'}</CardTitle>
                  <CardDescription className="text-xs">
                    {doc.createdAt && typeof doc.createdAt === 'object' && 'toDate' in doc.createdAt 
                      ? doc.createdAt.toDate().toLocaleDateString()
                      : new Date(doc.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{doc.text}</p>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      doc.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      doc.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      doc.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {doc.status}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      data-testid={`button-play-${doc.id}`}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePlay(doc)}
                      disabled={!doc.audioUrl || doc.status !== 'completed'}
                      className="flex-1"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {playingId === doc.id ? 'Stop' : 'Play'}
                    </Button>
                    <Button
                      data-testid={`button-view-${doc.id}`}
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/text-to-speech/${doc.id}`)}
                      className="flex-1"
                    >
                      View
                    </Button>
                    <Button
                      data-testid={`button-delete-${doc.id}`}
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>ElevenLabs TTS Documentation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Features</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>High-quality AI voice synthesis</li>
                <li>Multiple voice options and accents</li>
                <li>Natural-sounding speech generation</li>
                <li>Support for multiple languages</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How to Use</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>Enter a title for your speech (optional)</li>
                <li>Type or paste the text you want to convert</li>
                <li>Click "Generate Speech" to create audio</li>
                <li>Play, download, or manage your generated audio files</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Tips</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>Use punctuation to control speech pacing</li>
                <li>Break long text into smaller chunks for better results</li>
                <li>SSML tags can be used for advanced control</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
