
export interface JujuTemplate {
  id: string
  title: string
  prompt: string
  thumbnailImage: string
  firstFrameImage: string
  lastFrameImage: string
  tags: string[]
}

export const jujuTemplates: JujuTemplate[] = [
  {
    id: "product-360-spin",
    title: "Product 360° Spin",
    prompt: "Create a smooth 360-degree rotation of this product against a clean white background, showcasing all angles",
    thumbnailImage: "/assets/images/juju/red-leather-jacket-product-shot-white-background.jpg",
    firstFrameImage: "/assets/images/juju/red-leather-jacket-front-view-cropped-blazer-style.jpg",
    lastFrameImage: "/assets/images/juju/red-leather-jacket-back-view-cropped-blazer-with-b.jpg",
    tags: ["ecommerce", "product", "rotation"],
  },
  {
    id: "architectural-walkthrough",
    title: "Architectural Walkthrough",
    prompt: "Create a cinematic walkthrough of this architectural space, moving smoothly from exterior to interior",
    thumbnailImage: "/assets/images/juju/realistic-architectural-photography.jpg",
    firstFrameImage: "/assets/images/juju/realistic-architectural-photography.jpg",
    lastFrameImage: "/assets/images/juju/realistic-architectural-photography.jpg",
    tags: ["architecture", "walkthrough"],
  },
  {
    id: "packaging-assembly",
    title: "Product Assembly Animation",
    prompt: "Show the product packaging being assembled from flat dieline to finished package",
    thumbnailImage: "/assets/images/juju/product-packaging-dieline-mockup.jpg",
    firstFrameImage: "/assets/images/juju/product-packaging-dieline-mockup.jpg",
    lastFrameImage: "/assets/images/juju/product-packaging-dieline-mockup.jpg",
    tags: ["packaging", "assembly"],
  },
  {
    id: "character-animation",
    title: "Character Animation Loop",
    prompt: "Create a smooth animation loop of this character with natural movements and expressions",
    thumbnailImage: "/assets/images/juju/3d-character-model-turnaround-views.jpg",
    firstFrameImage: "/assets/images/juju/3d-character-model-turnaround-views.jpg",
    lastFrameImage: "/assets/images/juju/3d-character-model-turnaround-views.jpg",
    tags: ["character", "animation"],
  },
  {
    id: "lifestyle-cinemagraph",
    title: "Lifestyle Cinemagraph",
    prompt: "Create a cinemagraph with subtle motion - waves moving while the person and bottle remain still",
    thumbnailImage: "/assets/images/juju/woman-holding-bottle-on-beach-ugc-style.jpg",
    firstFrameImage: "/assets/images/juju/woman-holding-bottle-on-beach-ugc-style.jpg",
    lastFrameImage: "/assets/images/juju/woman-holding-bottle-on-beach-ugc-style.jpg",
    tags: ["lifestyle", "cinemagraph"],
  },
  {
    id: "portrait-to-action",
    title: "Portrait to Action",
    prompt: "Transform this static portrait into dynamic action - person walking and gesturing naturally",
    thumbnailImage: "/assets/images/juju/professional-linkedin-headshot-portrait.jpg",
    firstFrameImage: "/assets/images/juju/professional-linkedin-headshot-portrait.jpg",
    lastFrameImage: "/assets/images/juju/professional-linkedin-headshot-portrait.jpg",
    tags: ["portrait", "action"],
  },
  {
    id: "text-animation",
    title: "Text Animation",
    prompt: "Animate this text with dynamic effects - glowing, morphing, or floating letters",
    thumbnailImage: "/assets/images/juju/text-design-saying-bubbles.jpg",
    firstFrameImage: "/assets/images/juju/text-design-saying-bubbles.jpg",
    lastFrameImage: "/assets/images/juju/text-design-saying-bubbles.jpg",
    tags: ["text", "animation"],
  },
  {
    id: "fashion-runway",
    title: "Virtual Fashion Runway",
    prompt: "Create a runway walk animation showing the model in motion wearing these items",
    thumbnailImage: "/assets/images/juju/virtual-fashion-tryon-model-wearing-clothes.jpg",
    firstFrameImage: "/assets/images/juju/virtual-fashion-tryon-model-wearing-clothes.jpg",
    lastFrameImage: "/assets/images/juju/virtual-fashion-tryon-model-wearing-clothes.jpg",
    tags: ["fashion", "runway", "animation"],
  },
  {
    id: "brand-showcase",
    title: "Brand Product Showcase",
    prompt: "Create a dynamic brand showcase video with products appearing and transitioning smoothly",
    thumbnailImage: "/assets/images/juju/logo-product-mockup-spread-branding.jpg",
    firstFrameImage: "/assets/images/juju/logo-product-mockup-spread-branding.jpg",
    lastFrameImage: "/assets/images/juju/logo-product-mockup-spread-branding.jpg",
    tags: ["branding", "showcase"],
  },
]
