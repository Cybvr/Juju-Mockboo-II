
export const PRICING_TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    credits: 25,
    generations: 25,
    price: { monthly: 0, annual: 0 },
    features: [
      'Basic templates',
      'Community support',
      'Standard quality outputs'
    ],
    limitations: [
      'Limited templates',
      'No priority support',
      'Basic resolution only'
    ]
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    credits: 100,
    generations: 100,
    price: { monthly: 9, annual: 90 },
    features: [
      'All templates access',
      'Email support',
      'HD quality outputs',
      'Commercial license'
    ],
    popular: false
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    credits: 250,
    generations: 250,
    price: { monthly: 19, annual: 190 },
    features: [
      'Priority processing',
      'Advanced AI models',
      '4K quality outputs',
      'Priority support',
      'Commercial license',
      'API access'
    ],
    popular: true
  }
} as const

export type PricingTier = keyof typeof PRICING_TIERS
export type PricingPlan = typeof PRICING_TIERS[PricingTier]
