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

export interface ProjectConfig {
  projectName: string
  projectDescription: string
  aspectRatio: string
  duration: string
  fps: string
  resolution: string
  autoTransitions: boolean
  backgroundMusic: boolean
  autoSave: boolean
  watermark: boolean
  aiModel: string
  stylePreset: string
  variations: string
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
    imageUrl: "/assets/images/storymaker/elegant-french-woman-with-dark-hair-in-white-dress.jpg",
    description: "Lead brand ambassador, elegant and sophisticated",
    traits: ["Elegant", "Sophisticated", "Graceful"],
  },
  {
    id: "2",
    name: "Jean-Claude Moreau",
    imageUrl: "/assets/images/storymaker/distinguished-french-perfumer-man-in-white-lab-coa.jpg",
    description: "Master perfumer with 30 years of experience",
    traits: ["Expert", "Distinguished", "Passionate"],
  },
  {
    id: "3",
    name: "Sofia Chen",
    imageUrl: "/assets/images/storymaker/young-asian-woman-in-minimalist-black-outfit-holdi.jpg",
    description: "Modern influencer and brand partner",
    traits: ["Modern", "Confident", "Stylish"],
  },
]

// Initial Locations Data
export const initialLocations: Location[] = [
  {
    id: "1",
    name: "Provence Lavender Fields",
    imageUrl: "/assets/images/storymaker/provence-lavender-fields-at-golden-hour-purple-flo.jpg",
    description: "Endless purple lavender fields in the French countryside",
    timeOfDay: "Golden Hour",
    weather: "Clear",
  },
  {
    id: "2",
    name: "Lumière Boutique Paris",
    imageUrl: "/assets/images/storymaker/luxury-perfume-boutique-interior.jpg",
    description: "Flagship boutique on the Champs-Élysées",
    timeOfDay: "Day",
    weather: "Indoor",
  },
  {
    id: "3",
    name: "Perfume Laboratory",
    imageUrl: "/assets/images/storymaker/modern-perfume-laboratory.jpg",
    description: "State-of-the-art fragrance creation facility",
    timeOfDay: "Day",
    weather: "Indoor",
  },
  {
    id: "4",
    name: "Parisian Rooftop Terrace",
    imageUrl: "/assets/images/storymaker/paris-rooftop-terrace-eiffel-tower.jpg",
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

// Default Project Configuration
export const defaultProjectConfig: ProjectConfig = {
  projectName: "Lumière Parfum Studio",
  projectDescription: "Elegant fragrance commercial showcasing the artistry and sophistication of Lumière Parfum through cinematic storytelling",
  aspectRatio: "16:9",
  duration: "45",
  fps: "30",
  resolution: "1080p",
  autoTransitions: true,
  backgroundMusic: true,
  autoSave: true,
  watermark: false,
  aiModel: "high",
  stylePreset: "cinematic",
  variations: "4",
}

// Template Data - This will be moved to a separate file
export const templates: Template[] = [
  // UGC Ads Templates
  {
    id: "t1",
    name: "Product Unboxing",
    category: "ugc-ads",
    thumbnailUrl: "/assets/images/storymaker/young-asian-woman-in-minimalist-black-outfit-holdi.jpg",
    description: "Authentic unboxing experience with genuine reactions",
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
    name: "Day in My Life",
    category: "ugc-ads",
    thumbnailUrl: "/assets/images/storymaker/elegant-woman-in-white-dress-walking-through-purpl.jpg",
    description: "Natural lifestyle content featuring your product",
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
    name: "Before & After",
    category: "ugc-ads",
    thumbnailUrl: "/assets/images/juju/woman-holding-bottle-on-beach-ugc-style.jpg",
    description: "Transformation content showing product results",
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
    name: "Behind the Scenes",
    category: "entertainment",
    thumbnailUrl: "/assets/images/storymaker/distinguished-french-perfumer-man-in-white-lab-coa.jpg",
    description: "Show the process behind your content creation",
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
    name: "Tutorial & Tips",
    category: "entertainment",
    thumbnailUrl: "/assets/images/templates/fashion.jpg",
    description: "Educational content with entertainment value",
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
    name: "Recipe Showcase",
    category: "food",
    thumbnailUrl: "/assets/images/marketing/food.jpg",
    description: "Mouth-watering recipe presentation",
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
    name: "Food Review",
    category: "food",
    thumbnailUrl: "/assets/images/storymaker/farm-scene.jpg",
    description: "Honest food tasting and review",
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
    name: "Transformation Montage",
    category: "montage",
    thumbnailUrl: "/assets/images/storymaker/perfume-bottle-on-wooden-table-with-lavender-bouqu.jpg",
    description: "Fast-paced before and after transformation",
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
    name: "Daily Routine Montage",
    category: "montage",
    thumbnailUrl: "/assets/images/templates/moodboard.jpg",
    description: "Aesthetic daily routine in quick cuts",
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
    name: "Luxury Product Launch",
    category: "product-ads",
    thumbnailUrl: "/assets/images/storymaker/luxury-perfume-bottle-on-white-marble-pedestal-wit.jpg",
    description: "Premium product reveal with cinematic shots",
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
    name: "Problem Solution Ad",
    category: "product-ads",
    thumbnailUrl: "/assets/images/marketing/consistent.jpg",
    description: "Address customer pain points with your solution",
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
    name: "City Exploration",
    category: "travel",
    thumbnailUrl: "/assets/images/storymaker/paris-eiffel-tower-romantic.png",
    description: "Discover hidden gems in a beautiful city",
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
    name: "Nature Adventure",
    category: "travel",
    thumbnailUrl: "/assets/images/storymaker/provence-lavender-fields-at-golden-hour-purple-flo.jpg",
    description: "Outdoor adventure in stunning landscapes",
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
    name: "How It Works",
    category: "explainer",
    thumbnailUrl: "/assets/images/storymaker/perfume-ingredients-diagram.jpg",
    description: "Clear explanation of product or process",
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
    name: "Educational Tips",
    category: "explainer",
    thumbnailUrl: "/assets/images/templates/poster.jpg",
    description: "Share knowledge with helpful tips",
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
    name: "Motion Graphics Ad",
    category: "animated",
    thumbnailUrl: "/assets/images/templates/logo.jpg",
    description: "Eye-catching animated promotional content",
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
    name: "Infographic Video",
    category: "animated",
    thumbnailUrl: "/assets/images/templates/bc.jpg",
    description: "Data visualization with smooth animations",
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
    name: "Character Introduction",
    category: "anime",
    thumbnailUrl: "/assets/images/restyle/anime.jpg",
    description: "Anime-style character reveal and backstory",
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
    name: "Anime Product Commercial",
    category: "anime",
    thumbnailUrl: "/assets/images/templates/ad.jpg",
    description: "Product ad in anime art style",
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

// Initial Scenes Data
export const initialScenes: Scene[] = [
  {
    id: "1",
    name: "Scene 1",
    character: {
      id: "1",
      name: "Isabelle Laurent",
      imageUrl: "/assets/images/storymaker/elegant-french-woman-with-dark-hair-in-white-dress.jpg",
    },
    location: {
      id: "1",
      name: "Provence Lavender Fields",
      imageUrl: "/assets/images/storymaker/provence-lavender-fields-at-golden-hour-purple-flo.jpg",
    },
    sound: {
      id: "1",
      name: "Ethereal Piano - Brand Theme",
    },
    prompt: "Elegant model walking through lavender fields at golden hour, holding Lumière Parfum bottle",
    variations: [
      {
        id: "var1",
        imageUrl: "/assets/images/storymaker/elegant-woman-in-white-dress-walking-through-purpl.jpg",
        timestamp: new Date().toISOString(),
      },
      {
        id: "var2",
        imageUrl: "/assets/images/storymaker/close-up-of-hands-holding-luxury-perfume-bottle-in.jpg",
        timestamp: new Date().toISOString(),
      },
      {
        id: "var3",
        imageUrl: "/assets/images/storymaker/wide-shot-of-model-in-flowing-dress-among-lavender.jpg",
        timestamp: new Date().toISOString(),
      },
      {
        id: "var4",
        imageUrl: "/assets/images/storymaker/perfume-bottle-on-wooden-table-with-lavender-bouqu.jpg",
        timestamp: new Date().toISOString(),
      },
    ],
    videos: [
      {
        id: "v1",
        videoUrl: "/cinematic-shot-of-elegant-woman-in-lavender-field-.jpg",
        thumbnailUrl: "/assets/images/storymaker/cinematic-shot-of-elegant-woman-in-lavender-field-.jpg",
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
      imageUrl: "/assets/images/storymaker/distinguished-french-perfumer-man-in-white-lab-coa.jpg",
    },
    location: {
      id: "2",
      name: "Lumière Boutique Paris",
      imageUrl: "/assets/images/storymaker/luxury-perfume-boutique-interior.jpg",
    },
    sound: {
      id: "2",
      name: "Ambient Boutique Atmosphere",
    },
    prompt: "Luxury perfume bottle reveal on marble pedestal in modern boutique with soft lighting",
    variations: [
      {
        id: "var5",
        imageUrl: "/assets/images/storymaker/luxury-perfume-bottle-on-white-marble-pedestal-wit.jpg",
        timestamp: new Date().toISOString(),
      },
      {
        id: "var6",
        imageUrl: "/assets/images/storymaker/perfume-bottle-close-up-with-gold-accents-and-crys.jpg",
        timestamp: new Date().toISOString(),
      },
      {
        id: "var7",
        imageUrl: "/assets/images/storymaker/perfume-bottle-rotating-on-display-in-luxury-bouti.jpg",
        timestamp: new Date().toISOString(),
      },
      {
        id: "var8",
        imageUrl: "/assets/images/storymaker/perfume-bottle-with-rose-petals-on-marble-surface.jpg",
        timestamp: new Date().toISOString(),
      },
    ],
    videos: [
      {
        id: "v2",
        videoUrl: "/luxury-perfume-bottle-on-marble-pedestal-in-elegan.jpg",
        thumbnailUrl: "/assets/images/storymaker/luxury-perfume-bottle-on-marble-pedestal-in-elegan.jpg",
        status: "complete",
        prompt:
          "Slow rotating product shot of Lumière Parfum bottle on marble pedestal, soft ambient lighting, luxury boutique setting",
        duration: "0:30",
        timestamp: new Date().toISOString(),
      },
    ],
  },
]

// Project Setup Options
export const aspectRatioOptions = [
  { value: "16:9", label: "16:9 (Landscape)" },
  { value: "9:16", label: "9:16 (Portrait)" },
  { value: "1:1", label: "1:1 (Square)" },
  { value: "4:3", label: "4:3 (Standard)" },
]

export const resolutionOptions = [
  { value: "4k", label: "4K (3840x2160)" },
  { value: "1080p", label: "1080p (1920x1080)" },
  { value: "720p", label: "720p (1280x720)" },
  { value: "480p", label: "480p (854x480)" },
]

export const fpsOptions = [
  { value: "24", label: "24 FPS (Cinematic)" },
  { value: "30", label: "30 FPS (Standard)" },
  { value: "60", label: "60 FPS (Smooth)" },
]

export const aiModelOptions = [
  { value: "standard", label: "Standard Quality" },
  { value: "high", label: "High Quality (Slower)" },
  { value: "ultra", label: "Ultra Quality (Premium)" },
]

export const stylePresetOptions = [
  { value: "realistic", label: "Realistic" },
  { value: "animated", label: "Animated" },
  { value: "cinematic", label: "Cinematic" },
  { value: "artistic", label: "Artistic" },
  { value: "documentary", label: "Documentary" },
]

export const variationOptions = [
  { value: "2", label: "2 Variations" },
  { value: "4", label: "4 Variations" },
  { value: "6", label: "6 Variations" },
  { value: "8", label: "8 Variations" },
]

export function getInitialAppData(): AppData {
  return {
    scenes: initialScenes,
    characters: initialCharacters,
    locations: initialLocations,
    sounds: initialSounds,
    templates: [], // Templates imported from separate file
  }
}

// Function to create project config from template
export function createProjectConfigFromTemplate(template: any): ProjectConfig {
  return {
    projectName: template.name,
    projectDescription: template.description,
    aspectRatio: "16:9",
    duration: "60",
    fps: "30", 
    resolution: "1080p",
    autoTransitions: true,
    backgroundMusic: template.category === "animated" || template.category === "anime",
    autoSave: true,
    watermark: false,
    aiModel: template.category === "anime" ? "ultra" : "high",
    stylePreset: template.category === "anime" ? "animated" : 
                template.category === "product-ads" ? "cinematic" :
                template.category === "travel" ? "documentary" : "realistic",
    variations: "4",
  }
}