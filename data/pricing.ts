
export const PRICING_TIERS = {
  plus: {
    id: 'plus',
    name: 'Plus',
    subtitle: 'best for getting started',
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
  pro: {
    id: 'pro',
    name: 'Pro',
    subtitle: 'best for professionals',
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
  max: {
    id: 'max',
    name: 'Max',
    subtitle: 'best for power users',
    credits: 200,
    generations: 200,
    price: { monthly: 200, annual: 2000 },
    creditPrice: 1.0,
    features: [
      '200 Credits',
      '400 Video mins + 640 iStock',
      '10 generative UGC ads',
      '600 secs of generative video',
      '15 express clones',
      '5 users, 800GB storage',
      'Unlimited exports'
    ],
    addOns: '1x Boost, 200 Credits',
    popular: false
  }
} as const

export type PricingTier = keyof typeof PRICING_TIERS
export type PricingPlan = typeof PRICING_TIERS[PricingTier]
