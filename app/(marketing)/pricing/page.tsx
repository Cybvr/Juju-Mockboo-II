'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PricingTable } from '@/components/PricingTable'
import FAQSection from '@/app/common/marketing/FAQSection'
import { PRICING_TIERS, type PricingTier } from '@/data/pricing'
import { Check, ArrowRight, Star, Shield, Headphones } from 'lucide-react'
import { toast } from 'sonner'

export default function PricingPage() {
  const router = useRouter()
  const [user] = useAuthState(auth)
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null)

  const handleSelectPlan = async (tier: PricingTier) => {
    if (!user) {
      router.push('/dashboard')
      return
    }

    if (tier === 'free') {
      router.push('/dashboard')
      return
    }

    setSelectedTier(tier)

    try {
      // Here you would integrate with your payment processor
      // For now, we'll just show a toast
      toast.success(`Selected ${tier} plan! Redirecting to checkout...`)

      // Simulate redirect to payment
      setTimeout(() => {
        router.push('/dashboard/account')
      }, 2000)
    } catch (error) {
      toast.error('Failed to process plan selection')
    }
  }

  return (
    <div className="min-h-screen  max-w-5xl mx-auto mb-16">
      <div className="container mx-auto px-4 py-16 space-y-8">
        {/* Header */}
        <div className="text-center py-8 mb-8 ">
          <h1 className="text-sm text-muted-foreground font-normal">
            Choose Your Creative Journey

          </h1>
          <h1 className="text-4xl font-normal mb-4">
            Pricing Plans

          </h1>
         
          <p className="text-lg text-muted-foreground mx-auto max-w-3xl">
            From hobbyists to professionals, find the perfect plan that scales with your creative ambitions.
          </p>
        </div>

        {/* Pricing Table */}
        <PricingTable onSelectPlan={handleSelectPlan} showCurrentPlan={false} />

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Shield className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-sm text-muted-foreground">
                Enterprise-grade security with 99.9% uptime guarantee
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Headphones className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">
                Get help whenever you need it from our expert team
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Star className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Money Back</h3>
              <p className="text-sm text-muted-foreground">
                30-day money-back guarantee, no questions asked
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <FAQSection />

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
            <CardContent className="pt-8 pb-8">
              <h3 className="text-2xl font-bold mb-4">Ready to start creating?</h3>
              <p className="text-muted-foreground mb-6">
                Join thousands of creators who trust Juju for their creative projects.
              </p>
              <Button size="lg" onClick={() => router.push('/dashboard')}>
                Start Creating Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}