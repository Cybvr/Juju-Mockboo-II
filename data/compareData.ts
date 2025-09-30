export interface CompetitorInfo {
  name: string;
  description: string;
  logo?: string;
  website: string;
  features: Record<string, FeatureStatus>;
}

export type FeatureStatus = {
  available: boolean;
  details?: string;
} | boolean;

export const competitors: Record<string, CompetitorInfo> = {
  juju: {
    name: "JUJU",
    description: "All-in-one AI creative platform",
    website: "https://juju.ai",
    features: {
      "AI Image Generation": { available: true, details: "Imagen 3.0" },
      "Text-to-Image": true,
      "Image Upscaling": { available: true, details: "AI-powered" },
      "Video Generation": { available: true, details: "Gemini Video" },
      "Chat Assistant": { available: false, details: "Basic" },
      "Product Mockups": { available: true, details: "Templates" },
      "UGC Creation": { available: true, details: "Community" },
      "Canvas Editor": { available: true, details: "Advanced" },
      "Template Library": { available: true, details: "Extensive" },
      "API Access": true,
      "Community Gallery": { available: true, details: "Large" },
      "Free Tier": { available: true, details: "Limited" },
      "Commercial License": { available: true, details: "Varies" },
      "Real-time Collaboration": { available: false, details: "Limited" },
      "Mobile App": { available: true, details: "iOS/Android" },
      "Batch Generation": true,
      "Custom Styles": { available: true, details: "Style library" },
      "Image Editing": { available: true, details: "Advanced" },
      "Background Remover": true,
      "Camera Controls": false,
      "Script-to-Video": false,
      "Character Consistency": { available: false, details: "Limited" }
    }
  },
  midjourney: {
    name: "Midjourney",
    description: "Popular AI image generation service via Discord",
    website: "https://midjourney.com",
    features: {
      "AI Image Generation": { available: true, details: "v6.1" },
      "Text-to-Image": true,
      "Image Upscaling": true,
      "Video Generation": false,
      "Chat Assistant": false,
      "Product Mockups": false,
      "UGC Creation": false,
      "Canvas Editor": false,
      "Template Library": false,
      "API Access": true,
      "Community Gallery": { available: true, details: "Discord" },
      "Free Tier": { available: true, details: "Very limited" },
      "Commercial License": { available: true, details: "Paid plans" },
      "Real-time Collaboration": false,
      "Mobile App": { available: true, details: "Discord only" },
      "Batch Generation": true,
      "Custom Styles": { available: true, details: "Style references" },
      "Image Editing": { available: false, details: "Limited" },
      "Background Remover": false,
      "Camera Controls": false,
      "Script-to-Video": false,
      "Character Consistency": { available: true, details: "Character refs" }
    }
  },
  higgsfield: {
    name: "Higgsfield",
    description: "AI-powered image & short video generation with cinematic effects, avatars, VFX",
    website: "https://higgsfield.ai",
    features: {
      "AI Image Generation": { available: true, details: "many visual styles and models" },
      "Text-to-Image": true,
      "Image Upscaling": { available: true, details: "image & video upscaling supported" },
      "Video Generation": { available: true, details: "short AI video, talking avatar, motion presets" },
      "Chat Assistant": false,
      "Product Mockups": false,
      "UGC Creation": { available: true, details: "UGC Factory, community creation tools" },
      "Canvas Editor": { available: true, details: "image editing, inpainting, multiple references" },
      "Template Library": { available: true, details: "many presets / effects / style packs" },
      "API Access": false,
      "Community Gallery": { available: true, details: "shared user projects / styles" },
      "Free Tier": { available: true, details: "trial / limited free or low-credit option" },
      "Commercial License": { available: true, details: "paid plans allow commercial use" },
      "Real-time Collaboration": false,
      "Mobile App": false,
      "Batch Generation": true,
      "Custom Styles": { available: true, details: "character styles, visual style presets" },
      "Image Editing": { available: true, details: "inpainting, upscaling, frame control" },
      "Background Remover": false,
      "Camera Controls": { available: true, details: "cinematic camera motion effects" },
      "Script-to-Video": false,
      "Character Consistency": { available: true, details: "consistent characters, avatars across scenes" }
    }
  },
  freepik: {
    name: "Freepik",
    description: "Design platform with AI tools and massive asset library",
    website: "https://freepik.com",
    features: {
      "AI Image Generation": { available: true, details: "Flux AI" },
      "Text-to-Image": true,
      "Image Upscaling": true,
      "Video Generation": false,
      "Chat Assistant": false,
      "Product Mockups": { available: true, details: "Mockup generator" },
      "UGC Creation": { available: true, details: "Templates" },
      "Canvas Editor": { available: true, details: "Design editor" },
      "Template Library": { available: true, details: "Millions of assets" },
      "API Access": { available: true, details: "Enterprise" },
      "Community Gallery": { available: true, details: "Public library" },
      "Free Tier": { available: true, details: "Limited downloads" },
      "Commercial License": { available: true, details: "Premium plans" },
      "Real-time Collaboration": { available: true, details: "Team features" },
      "Mobile App": { available: true, details: "iOS/Android" },
      "Batch Generation": { available: false, details: "Limited" },
      "Custom Styles": { available: true, details: "Style options" },
      "Image Editing": { available: true, details: "Advanced editor" },
      "Background Remover": { available: true, details: "AI-powered" },
      "Camera Controls": false,
      "Script-to-Video": false,
      "Character Consistency": false
    }
  },
  ideogram: {
    name: "Ideogram",
    description: "AI image generation platform with text rendering capabilities",
    website: "https://ideogram.ai",
    features: {
      "AI Image Generation": { available: true, details: "Ideogram 2.0" },
      "Text-to-Image": true,
      "Image Upscaling": { available: false, details: "Limited" },
      "Video Generation": false,
      "Chat Assistant": false,
      "Product Mockups": false,
      "UGC Creation": false,
      "Canvas Editor": { available: false, details: "Basic" },
      "Template Library": { available: false, details: "Limited" },
      "API Access": true,
      "Community Gallery": { available: true, details: "Public" },
      "Free Tier": { available: true, details: "Limited" },
      "Commercial License": { available: true, details: "Paid plans" },
      "Real-time Collaboration": false,
      "Mobile App": { available: true, details: "iOS/Android" },
      "Batch Generation": true,
      "Custom Styles": { available: true, details: "Style options" },
      "Image Editing": { available: false, details: "Basic" },
      "Background Remover": false,
      "Camera Controls": false,
      "Script-to-Video": false,
      "Character Consistency": { available: false, details: "Limited" }
    }
  },
  openart: {
    name: "OpenArt",
    description: "AI art, video, stories with credit-based plans, consistent characters, many models",
    website: "https://openart.ai",
    features: {
      "AI Image Generation": { available: true, details: "100+ premium & public models" },
      "Text-to-Image": true,
      "Image Upscaling": { available: true, details: "included in Essential+ tiers" },
      "Video Generation": { available: true, details: "Essential+ allows videos (images/text → motion)" },
      "Chat Assistant": false,
      "Product Mockups": false,
      "UGC Creation": { available: true, details: "Community models, stories" },
      "Canvas Editor": { available: true, details: "image editing, inpainting, sketch-2-image, tools" },
      "Template Library": { available: true, details: "model presets, public + premium templates" },
      "API Access": false,
      "Community Gallery": { available: true, details: "public creations, sharing" },
      "Free Tier": { available: true, details: "40 trial credits, free plan with limited features" },
      "Commercial License": { available: true, details: "paid plans allow commercial use" },
      "Real-time Collaboration": false,
      "Mobile App": false,
      "Batch Generation": { available: true, details: "bulk create hundreds of images in Advanced+" },
      "Custom Styles": { available: true, details: "personalized / custom fine-tuned models" },
      "Image Editing": { available: true, details: "tools like inpainting, image guidance, sketch-to-image" },
      "Background Remover": { available: true, details: "part of image editing tools" },
      "Camera Controls": false,
      "Script-to-Video": false,
      "Character Consistency": { available: true, details: "consistent characters up to certain number in plans" }
    }
  }
};

