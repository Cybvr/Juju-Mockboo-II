import { Video, Zap, Image as ImageIcon, Package, MessageCircle, Film } from 'lucide-react';

export const productsData = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
    title: "Images",
    description: "Edit images with natural language using Nano-banana's advanced AI.",
    longDescription: "Revolutionary image editing powered by natural language commands. Simply describe what you want to change, and watch as our AI transforms your images with precision and creativity.",
    href: "/dashboard/images",
    image: "/assets/images/nano.jpg",
    slug: "nano-banana",
    icon: ImageIcon,
    benefits: [
      {
        title: "Natural Language Editing",
        description: "Edit images by simply describing your vision in plain English"
      },
      {
        title: "Precise Control",
        description: "Make targeted adjustments without affecting the rest of your image"
      },
      {
        title: "Creative Flexibility",
        description: "Experiment with styles, colors, and compositions effortlessly"
      }
    ]
  },
  {
    id: 4,
    title: "Multiply",
    description: "Transform one design into multiple professional versions instantly",
    longDescription: "Scale your design workflow with intelligent variation generation. Create multiple professional versions of your designs for different platforms, audiences, and use cases in seconds.",
    href: "/dashboard/multiply",
    image: "/assets/images/multiply.jpg",
    slug: "brand-multiply",
    icon: Package,
    benefits: [
      {
        title: "Instant Variations",
        description: "Generate multiple design versions from a single source"
      },
      {
        title: "Platform Optimization",
        description: "Automatically adapt designs for different social platforms"
      },
      {
        title: "Brand Consistency",
        description: "Maintain visual coherence across all generated variations"
      }
    ]
  },
  {
    id: 5,
    title: "Scenes",
    description: "Professional video editor for your AI-generated content",
    longDescription: "Transform your generated images and videos into polished productions. Advanced video editing tools designed specifically for AI-created content, with intuitive controls for cutting, effects, and post-production.",
    href: "/dashboard/scenes",
    image: "/assets/images/scenes.jpg",
    slug: "scenes",
    icon: Film,
    benefits: [
      {
        title: "AI-Optimized Editing",
        description: "Tools designed specifically for AI-generated content workflows"
      },
      {
        title: "Professional Effects",
        description: "Add transitions, filters, and effects to elevate your videos"
      },
      {
        title: "Seamless Integration",
        description: "Edit content directly from your Video and Images tools"
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