
export interface Team {
  id: string;
  slug: string;
  title: string;
  icon: string;
  description: string;
  benefit: string;
  image: string;
  challenges: string[];
  solutions: string[];
  useCases: string[];
  tools: string[];
  testimonial: {
    quote: string;
    author: string;
    role: string;
  };
}

export const teamsData: Team[] = [
  {
    id: "design",
    slug: "design",
    title: "Design Teams",
    icon: "🎨",
    description: "Creative professionals building brands and user experiences",
    benefit: "10x faster design iterations",
    image: "/assets/images/teams/design.jpg",
    challenges: [
      "Time-consuming asset creation",
      "Maintaining brand consistency",
      "Client feedback cycles",
      "Resource limitations"
    ],
    solutions: [
      "AI-powered design generation",
      "Brand template libraries",
      "Real-time collaboration",
      "Instant variations"
    ],
    useCases: [
      "Brand identity design",
      "Marketing materials",
      "UI/UX mockups",
      "Social media content"
    ],
    tools: ["Mixboard", "Templates", "AI Generation", "Collaboration"],
    testimonial: {
      quote: "Our design workflow is now 5x faster with JUJU's AI tools",
      author: "Sarah Chen",
      role: "Creative Director"
    }
  },
  {
    id: "marketing",
    slug: "marketing", 
    title: "Marketing Teams",
    icon: "📊",
    description: "Campaign creators driving growth and engagement",
    benefit: "3x more campaign output",
    image: "/assets/images/teams/marketing.jpg",
    challenges: [
      "High content demand",
      "Multi-channel consistency",
      "A/B testing variations",
      "Campaign deadlines"
    ],
    solutions: [
      "Bulk content generation",
      "Multi-format exports",
      "Template variations",
      "Campaign workflows"
    ],
    useCases: [
      "Social media campaigns",
      "Ad creative testing",
      "Email marketing visuals",
      "Content calendars"
    ],
    tools: ["Templates", "Bulk Generation", "A/B Testing", "Analytics"],
    testimonial: {
      quote: "We launch campaigns 70% faster and see better engagement",
      author: "Marcus Johnson",
      role: "Marketing Manager"
    }
  },
  {
    id: "production",
    slug: "production",
    title: "Production Teams", 
    icon: "🎬",
    description: "Content creators bringing stories to life",
    benefit: "50% faster video production",
    image: "/assets/images/teams/production.jpg",
    challenges: [
      "Long rendering times",
      "Complex editing workflows",
      "Asset management",
      "Version control"
    ],
    solutions: [
      "AI video generation",
      "Scene-based editing",
      "Cloud rendering",
      "Asset libraries"
    ],
    useCases: [
      "Video storytelling",
      "Product demos",
      "Social content",
      "Advertising spots"
    ],
    tools: ["Juju Vids", "Scene Editor", "AI Generation", "Cloud Rendering"],
    testimonial: {
      quote: "Our video production pipeline is completely transformed",
      author: "Emma Davis",
      role: "Video Producer"
    }
  },
  {
    id: "it",
    slug: "it",
    title: "IT Teams",
    icon: "💻", 
    description: "Tech teams managing creative workflows and infrastructure",
    benefit: "90% less maintenance overhead",
    image: "/assets/images/teams/it.jpg",
    challenges: [
      "Software licensing costs",
      "Infrastructure management", 
      "User access control",
      "Tool integration"
    ],
    solutions: [
      "Cloud-based platform",
      "Centralized administration",
      "SSO integration",
      "API connectivity"
    ],
    useCases: [
      "User provisioning",
      "Workflow automation",
      "System integration",
      "Performance monitoring"
    ],
    tools: ["Admin Dashboard", "API", "SSO", "Analytics"],
    testimonial: {
      quote: "JUJU simplified our creative tool management completely",
      author: "David Park",
      role: "IT Director"
    }
  },
  {
    id: "sales",
    slug: "sales",
    title: "Sales Teams",
    icon: "💼",
    description: "Revenue generators creating compelling presentations",
    benefit: "2x faster proposal creation",
    image: "/assets/images/teams/sales.jpg", 
    challenges: [
      "Generic presentations",
      "Long proposal cycles",
      "Visual mockup needs",
      "Client customization"
    ],
    solutions: [
      "Custom pitch decks",
      "Product visualizations", 
      "Client mockups",
      "Quick customization"
    ],
    useCases: [
      "Sales presentations",
      "Product mockups",
      "Proposal visuals",
      "Client demos"
    ],
    tools: ["Mockups", "Templates", "Customization", "Presentations"],
    testimonial: {
      quote: "Our close rate improved 40% with better visual presentations",
      author: "Lisa Wang",
      role: "Sales Director"
    }
  },
  {
    id: "content",
    slug: "content",
    title: "Content Teams",
    icon: "📝",
    description: "Storytellers creating engaging digital experiences", 
    benefit: "4x more content output",
    image: "/assets/images/teams/content.jpg",
    challenges: [
      "Content volume demands",
      "Visual asset needs",
      "Platform variations",
      "Consistent quality"
    ],
    solutions: [
      "AI content generation",
      "Multi-format creation",
      "Template libraries",
      "Quality automation"
    ],
    useCases: [
      "Blog visuals",
      "Social content",
      "Video thumbnails", 
      "Infographics"
    ],
    tools: ["Content Generator", "Templates", "Multi-format", "AI Writing"],
    testimonial: {
      quote: "We create 5x more content with half the resources",
      author: "Alex Rivera",
      role: "Content Manager"
    }
  }
];

export function getTeamBySlug(slug: string): Team | undefined {
  return teamsData.find(team => team.slug === slug);
}
