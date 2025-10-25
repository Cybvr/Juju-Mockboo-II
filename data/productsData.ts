
import { Video, Zap, Image as ImageIcon, Package, MessageCircle, Film, Palette, Grid3X3, BookOpen } from 'lucide-react';

export const productsData = [
  {
    id: 1,
    title: "Canvas",
    description: "Infinite design workspace for creative projects and visual collaboration",
    longDescription: "Create stunning designs with our infinite canvas tool. Perfect for mockups, presentations, and collaborative visual projects. Drag, drop, and design with unlimited creative freedom.",
    href: "/dashboard",
    image: "/assets/images/workspace.jpg",
    slug: "canvas",
    icon: Palette,
    benefits: [
      {
        title: "Infinite Canvas",
        description: "Unlimited workspace for all your creative ideas and projects"
      },
      {
        title: "Real-time Collaboration",
        description: "Work together with your team in real-time on designs"
      },
      {
        title: "Smart Tools",
        description: "AI-powered design assistance and intelligent layout suggestions"
      }
    ]
  },
  {
    id: 2,
    title: "Galleries",
    description: "Curated collections of AI-generated images for your creative projects",
    longDescription: "Create and manage beautiful image galleries with AI-generated content. Perfect for building visual libraries, inspiration boards, and organized creative collections.",
    href: "/dashboard/galleries",
    image: "/assets/images/all.jpg",
    slug: "galleries",
    icon: Grid3X3,
    benefits: [
      {
        title: "AI Generation",
        description: "Generate multiple themed images with advanced AI models"
      },
      {
        title: "Smart Organization",
        description: "Automatically organize and categorize your visual content"
      },
      {
        title: "Easy Sharing",
        description: "Share galleries publicly or privately with team members"
      }
    ]
  },
  {
    id: 3,
    title: "Stories",
    description: "AI-powered video storytelling and scene-based content creation",
    longDescription: "Craft compelling video stories with AI assistance. Create storyboards, generate scenes, and produce professional video content with intelligent narrative tools.",
    href: "/dashboard/stories",
    image: "/assets/images/scenes.jpg",
    slug: "stories",
    icon: BookOpen,
    benefits: [
      {
        title: "Storyboard Creation",
        description: "Visual story planning with AI-generated scene suggestions"
      },
      {
        title: "Video Generation",
        description: "Transform stories into professional video content"
      },
      {
        title: "Narrative Intelligence",
        description: "AI-powered story structure and pacing recommendations"
      }
    ]
  },
  {
    id: 4,
    title: "Video",
    description: "Build authentic user-generated content campaigns",
    longDescription: "Create compelling video content that converts viewers into customers. Our AI-powered video generation transforms your ideas into professional UGC-style videos that drive engagement and build trust with your audience.",
    href: "/dashboard/videos",
    image: "/assets/images/hero.jpg",
    slug: "ugc-creator",
    icon: Video,
    benefits: [
      {
        title: "Authentic Content",
        description: "Generate videos that feel genuine and relatable to your audience"
      },
      {
        title: "Brand Consistency",
        description: "Maintain your brand voice across all video content"
      },
      {
        title: "Rapid Production",
        description: "Create multiple video variations in minutes, not hours"
      }
    ]
  },
  {
    id: 5,
    title: "Upscaler",
    description: "Enhance image resolution and quality with intelligent upscaling technology.",
    longDescription: "Transform low-resolution images into crisp, high-quality visuals using advanced AI upscaling. Perfect for e-commerce, marketing materials, and any project requiring professional-grade image quality.",
    href: "/dashboard/upscale",
    image: "/assets/images/upscale.jpg",
    slug: "upscale",
    icon: Zap,
    benefits: [
      {
        title: "4x Resolution Boost",
        description: "Increase image resolution up to 4x without quality loss"
      },
      {
        title: "Smart Enhancement",
        description: "AI intelligently reconstructs details and textures"
      },
      {
        title: "Batch Processing",
        description: "Upscale multiple images simultaneously for efficiency"
      }
    ]
  },
  {
    id: 6,
    title: "Chat",
    description: "Intelligent AI assistant for creative workflows",
    longDescription: "Your creative companion powered by advanced AI. Get instant help with design decisions, content strategy, and creative problem-solving. Perfect for brainstorming and workflow optimization.",
    href: "/dashboard/chat",
    image: "/assets/images/chat.jpg",
    slug: "chat",
    icon: MessageCircle,
    benefits: [
      {
        title: "Creative Guidance",
        description: "Get expert advice on design and content creation"
      },
      {
        title: "Instant Feedback",
        description: "Receive immediate suggestions to improve your work"
      },
      {
        title: "24/7 Availability",
        description: "Access creative assistance whenever inspiration strikes"
      }
    ]
  }
];
