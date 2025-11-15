
import { Video, Zap, Image as ImageIcon, Package, MessageCircle, Film, Palette, Grid3X3, BookOpen } from 'lucide-react';

export interface ProductData {
  id: string;
  slug: string;
  title: string;
  icon: string;
  description: string;
  benefit?: string;
  image: string;
  href: string;
  features: string[];
  buttonText: string;
  buttonAction: string;
}

export const productsData: ProductData[] = [
  {
    id: "canvas",
    slug: "canvas",
    title: "Canvas",
    icon: "🎨",
    description: "Infinite design workspace for creative projects and visual collaboration.",
    benefit: "Design without limits",
    image: "/assets/images/workspace.jpg",
    href: "/products/canvas",
    features: [
      "Infinite canvas workspace",
      "AI-powered design tools",
      "Real-time collaboration"
    ],
    buttonText: "Start Creating",
    buttonAction: "/dashboard"
  },
  {
    id: "galleries",
    slug: "galleries", 
    title: "Galleries",
    icon: "🖼️",
    description: "Curated collections of AI-generated images for creative projects.",
    benefit: "Organize and showcase",
    image: "/assets/images/all.jpg",
    href: "/products/galleries",
    features: [
      "Curated image collections",
      "Easy sharing & collaboration",
      "Professional presentation"
    ],
    buttonText: "Browse Galleries",
    buttonAction: "/dashboard/galleries"
  },
  {
    id: "stories",
    slug: "stories",
    title: "Stories", 
    icon: "📖",
    description: "AI-powered video storytelling and scene-based content creation.",
    benefit: "Tell compelling stories",
    image: "/assets/images/scenes.jpg",
    href: "/products/stories",
    features: [
      "AI video generation",
      "Scene-based storytelling", 
      "Professional video output"
    ],
    buttonText: "Create Story",
    buttonAction: "/dashboard/stories"
  }
];
