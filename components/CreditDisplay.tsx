'use client'

import { useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import { CreditService } from '@/lib/credits'

interface CreditInfo {
  credits: number
  subscriptionType: string
  tier: { credits: number }
}

export function CreditDisplay() {
  const [user] = useAuthState(auth)
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchCredits()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchCredits = async () => {
    try {
      const creditData = await CreditService.getUserCredits(user!.uid)
      setCreditInfo(creditData)
    } catch (error) {
      console.error('Failed to fetch credits:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user || loading) return <div>Loading...</div>
  if (!creditInfo) return null

  const { credits, subscriptionType, tier } = creditInfo

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-700'
      case 'basic': return 'bg-blue-100 text-blue-700'
      case 'premium': return 'bg-purple-100 text-purple-700'
      case 'pro': return 'bg-amber-100 text-amber-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(subscriptionType)}`}>
        {subscriptionType.toUpperCase()}
      </div>

      <div className="flex items-center gap-1">
        <span>💰</span>
        <span className="font-medium">{credits.toLocaleString()} credits</span>
        <span className="text-xs text-gray-500">/ {tier.credits.toLocaleString()} monthly</span>
      </div>

      {credits <= 10 && credits > 0 && (
        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
          Running low!
        </span>
      )}

      {credits === 0 && (
        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
          No credits
        </span>
      )}
    </div>
  )
}