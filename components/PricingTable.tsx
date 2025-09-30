'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Check, Zap } from 'lucide-react'
import { PRICING_TIERS, type PricingTier } from '@/data/pricing'
import { cn } from '@/lib/utils'

interface PricingTableProps {
  currentTier?: PricingTier
  onSelectPlan?: (tier: PricingTier) => void
  showCurrentPlan?: boolean
}

export function PricingTable({ currentTier, onSelectPlan, showCurrentPlan = true }: PricingTableProps) {
  const [isAnnual, setIsAnnual] = useState(false)

  const handleSelectPlan = (tier: PricingTier) => {
    if (onSelectPlan) {
      onSelectPlan(tier)
    }
  }

  const getPrice = (tier: PricingTier) => {
    const plan = PRICING_TIERS[tier]
    return isAnnual ? plan.price.annual : plan.price.monthly
  }

  const getSavings = (tier: PricingTier) => {
    const plan = PRICING_TIERS[tier]
    if (plan.price.monthly === 0) return 0
    const monthlyTotal = plan.price.monthly * 12
    return monthlyTotal - plan.price.annual
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <span className={cn("text-sm", !isAnnual ? "font-semibold" : "text-muted-foreground")}>
          Monthly
        </span>
        <Switch
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
          className="data-[state=checked]:bg-primary"
        />
        <span className={cn("text-sm", isAnnual ? "font-semibold" : "text-muted-foreground")}>
          Annual
        </span>
        {isAnnual && (
          <Badge variant="secondary" className="ml-2">
            Save up to 2 months
          </Badge>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(PRICING_TIERS).map(([key, plan]) => {
          const tier = key as PricingTier
          const price = getPrice(tier)
          const savings = getSavings(tier)
          const isCurrentPlan = currentTier === tier
          const isFree = tier === 'free'

          return (
            <Card 
              key={tier} 
              className={cn(
                "relative transition-all duration-300 hover:shadow-lg flex flex-col",
                isCurrentPlan && showCurrentPlan && "ring-2 ring-primary"
              )}
            >
              <CardHeader className="text-left pb-4">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <div className="flex items-baseline justify-left">
                    <span className="text-4xl font-normal">${price}</span>
                    {!isFree && (
                      <span className="text-muted-foreground ml-1">
                        /{isAnnual ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                  {isAnnual && savings > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      Save ${savings}/year
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <div className="text-left mb-4">
                  <div className="text-2xl font-semibold">{plan.credits.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">credits/month</div>
                </div>
                <ul className="space-y-2 mb-6 flex-grow">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  {isCurrentPlan && showCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      className={cn(
                        "w-full"
                      )}
                      variant="outline"
                      onClick={() => handleSelectPlan(tier)}
                    >
                      {isFree ? 'Get Started' : 'Upgrade'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Additional Info */}
      <div className="text-center mt-8 text-sm text-muted-foreground">
        <p>All plans include commercial licensing and 24/7 support.</p>
        <p className="mt-1">Cancel anytime. No hidden fees.</p>
      </div>
    </div>
  )
}
