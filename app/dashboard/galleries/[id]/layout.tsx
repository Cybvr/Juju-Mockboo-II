import { galleryService } from "@/services/galleryService";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const gallery = await galleryService.getGalleryById(params.id).catch(() => null);

  return {
    title: gallery?.title ? `${gallery.title} | Juju` : "Gallery | Juju",
    description: gallery?.prompt || "AI-generated gallery",
    openGraph: gallery?.images?.length
      ? { images: [gallery.images[0]], title: gallery.title }
      : undefined,
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
