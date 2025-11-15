export interface StyleTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  thumbnail: string;
}

export const STYLE_TEMPLATES: StyleTemplate[] = [
  {
    id: "photorealistic",
    name: "Photorealistic",
    description: "Sharp, detailed photography style",
    prompt: "Transform this image into a photorealistic style with sharp details, natural lighting, and lifelike textures. Maintain the original composition and subjects while enhancing realism.",
    thumbnail: "/assets/images/restyle/photorealistic.jpg"
  },
  {
    id: "oil-painting",
    name: "Oil Painting",
    description: "Classical oil painting with visible brushstrokes",
    prompt: "Transform this image into a classical oil painting style with visible brushstrokes, rich colors, and painterly textures. Use traditional oil painting techniques and composition.",
    thumbnail: "/assets/images/restyle/oil-painting.jpg"
  },
  {
    id: "watercolor",
    name: "Watercolor",
    description: "Soft watercolor painting with flowing colors",
    prompt: "Transform this image into a watercolor painting style with soft, flowing colors, transparent washes, and organic edges. Create a dreamy, artistic interpretation.",
    thumbnail: "/assets/images/restyle/watercolor.jpg"
  },
  {
    id: "anime",
    name: "Anime",
    description: "Japanese anime and manga art style",
    prompt: "Transform this image into anime/manga art style with clean lines, vibrant colors, expressive features, and characteristic anime aesthetics.",
    thumbnail: "/assets/images/restyle/anime.jpg"
  },
  {
    id: "van-gogh",
    name: "Van Gogh",
    description: "Swirling brushstrokes like Vincent van Gogh",
    prompt: "Transform this image into Vincent van Gogh's artistic style with characteristic swirling brushstrokes, bold colors, and expressive impasto technique.",
    thumbnail: "/assets/images/restyle/van-gogh.jpg"
  },
  {
    id: "pop-art",
    name: "Pop Art",
    description: "Bold colors and graphic style",
    prompt: "Transform this image into pop art style with bold, saturated colors, high contrast, and graphic elements reminiscent of Andy Warhol and Roy Lichtenstein.",
    thumbnail: "/assets/images/restyle/pop-art.jpg"
  },
  {
    id: "sketch",
    name: "Pencil Sketch",
    description: "Hand-drawn pencil sketch",
    prompt: "Transform this image into a detailed pencil sketch with fine lines, shading, and artistic hand-drawn qualities.",
    thumbnail: "/assets/images/restyle/sketch.jpg"
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Futuristic neon-lit cyberpunk aesthetic",
    prompt: "Transform this image into cyberpunk style with neon lighting, futuristic elements, dark atmosphere, and high-tech aesthetic.",
    thumbnail: "/assets/images/restyle/cyberpunk.jpg"
  },
  {
    id: "vintage",
    name: "Vintage Film",
    description: "Retro film photography look",
    prompt: "Transform this image into vintage film photography style with warm tones, slight grain, and nostalgic color grading reminiscent of analog film.",
    thumbnail: "/assets/images/restyle/vintage.jpg"
  },
];

export function getStylePrompt(styleId: string): string | null {
  const style = STYLE_TEMPLATES.find(template => template.id === styleId);
  return style?.prompt || null;
}
