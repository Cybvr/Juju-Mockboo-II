"use client"

import { useState, useEffect, useRef } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ttsService } from "@/services/ttsService"
import { TTSDocument } from "@/types/firebase"
import { Loader2, ArrowLeft, Play, Pause, Download, Volume2, FileAudio } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TTSDetailPage() {
  const [user, loading] = useAuthState(auth)
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [ttsDoc, setTtsDoc] = useState<TTSDocument | null>(null)
  const [loadingDoc, setLoadingDoc] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const ttsId = params.id as string

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && ttsId) {
      loadTTSDoc()
    }
  }, [user, ttsId])

  const loadTTSDoc = async () => {
    try {
      const doc = await ttsService.getTTSById(ttsId)
      if (!doc) {
        toast({
          title: "Error",
          description: "TTS document not found",
          variant: "destructive"
        })
        router.push("/dashboard/text-to-speech")
        return
      }
      if (doc.userId !== user?.uid) {
        toast({
          title: "Error",
          description: "You don't have access to this document",
          variant: "destructive"
        })
        router.push("/dashboard/text-to-speech")
        return
      }
      setTtsDoc(doc)
    } catch (error) {
      console.error("Error loading TTS document:", error)
      toast({
        title: "Error",
        description: "Failed to load TTS document",
        variant: "destructive"
      })
    } finally {
      setLoadingDoc(false)
    }
  }

  const handlePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleDownload = () => {
    if (!ttsDoc?.audioUrl) return

    const link = document.createElement('a')
    link.href = ttsDoc.audioUrl
    link.download = `${ttsDoc.title || 'tts-audio'}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Success",
      description: "Audio downloaded successfully"
    })
  }

  if (loading || loadingDoc) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!ttsDoc) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileAudio className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">TTS document not found</p>
          <Button
            data-testid="button-back-to-list"
            onClick={() => router.push("/dashboard/text-to-speech")}
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to TTS
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            data-testid="button-back"
            variant="ghost"
            onClick={() => router.push("/dashboard/text-to-speech")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to TTS
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{ttsDoc.title || 'Untitled'}</CardTitle>
            <CardDescription>
              Created on {ttsDoc.createdAt && typeof ttsDoc.createdAt === 'object' && 'toDate' in ttsDoc.createdAt 
                ? ttsDoc.createdAt.toDate().toLocaleDateString()
                : new Date(ttsDoc.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <Volume2 className="mr-2 h-4 w-4" />
                Status
              </h3>
              <span className={`inline-block text-sm px-3 py-1 rounded-full ${
                ttsDoc.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                ttsDoc.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                ttsDoc.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {ttsDoc.status}
              </span>
            </div>

            {ttsDoc.errorMessage && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">{ttsDoc.errorMessage}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">Text</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{ttsDoc.text}</p>
            </div>

            {ttsDoc.audioUrl && ttsDoc.status === 'completed' && (
              <div>
                <h3 className="font-semibold mb-2">Audio</h3>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                  <audio
                    ref={audioRef}
                    src={ttsDoc.audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="w-full mb-4"
                    controls
                  />
                  <div className="flex gap-2">
                    <Button
                      data-testid="button-play-pause"
                      onClick={handlePlayPause}
                      className="flex-1"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Play
                        </>
                      )}
                    </Button>
                    <Button
                      data-testid="button-download"
                      variant="outline"
                      onClick={handleDownload}
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {ttsDoc.status === 'processing' && (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
                  <p className="text-gray-600 dark:text-gray-400">Generating audio...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Document ID:</span>
              <span className="font-mono text-xs">{ttsDoc.id}</span>
            </div>
            {ttsDoc.voiceId && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Voice ID:</span>
                <span className="font-mono text-xs">{ttsDoc.voiceId}</span>
              </div>
            )}
            {ttsDoc.modelId && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Model ID:</span>
                <span className="font-mono text-xs">{ttsDoc.modelId}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Updated:</span>
              <span>
                {ttsDoc.updatedAt && typeof ttsDoc.updatedAt === 'object' && 'toDate' in ttsDoc.updatedAt 
                  ? ttsDoc.updatedAt.toDate().toLocaleString()
                  : new Date(ttsDoc.updatedAt).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
