export interface Template {
  id: string
  name: string
  category:
    | "ugc-ads"
    | "entertainment"
    | "food"
    | "montage"
    | "product-ads"
    | "travel"
    | "explainer"
    | "animated"
    | "anime"
  thumbnailUrl: string
  description: string
  scenes: {
    name: string
    prompt: string
    variations: any[]
    videos: any[]
  }[]
}

// Template Data
export const templates: Template[] = [
  // UGC Ads Templates
  {
    id: "t1",
    name: "GlowKit Beauty Unboxing",
    category: "ugc-ads",
    thumbnailUrl: "/assets/images/storymaker/young-asian-woman-in-minimalist-black-outfit-holdi.jpg",
    description: "Authentic unboxing experience for skincare subscription boxes - viral format used by brands like FabFitFun and Ipsy creators",
    scenes: [
      {
        name: "Package Arrival",
        prompt: "Person receiving package at doorstep, excitement building",
        variations: [],
        videos: [],
      },
      {
        name: "Unboxing Reveal",
        prompt: "Hands opening package, revealing product, natural lighting",
        variations: [],
        videos: [],
      },
      {
        name: "First Impressions",
        prompt: "Close-up reaction testing product for first time",
        variations: [],
        videos: [],
      },
    ],
  },
  {
    id: "t2",
    name: "Day with Luna Wellness Products",
    category: "ugc-ads",
    thumbnailUrl: "/assets/images/storymaker/elegant-woman-in-white-dress-walking-through-purpl.jpg",
    description: "Natural lifestyle content featuring wellness supplements seamlessly integrated into daily routines - popular with brands like Ritual and Athletic Greens",
    scenes: [
      {
        name: "Morning Routine",
        prompt: "Person getting ready in morning, using product naturally",
        variations: [],
        videos: [],
      },
      {
        name: "Throughout the Day",
        prompt: "Product being used during daily activities",
        variations: [],
        videos: [],
      },
    ],
  },
  {
    id: "t3",
    name: "ClearSkin 30-Day Challenge",
    category: "ugc-ads",
    thumbnailUrl: "/assets/images/juju/woman-holding-bottle-on-beach-ugc-style.jpg",
    description: "Transformation content showing real results from acne treatments and skincare serums - proven format for brands like Curology and The Ordinary",
    scenes: [
      {
        name: "Before State",
        prompt: "Person showing 'before' situation naturally",
        variations: [],
        videos: [],
      },
      {
        name: "Using Product",
        prompt: "Demonstrating product application or use",
        variations: [],
        videos: [],
      },
      {
        name: "After Results",
        prompt: "Revealing transformation or improvement",
        variations: [],
        videos: [],
      },
    ],
  },

  // Entertainment Templates
  {
    id: "t4",
    name: "Making of Artisan Candles BTS",
    category: "entertainment",
    thumbnailUrl: "/assets/images/storymaker/distinguished-french-perfumer-man-in-white-lab-coa.jpg",
    description: "Behind the scenes of handcrafted product creation - engaging format for artisan brands like Paddywax and small batch makers",
    scenes: [
      {
        name: "Setup",
        prompt: "Setting up equipment, preparing for shoot",
        variations: [],
        videos: [],
      },
      {
        name: "Bloopers",
        prompt: "Funny moments, mistakes, candid reactions",
        variations: [],
        videos: [],
      },
      {
        name: "Final Result",
        prompt: "Revealing finished content or product",
        variations: [],
        videos: [],
      },
    ],
  },
  {
    id: "t5",
    name: "StyleVault Fashion Hacks",
    category: "entertainment",
    thumbnailUrl: "/assets/images/templates/fashion.jpg",
    description: "Quick styling tips and outfit formulas - viral educational format used by fashion influencers and brands like Zara and H&M creators",
    scenes: [
      {
        name: "Introduction",
        prompt: "Enthusiastic intro explaining what viewers will learn",
        variations: [],
        videos: [],
      },
      {
        name: "Step by Step",
        prompt: "Clear demonstration of techniques or tips",
        variations: [],
        videos: [],
      },
      {
        name: "Results",
        prompt: "Showing final outcome, encouraging viewers to try",
        variations: [],
        videos: [],
      },
    ],
  },

  // Food Templates  
  {
    id: "t6",
    name: "Mama Rosa's 15-Minute Pasta",
    category: "food",
    thumbnailUrl: "/assets/images/marketing/food.jpg",
    description: "Quick, crave-worthy recipe videos perfect for pasta sauces, meal kits, or kitchen gadget brands like Barilla, HelloFresh, or OXO",
    scenes: [
      {
        name: "Ingredients",
        prompt: "Fresh ingredients laid out beautifully on counter",
        variations: [],
        videos: [],
      },
      {
        name: "Cooking Process",
        prompt: "Quick cuts of cooking steps, sizzling sounds",
        variations: [],
        videos: [],
      },
      {
        name: "Final Dish",
        prompt: "Perfectly plated dish, steam rising, garnish added",
        variations: [],
        videos: [],
      },
    ],
  },
  {
    id: "t7",
    name: "TasteBudz Street Food Hunt",
    category: "food",
    thumbnailUrl: "/assets/images/storymaker/farm-scene.jpg",
    description: "Honest reactions to trying new restaurants and food products - popular format for food delivery apps like DoorDash, Uber Eats, and snack brands",
    scenes: [
      {
        name: "Food Reveal",
        prompt: "Unveiling the dish or food item dramatically",
        variations: [],
        videos: [],
      },
      {
        name: "First Bite",
        prompt: "Taking first bite, genuine reaction, close-up",
        variations: [],
        videos: [],
      },
      {
        name: "Final Verdict",
        prompt: "Rating or final thoughts about the food",
        variations: [],
        videos: [],
      },
    ],
  },

  // Montage Templates
  {
    id: "t8",
    name: "RoomRevive Makeover Montage",
    category: "montage",
    thumbnailUrl: "/assets/images/storymaker/perfume-bottle-on-wooden-table-with-lavender-bouqu.jpg",
    description: "Fast-paced home decor and furniture transformations - trending format for brands like IKEA, Wayfair, and interior design products",
    scenes: [
      {
        name: "Starting Point",
        prompt: "Quick shots establishing initial state",
        variations: [],
        videos: [],
      },
      {
        name: "Process Clips",
        prompt: "Rapid cuts of transformation process",
        variations: [],
        videos: [],
      },
      {
        name: "Final Reveal",
        prompt: "Dramatic reveal of end result",
        variations: [],
        videos: [],
      },
    ],
  },
  {
    id: "t9",
    name: "Hustle & Flow Daily Reset",
    category: "montage",
    thumbnailUrl: "/assets/images/templates/moodboard.jpg",
    description: "Aesthetic productivity and self-care routine montages - ideal for planners, productivity apps like Notion, and wellness brands",
    scenes: [
      {
        name: "Morning",
        prompt: "Quick morning routine shots, coffee, getting ready",
        variations: [],
        videos: [],
      },
      {
        name: "Midday",
        prompt: "Work or activity shots, lunch, productivity",
        variations: [],
        videos: [],
      },
      {
        name: "Evening",
        prompt: "Wind-down routine, dinner, relaxation",
        variations: [],
        videos: [],
      },
    ],
  },

  // Product Ads Templates
  {
    id: "t10",
    name: "Noir Élégance Perfume Launch",
    category: "product-ads",
    thumbnailUrl: "/assets/images/storymaker/luxury-perfume-bottle-on-white-marble-pedestal-wit.jpg",
    description: "Premium fragrance and luxury goods reveal with cinematic cinematography - signature style for brands like Chanel, Dior, and high-end cosmetics",
    scenes: [
      {
        name: "Teaser",
        prompt: "Mysterious shots building anticipation for product",
        variations: [],
        videos: [],
      },
      {
        name: "Product Reveal",
        prompt: "Dramatic product reveal with perfect lighting",
        variations: [],
        videos: [],
      },
      {
        name: "Features",
        prompt: "Close-up shots highlighting key product features",
        variations: [],
        videos: [],
      },
    ],
  },
  {
    id: "t11",
    name: "BackEase Pain Relief Story",
    category: "product-ads",
    thumbnailUrl: "/assets/images/marketing/consistent.jpg",
    description: "Problem-solution narrative for pain relief, sleep aids, or productivity tools - effective for brands like Theragun, Purple Mattress, and wellness tech",
    scenes: [
      {
        name: "The Problem",
        prompt: "Person struggling with common problem or frustration",
        variations: [],
        videos: [],
      },
      {
        name: "The Solution",
        prompt: "Introducing your product as the perfect solution",
        variations: [],
        videos: [],
      },
      {
        name: "Happy Ending",
        prompt: "Customer satisfied and problem solved",
        variations: [],
        videos: [],
      },
    ],
  },

  // Travel Templates
  {
    id: "t12",
    name: "Wanderluxe Paris Hidden Gems",
    category: "travel",
    thumbnailUrl: "/assets/images/storymaker/paris-eiffel-tower-romantic.png",
    description: "Discover secret cafes and boutiques in iconic cities - perfect for travel booking platforms like Airbnb, travel gear brands, and city guide apps",
    scenes: [
      {
        name: "Arrival",
        prompt: "Arriving at destination, first impressions",
        variations: [],
        videos: [],
      },
      {
        name: "Exploring",
        prompt: "Walking through streets, discovering local culture",
        variations: [],
        videos: [],
      },
      {
        name: "Highlights",
        prompt: "Best moments and scenic views from the trip",
        variations: [],
        videos: [],
      },
    ],
  },
  {
    id: "t13",
    name: "Summit Seekers Mountain Trek",
    category: "travel",
    thumbnailUrl: "/assets/images/storymaker/provence-lavender-fields-at-golden-hour-purple-flo.jpg",
    description: "Epic outdoor adventures showcasing hiking boots, camping gear, and outdoor apparel - used by brands like Patagonia, REI, and GoPro",
    scenes: [
      {
        name: "Journey Begins",
        prompt: "Setting off on nature adventure, packing gear",
        variations: [],
        videos: [],
      },
      {
        name: "Scenic Views",
        prompt: "Breathtaking landscapes, mountains, forests, water",
        variations: [],
        videos: [],
      },
      {
        name: "Adventure Moments",
        prompt: "Hiking, climbing, or other outdoor activities",
        variations: [],
        videos: [],
      },
    ],
  },

  // Explainer Templates
  {
    id: "t14",
    name: "TechFlow AI Tool Breakdown",
    category: "explainer",
    thumbnailUrl: "/assets/images/storymaker/perfume-ingredients-diagram.jpg",
    description: "Clear walkthrough of software features and SaaS platforms - essential for tech companies like Slack, Notion, and productivity startups",
    scenes: [
      {
        name: "Introduction",
        prompt: "Animated title explaining what will be covered",
        variations: [],
        videos: [],
      },
      {
        name: "Step by Step",
        prompt: "Visual breakdown of each step in the process",
        variations: [],
        videos: [],
      },
      {
        name: "Summary",
        prompt: "Key takeaways and call to action",
        variations: [],
        videos: [],
      },
    ],
  },
  {
    id: "t15",
    name: "MoneyWise Finance Tips",
    category: "explainer",
    thumbnailUrl: "/assets/images/templates/poster.jpg",
    description: "Educational content about budgeting, investing, and financial literacy - popular format for fintech apps like Acorns, Robinhood, and financial coaches",
    scenes: [
      {
        name: "Hook",
        prompt: "Attention-grabbing fact or question",
        variations: [],
        videos: [],
      },
      {
        name: "Tips",
        prompt: "Clear, actionable advice with visual examples",
        variations: [],
        videos: [],
      },
      {
        name: "Recap",
        prompt: "Summary of key points and encouragement",
        variations: [],
        videos: [],
      },
    ],
  },

  // Animated Templates
  {
    id: "t16",
    name: "FlashFit App Promo Animation",
    category: "animated",
    thumbnailUrl: "/assets/images/templates/logo.jpg",
    description: "Eye-catching motion graphics for fitness apps, mobile games, and digital products - high-energy style for brands like Nike Training Club and Headspace",
    scenes: [
      {
        name: "Animated Intro",
        prompt: "Dynamic logo animation with sound effects",
        variations: [],
        videos: [],
      },
      {
        name: "Key Points",
        prompt: "Animated text and graphics highlighting benefits",
        variations: [],
        videos: [],
      },
      {
        name: "Call to Action",
        prompt: "Animated button or text encouraging action",
        variations: [],
        videos: [],
      },
    ],
  },
  {
    id: "t17",
    name: "ClimateWatch Data Story",
    category: "animated",
    thumbnailUrl: "/assets/images/templates/bc.jpg",
    description: "Engaging data visualization for environmental stats, market research, and annual reports - professional format for sustainability brands and B2B companies",
    scenes: [
      {
        name: "Title Card",
        prompt: "Animated title introducing the topic",
        variations: [],
        videos: [],
      },
      {
        name: "Data Points",
        prompt: "Charts and graphs animating to show statistics",
        variations: [],
        videos: [],
      },
      {
        name: "Conclusion",
        prompt: "Summary with key insights highlighted",
        variations: [],
        videos: [],
      },
    ],
  },

  // Anime Templates
  {
    id: "t18",
    name: "Shadow Blade Hero Origin",
    category: "anime",
    thumbnailUrl: "/assets/images/restyle/anime.jpg",
    description: "Anime-style character introduction for gaming channels, manga promotions, and anime merchandise - inspired by Crunchyroll and anime studio marketing",
    scenes: [
      {
        name: "Mystery Silhouette",
        prompt: "Shadowy figure in dramatic anime lighting",
        variations: [],
        videos: [],
      },
      {
        name: "Character Reveal",
        prompt: "Full character design reveal with anime effects",
        variations: [],
        videos: [],
      },
      {
        name: "Powers Demo",
        prompt: "Character showing special abilities or skills",
        variations: [],
        videos: [],
      },
    ],
  },
  {
    id: "t19",
    name: "Pixel Energy Drink Anime Ad",
    category: "anime",
    thumbnailUrl: "/assets/images/templates/ad.jpg",
    description: "Anime-styled product commercial for energy drinks, gaming peripherals, and youth-focused brands - bold format used by brands like G Fuel and Razer",
    scenes: [
      {
        name: "Anime Opening",
        prompt: "Dramatic anime-style opening sequence",
        variations: [],
        videos: [],
      },
      {
        name: "Product in Action",
        prompt: "Anime character using product with special effects",
        variations: [],
        videos: [],
      },
      {
        name: "Epic Conclusion",
        prompt: "Anime-style ending with product logo",
        variations: [],
        videos: [],
      },
    ],
  },
]