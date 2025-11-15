export interface FAQItem {
  question: string
  answer: string
}

export const faqData: FAQItem[] = [
  // Pricing & Plans
  {
    question: "What types of product imagery can I generate?",
    answer: "You can create product variations, lifestyle shots, seasonal imagery, different backgrounds, color variations, and A/B testing visuals. Our AI handles everything from simple product photos to complex lifestyle scenes that showcase your products in real-world settings."
  },
  {
    question: "How does the Video tool work for product content?",
    answer: "Our Video tool creates authentic user-generated content (UGC) style videos from your product images. Perfect for social media ads, product demos, and marketing campaigns that build trust and drive conversions."
  },
  {
    question: "What is the Upscaler tool and when should I use it?",
    answer: "The Upscaler enhances low-resolution images up to 4x their original size without quality loss. It's perfect for improving existing product photos, preparing images for print materials, or enhancing details for high-resolution displays."
  },
  {
    question: "How does the Multiply tool help with different platforms?",
    answer: "Multiply automatically adapts your designs for different social media platforms and use cases. Upload one product image and get optimized versions for Instagram, Facebook, Amazon, your website, and more - all while maintaining brand consistency."
  },
  {
    question: "Can I edit images with natural language?",
    answer: "Yes! Our Images tool (Nano-banana) lets you edit photos by simply describing what you want to change. Say 'change the background to a modern kitchen' or 'make the product blue' and watch the AI transform your image instantly."
  },

  // Technical & Quality
  {
    question: "What image quality and resolution do you provide?",
    answer: "We provide high-resolution downloads suitable for all commercial uses, from web to print. Our Upscaler tool can enhance images up to 4K quality, ensuring your product imagery looks professional across all platforms."
  },
  {
    question: "How fast is the image generation?",
    answer: "Most images generate in 10-30 seconds, compared to 2+ weeks for traditional photoshoots. Our AI processes your requests instantly, allowing you to iterate quickly and test multiple variations in real-time."
  },
  {
    question: "Can I batch process multiple products?",
    answer: "Yes! Our tools support batch processing, allowing you to upscale multiple images simultaneously, create variations of entire product catalogs, and generate consistent imagery across your full inventory efficiently."
  },

  // Business Use Cases
  {
    question: "Is this suitable for Shopify stores and Amazon sellers?",
    answer: "Absolutely! Our platform is designed specifically for ecommerce. Generate Amazon-compliant product images, create Shopify hero images, produce social media content, and develop marketing materials that convert browsers into buyers."
  },
  {
    question: "How can I use this for A/B testing my product visuals?",
    answer: "Generate multiple versions of your product images with different backgrounds, angles, colors, and styles in seconds. Test which visuals perform best for conversions, then scale the winning variations across your marketing channels."
  },
  {
    question: "Can dropshippers use this service?",
    answer: "Yes! Perfect for dropshippers who need professional product imagery without access to physical products. Transform supplier photos into branded, lifestyle imagery that stands out from competitors using the same source images."
  },

  // Support & Getting Started
  {
    question: "Do you offer support for new users?",
    answer: "We provide priority support to help you get the most from our platform. Our Chat tool also serves as an intelligent assistant, offering creative guidance, workflow tips, and instant feedback on your projects 24/7."
  },
  {
    question: "What if I need help with creative decisions?",
    answer: "Our built-in Chat assistant provides expert advice on design decisions, content strategy, and creative problem-solving. Get instant suggestions to improve your imagery and optimize your visual content for better conversions."
  },
  {
    question: "How do I get started with generating my first product images?",
    answer: "Simply sign up for your free trial, upload your product image, and describe the type of shot you want. Our AI will generate professional variations in seconds. Start with simple background changes, then explore lifestyle settings and seasonal themes."
  }
]

export const PRICING_TIERS = {
  free: {
    id: 'free',
    name: 'Free Trial',
    credits: 'Unlimited during trial',
    generations: 'Unlimited for 7 days',
    price: { monthly: 0, annual: 0 },
    features: [
      '7-day full access trial',
      'All 6 AI tools included',
      'High-resolution downloads',
      'Commercial license',
      'Community support'
    ],
    limitations: [
      'Limited to 7 days',
      'Requires credit card for trial'
    ]
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    credits: 'Unlimited',
    generations: 'Unlimited',
    price: { monthly: 29, annual: 290 },
    features: [
      'Unlimited image generations',
      'Product variations & lifestyle shots',
      'High-resolution downloads',
      'Commercial license included',
      'All 6 AI tools (Video, Images, Upscaler, Multiply, Scenes, Chat)',
      'Priority support',
      '4K upscaling',
      'Batch processing',
      'A/B testing capabilities'
    ],
    popular: true,
    savings: 'Save 90% vs $500+ photoshoots'
  }
} as const

export type PricingTier = keyof typeof PRICING_TIERS
export type PricingPlan = typeof PRICING_TIERS[PricingTier]