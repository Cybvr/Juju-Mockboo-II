
export const PRICING_TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    credits: 1,
    generations: 1,
    price: { monthly: 0, annual: 0 },
    features: [
      '10 Video mins per week',
      '1 AI credit per week', 
      '1 Express avatar',
      '4 Exports per week with watermark',
      'No generative features'
    ],
    limitations: [
      'Weekly limits',
      'Watermarked exports',
      'No generative access'
    ]
  },
  plus: {
    id: 'plus',
    name: 'Plus',
    subtitle: 'best for stock video',
    credits: 10,
    generations: 10,
    price: { monthly: 35, annual: 350 },
    creditPrice: 3.5,
    features: [
      '10 Credits',
      '50 Video mins + 95 iStock',
      '2 UGC product asset ads',
      '30 secs of generative video',
      '2 express clones',
      '3 users, 100GB storage',
      'Unlimited exports'
    ],
    addOns: '1x Boost, 10 Credits',
    popular: false
  },
  max: {
    id: 'max',
    name: 'Max',
    subtitle: 'best for stock video',
    credits: 40,
    generations: 40,
    price: { monthly: 60, annual: 600 },
    creditPrice: 1.5,
    features: [
      '40 Credits',
      '200 Video mins + 320 iStock',
      '8 UGC product asset ads',
      '120 secs of generative video',
      '5 express clones',
      '3 users, 400GB storage',
      'Unlimited exports'
    ],
    addOns: '1x Boost, 40 Credits',
    popular: false
  },
  generative: {
    id: 'generative',
    name: 'Generative',
    subtitle: 'best for ads and films',
    credits: 100,
    generations: 100,
    price: { monthly: 120, annual: 1200 },
    creditPrice: 1.2,
    features: [
      '100 Credits',
      '200 Video mins + 320 iStock',
      '5 generative UGC ads',
      '300 secs of generative video',
      '8 express clones',
      '3 users, 400GB storage',
      'Unlimited exports'
    ],
    addOns: '1x Boost, 100 Credits',
    popular: true,
    badge: 'Best Value'
  },
  team: {
    id: 'team',
    name: 'Team',
    subtitle: 'best for teams',
    credits: 1000,
    generations: 1000,
    price: { monthly: 999, annual: 9990 },
    creditPrice: 1.0,
    features: [
      '1000 Credits',
      '2000 Video mins + 3200 iStock',
      '50 generative UGC ads',
      '50 mins of generative videos',
      '40 express clones',
      '1 seat, 4TB storage',
      'Unlimited exports'
    ],
    addOns: '1 Seat, 1000 Credits',
    popular: false
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    subtitle: 'Custom',
    credits: 'Custom',
    generations: 'Custom',
    price: { monthly: 'Custom', annual: 'Custom' },
    creditPrice: 'Custom',
    features: [
      'Custom solutions for large organizations',
      'Advanced security',
      'Flexible pricing based on needs'
    ],
    popular: false
  }
} as const

export type PricingTier = keyof typeof PRICING_TIERS
export type PricingPlan = typeof PRICING_TIERS[PricingTier]
