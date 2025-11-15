
export const industriesData = [
  {
    id: "ecommerce",
    slug: "ecommerce",
    title: "E-commerce",
    icon: "🛍️",
    description: "Product variations, lifestyle shots, seasonal imagery",
    benefit: "90% reduction in photography costs",
    image: "/assets/images/marketing/ecomms.jpg",
    challenges: [
      "Expensive product photography",
      "Limited seasonal variations",
      "Slow time-to-market for new products",
      "Inconsistent product imagery"
    ],
    solutions: [
      "Generate unlimited product variations",
      "Create seasonal campaigns instantly",
      "AI-powered lifestyle shots",
      "Consistent brand imagery"
    ],
    useCases: [
      "Product catalog expansion",
      "Seasonal marketing campaigns",
      "A/B testing product images",
      "Social media content"
    ],
    testimonial: {
      quote: "JUJU helped us create 500+ product variations in a single day",
      author: "Sarah Chen",
      role: "E-commerce Manager"
    }
  },
  {
    id: "real-estate",
    slug: "real-estate", 
    title: "Real Estate",
    icon: "🏠",
    description: "Furnished rooms, decor styles, exterior variants",
    benefit: "Properties sell 73% faster with professional visuals",
    image: "/assets/images/marketing/real.jpg",
    challenges: [
      "Empty properties look unappealing",
      "Expensive staging costs",
      "Limited design variations",
      "Seasonal exterior shots"
    ],
    solutions: [
      "Virtual staging solutions",
      "Multiple decor styles",
      "Seasonal property variations",
      "Professional listing photos"
    ],
    useCases: [
      "Virtual home staging",
      "Property marketing materials",
      "Before/after renovations",
      "Seasonal property shots"
    ],
    testimonial: {
      quote: "Our listings get 3x more views with JUJU's virtual staging",
      author: "Mike Rodriguez",
      role: "Real Estate Agent"
    }
  },
  {
    id: "marketing",
    slug: "marketing",
    title: "Marketing Agencies",
    icon: "📊",
    description: "Branded content, campaign visuals, client mockups",
    benefit: "80% faster campaign delivery",
    image: "/assets/images/marketing/agency.png",
    challenges: [
      "High design production costs",
      "Long turnaround times",
      "Client revision cycles",
      "Maintaining brand consistency"
    ],
    solutions: [
      "Rapid campaign creation",
      "Brand-consistent visuals",
      "Instant client mockups",
      "Automated design variations"
    ],
    useCases: [
      "Social media campaigns",
      "Client presentations",
      "Ad creative testing",
      "Brand mockups"
    ],
    testimonial: {
      quote: "We deliver campaigns 5x faster and clients love the results",
      author: "Jessica Park",
      role: "Creative Director"
    }
  },
  {
    id: "small-business",
    slug: "small-business",
    title: "Small Business", 
    icon: "🏪",
    description: "Location-specific, branded imagery on any budget",
    benefit: "Professional visuals without breaking the bank",
    image: "/assets/images/marketing/brand.jpg",
    challenges: [
      "Limited marketing budgets",
      "No in-house design team",
      "Generic stock photos",
      "Inconsistent branding"
    ],
    solutions: [
      "Affordable professional visuals",
      "Easy-to-use design tools",
      "Custom branded content",
      "Location-specific imagery"
    ],
    useCases: [
      "Social media content",
      "Website imagery",
      "Local advertising",
      "Business presentations"
    ],
    testimonial: {
      quote: "Finally, professional visuals that fit our small business budget",
      author: "Tom Williams",
      role: "Small Business Owner"
    }
  },
  {
    id: "print-on-demand",
    slug: "print-on-demand",
    title: "Print-on-Demand",
    icon: "👕",
    description: "Endless themed collections, seasonal designs",
    benefit: "Build infinite product catalogs",
    image: "/assets/images/marketing/print.png", 
    challenges: [
      "Limited design collections",
      "Seasonal demand spikes",
      "High design costs",
      "Trend responsiveness"
    ],
    solutions: [
      "Unlimited design variations",
      "Trend-responsive collections",
      "Automated seasonal designs",
      "Cost-effective production"
    ],
    useCases: [
      "T-shirt designs",
      "Seasonal collections", 
      "Niche market products",
      "Trending topic designs"
    ],
    testimonial: {
      quote: "Our design catalog grew from 50 to 5000+ products overnight",
      author: "Alex Kumar", 
      role: "Print Business Owner"
    }
  },
  {
    id: "food-beverage",
    slug: "food-beverage",
    title: "Food & Beverage",
    icon: "🍕",
    description: "Appetizing food shots, menu variants, seasonal specials",
    benefit: "Always fresh, appetizing imagery",
    image: "/assets/images/marketing/food.jpg",
    challenges: [
      "Food styling costs",
      "Perishable ingredients",
      "Menu updates",
      "Seasonal offerings"
    ],
    solutions: [
      "AI-generated food photography",
      "Menu visualization",
      "Seasonal special graphics",
      "Consistent food styling"
    ],
    useCases: [
      "Menu photography",
      "Social media posts",
      "Delivery app listings",
      "Promotional materials"
    ],
    testimonial: {
      quote: "Our food photos look better than expensive styled shoots",
      author: "Maria Santos",
      role: "Restaurant Manager"
    }
  }
]

export const getIndustryBySlug = (slug: string) => {
  return industriesData.find(industry => industry.slug === slug)
}

export const getAllIndustries = () => {
  return industriesData
}
