export interface Variation {
  id: string
  imageUrl: string
  timestamp: string
}

export interface Video {
  id: string
  videoUrl: string
  thumbnailUrl: string
  status: "generating" | "complete" | "failed"
  prompt: string
  duration: string
  timestamp: string
}

export interface Character {
  id: string
  name: string
  imageUrl: string
  description?: string
  traits?: string[]
}

export interface Location {
  id: string
  name: string
  imageUrl: string
  description?: string
  timeOfDay?: string
  weather?: string
}

export interface Sound {
  id: string
  name: string
  type?: "music" | "sfx" | "voiceover" | "ambient"
  duration?: string
}

export interface Scene {
  id: string
  name: string
  character?: {
    id: string
    name: string
    imageUrl: string
  }
  location?: {
    id: string
    name: string
    imageUrl: string
  }
  sound?: {
    id: string
    name: string
  }
  prompt: string
  variations: Variation[]
  videos: Video[]
}

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
  scenes: Omit<Scene, "id">[]
}

export interface AppData {
  scenes: Scene[]
  characters: Character[]
  locations: Location[]
  sounds: Sound[]
  templates: Template[]
}

// Initial Characters Data
export const initialCharacters: Character[] = [
  {
    id: "1",
    name: "Isabelle Laurent",
    imageUrl: "/elegant-french-woman-with-dark-hair-in-white-dress.jpg",
    description: "Lead brand ambassador, elegant and sophisticated",
    traits: ["Elegant", "Sophisticated", "Graceful"],
  },
  {
    id: "2",
    name: "Jean-Claude Moreau",
    imageUrl: "/distinguished-french-perfumer-man-in-white-lab-coa.jpg",
    description: "Master perfumer with 30 years of experience",
    traits: ["Expert", "Distinguished", "Passionate"],
  },
  {
    id: "3",
    name: "Sofia Chen",
    imageUrl: "/young-asian-woman-in-minimalist-black-outfit-holdi.jpg",
    description: "Modern influencer and brand partner",
    traits: ["Modern", "Confident", "Stylish"],
  },
]

// Initial Locations Data
export const initialLocations: Location[] = [
  {
    id: "1",
    name: "Provence Lavender Fields",
    imageUrl: "/provence-lavender-fields-at-golden-hour-purple-flo.jpg",
    description: "Endless purple lavender fields in the French countryside",
    timeOfDay: "Golden Hour",
    weather: "Clear",
  },
  {
    id: "2",
    name: "Lumière Boutique Paris",
    imageUrl: "/luxury-perfume-boutique-interior.jpg",
    description: "Flagship boutique on the Champs-Élysées",
    timeOfDay: "Day",
    weather: "Indoor",
  },
  {
    id: "3",
    name: "Perfume Laboratory",
    imageUrl: "/modern-perfume-laboratory.jpg",
    description: "State-of-the-art fragrance creation facility",
    timeOfDay: "Day",
    weather: "Indoor",
  },
  {
    id: "4",
    name: "Parisian Rooftop Terrace",
    imageUrl: "/paris-rooftop-terrace-eiffel-tower.jpg",
    description: "Elegant rooftop with Eiffel Tower views",
    timeOfDay: "Sunset",
    weather: "Clear",
  },
]

// Initial Sounds Data
export const initialSounds: Sound[] = [
  {
    id: "1",
    name: "Ethereal Piano - Brand Theme",
    type: "music",
    duration: "2:30",
  },
  {
    id: "2",
    name: "Ambient Boutique Atmosphere",
    type: "ambient",
    duration: "3:00",
  },
  {
    id: "3",
    name: "Nature Sounds - Lavender Fields",
    type: "ambient",
    duration: "2:45",
  },
  {
    id: "4",
    name: "Elegant String Quartet",
    type: "music",
    duration: "2:15",
  },
]

// Template Data
export const templates: Template[] = [
  {
    id: "t1",
    name: "Luxury Product Launch",
    category: "product-ads",
    thumbnailUrl: "/luxury-perfume-bottle-on-white-marble-pedestal-wit.jpg",
    description: "Elegant product reveal with cinematic shots",
    scenes: [
      {
        name: "Opening Shot",
        prompt: "Elegant model walking through lavender fields at golden hour, holding Lumière Parfum bottle",
        variations: [],
        videos: [],
      },
      {
        name: "Product Reveal",
        prompt: "Luxury perfume bottle reveal on marble pedestal in modern boutique with soft lighting",
        variations: [],
        videos: [],
      },
    ],
  },
  {
    id: "t2",
    name: "Behind the Scenes",
    category: "entertainment",
    thumbnailUrl: "/distinguished-french-perfumer-man-in-white-lab-coa.jpg",
    description: "Show the craftsmanship behind the fragrance",
    scenes: [
      {
        name: "Master Perfumer",
        prompt: "Master perfumer Jean-Claude carefully blending essences in laboratory",
        variations: [],
        videos: [],
      },
      {
        name: "Ingredient Sourcing",
        prompt: "Harvesting fresh lavender in Provence fields at sunrise",
        variations: [],
        videos: [],
      },
    ],
  },
  {
    id: "t3",
    name: "Influencer Unboxing",
    category: "ugc-ads",
    thumbnailUrl: "/young-asian-woman-in-minimalist-black-outfit-holdi.jpg",
    description: "Authentic unboxing and first impressions",
    scenes: [
      {
        name: "Unboxing",
        prompt: "Sofia Chen opening elegant Lumière Parfum gift box in modern apartment",
        variations: [],
        videos: [],
      },
      {
        name: "First Spray",
        prompt: "Close-up of Sofia testing the perfume, natural lighting, genuine reaction",
        variations: [],
        videos: [],
      },
    ],
  },
  {
    id: "t4",
    name: "Parisian Romance",
    category: "travel",
    thumbnailUrl: "/paris-eiffel-tower-romantic.png",
    description: "Romantic journey through Paris",
    scenes: [
      {
        name: "Rooftop Sunset",
        prompt: "Couple on Parisian rooftop terrace at sunset, Eiffel Tower in background",
        variations: [],
        videos: [],
      },
      {
        name: "Boutique Visit",
        prompt: "Elegant woman discovering Lumière Parfum in boutique on Champs-Élysées",
        variations: [],
        videos: [],
      },
    ],
  },
  {
    id: "t5",
    name: "Scent Journey Montage",
    category: "montage",
    thumbnailUrl: "/perfume-bottle-on-wooden-table-with-lavender-bouqu.jpg",
    description: "Fast-paced montage of fragrance notes",
    scenes: [
      {
        name: "Top Notes",
        prompt: "Quick cuts of fresh citrus, bergamot, and morning dew",
        variations: [],
        videos: [],
      },
      {
        name: "Heart Notes",
        prompt: "Lavender fields, rose petals, jasmine blooms in sequence",
        variations: [],
        videos: [],
      },
      {
        name: "Base Notes",
        prompt: "Warm amber, sandalwood, vanilla essence close-ups",
        variations: [],
        videos: [],
      },
    ],
  },
  {
    id: "t6",
    name: "Perfume Explained",
    category: "explainer",
    thumbnailUrl: "/perfume-ingredients-diagram.jpg",
    description: "Educational content about fragrance creation",
    scenes: [
      {
        name: "Introduction",
        prompt: "Animated title card: 'The Art of Perfume Making'",
        variations: [],
        videos: [],
      },
      {
        name: "Ingredient Breakdown",
        prompt: "Animated diagram showing fragrance pyramid with ingredients",
        variations: [],
        videos: [],
      },
    ],
  },
]

