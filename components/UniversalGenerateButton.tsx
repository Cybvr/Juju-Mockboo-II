
'use client'

import { useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import { Button } from '@/components/ui/button'

interface UniversalGenerateButtonProps {
  prompt: string
  type: 'image' | 'video' | 'text' | 'audio' | 'code' | 'logo' | 'presentation' | 'music' | 'voice' | 'design'
  options?: any
  onGenerated?: (result: any) => void
  onCreditsUpdated?: () => void
}

const GENERATION_COSTS = {
  image: 1,
  video: 5,
  text: 1,
  audio: 2,
  code: 1,
  logo: 1,
  presentation: 3,
  music: 3,
  voice: 2,
  design: 2
}

export function UniversalGenerateButton({ 
  prompt, 
  type, 
  options,
  onGenerated,
  onCreditsUpdated 
}: UniversalGenerateButtonProps) {
  const [user] = useAuthState(auth)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const cost = GENERATION_COSTS[type]

  const handleGenerate = async () => {
    if (!user) {
      setError('Please sign in to generate content')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = await user.getIdToken()
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          mode: type === 'image' ? 'text' : 'product',
          prompt, 
          type, 
          options 
        })
      })

      const data = await response.json()

      if (response.status === 402) {
        setError(`Insufficient credits. Need ${data.required || cost} credits.`)
        return
      }

      

      if (!response.ok) {
        setError(data.error || 'Generation failed')
        return
      }

      onGenerated?.(data.images || data.result)
      onCreditsUpdated?.()
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleGenerate}
        disabled={loading || !prompt || !user}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? (
          <>⏳ Generating...</>
        ) : (
          <>
            🚀 Generate {type}
            <span className="text-xs bg-blue-600 px-1 rounded">
              {cost} credit{cost > 1 ? 's' : ''}
            </span>
          </>
        )}
      </Button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