export const getAllFeatures = (): string[] => {
  const featureSet = new Set<string>();
  Object.values(competitors).forEach(competitor => {
    Object.keys(competitor.features).forEach(feature => {
      featureSet.add(feature);
    });
  });
  return Array.from(featureSet).sort();
};

export const getCompetitors = () => {
  const { juju, ...others } = competitors;
  return others;
};

export const pricingComparison: Record<string, { [tier: string]: string }> = {
  juju: {
    free: "Generous free tier with core features",
    plus: "$9.99/month - Enhanced features & priority",
    business: "$29.99/month - Team collaboration & advanced tools"
  },
  ideogram: {
    free: "25 images/day",
    basic: "$7/month - 400 images",
    plus: "$16/month - 1000 images"
  },
  openart: {
    free: "Free plan: 40 one-time trial credits, limited models, 4 parallel generations",
    essential: "$14/month (or ~$7/mo annual) — 4,000 credits, up to 40 videos/images, etc.",
    advanced: "$29/month — 12,000 credits, higher usage & more customization",
    infinite: "$56/month — 24,000 credits, max parallel generations & priority support",
    team: "$34.90/seat/month — team workspace features"
  },
  midjourney: {
    free: "No free tier",
    basic: "$10/month - ~200 images",
    standard: "$30/month - ~900 images"
  },
  higgsfield: {
    free: "Free / trial mode available with low credits",
    basic: "$9/month — 150 credits/month, commercial use, 2 concurrent generations",
    pro: "$29/month — 600 credits/month, more models, more concurrency",
    ultimate: "$49/month — 1,200 credits/month, more concurrent runs & features",
    creator: "$249/month — 6,000 credits, max concurrency & extras"
  },
  freepik: {
    free: "Limited downloads & watermarked",
    premium: "$10/month - Unlimited downloads",
    teams: "$15/month per user - Team features"
  }
};