// Initial Scenes Data
export const initialScenes: Scene[] = [
  {
    id: "1",
    name: "Scene 1",
    character: {
      id: "1",
      name: "Isabelle Laurent",
      imageUrl: "/elegant-french-woman-with-dark-hair-in-white-dress.jpg",
    },
    location: {
      id: "1",
      name: "Provence Lavender Fields",
      imageUrl: "/provence-lavender-fields-at-golden-hour-purple-flo.jpg",
    },
    sound: {
      id: "1",
      name: "Ethereal Piano - Brand Theme",
    },
    prompt: "Elegant model walking through lavender fields at golden hour, holding Lumière Parfum bottle",
    variations: [
      {
        id: "var1",
        imageUrl: "/elegant-woman-in-white-dress-walking-through-purpl.jpg",
        timestamp: new Date().toISOString(),
      },
      {
        id: "var2",
        imageUrl: "/close-up-of-hands-holding-luxury-perfume-bottle-in.jpg",
        timestamp: new Date().toISOString(),
      },
      {
        id: "var3",
        imageUrl: "/wide-shot-of-model-in-flowing-dress-among-lavender.jpg",
        timestamp: new Date().toISOString(),
      },
      {
        id: "var4",
        imageUrl: "/perfume-bottle-on-wooden-table-with-lavender-bouqu.jpg",
        timestamp: new Date().toISOString(),
      },
    ],
    videos: [
      {
        id: "v1",
        videoUrl: "/cinematic-shot-of-elegant-woman-in-lavender-field-.jpg",
        thumbnailUrl: "/cinematic-shot-of-elegant-woman-in-lavender-field-.jpg",
        status: "complete",
        prompt:
          "Cinematic slow-motion of model gracefully walking through lavender fields, golden hour lighting, holding Lumière Parfum",
        duration: "0:45",
        timestamp: new Date().toISOString(),
      },
    ],
  },
  {
    id: "2",
    name: "Scene 2",
    character: {
      id: "2",
      name: "Jean-Claude Moreau",
      imageUrl: "/distinguished-french-perfumer-man-in-white-lab-coa.jpg",
    },
    location: {
      id: "2",
      name: "Lumière Boutique Paris",
      imageUrl: "/luxury-perfume-boutique-interior.jpg",
    },
    sound: {
      id: "2",
      name: "Ambient Boutique Atmosphere",
    },
    prompt: "Luxury perfume bottle reveal on marble pedestal in modern boutique with soft lighting",
    variations: [
      {
        id: "var5",
        imageUrl: "/luxury-perfume-bottle-on-white-marble-pedestal-wit.jpg",
        timestamp: new Date().toISOString(),
      },
      {
        id: "var6",
        imageUrl: "/perfume-bottle-close-up-with-gold-accents-and-crys.jpg",
        timestamp: new Date().toISOString(),
      },
      {
        id: "var7",
        imageUrl: "/perfume-bottle-rotating-on-display-in-luxury-bouti.jpg",
        timestamp: new Date().toISOString(),
      },
      {
        id: "var8",
        imageUrl: "/perfume-bottle-with-rose-petals-on-marble-surface.jpg",
        timestamp: new Date().toISOString(),
      },
    ],
    videos: [
      {
        id: "v2",
        videoUrl: "/luxury-perfume-bottle-on-marble-pedestal-in-elegan.jpg",
        thumbnailUrl: "/luxury-perfume-bottle-on-marble-pedestal-in-elegan.jpg",
        status: "complete",
        prompt:
          "Slow rotating product shot of Lumière Parfum bottle on marble pedestal, soft ambient lighting, luxury boutique setting",
        duration: "0:30",
        timestamp: new Date().toISOString(),
      },
    ],
  },
]

export function getInitialAppData(): AppData {
  return {
    scenes: initialScenes,
    characters: initialCharacters,
    locations: initialLocations,
    sounds: initialSounds,
    templates: templates,
  }
}
