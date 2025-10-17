import { galleryService } from "@/services/galleryService";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const gallery = await galleryService.getGalleryById(params.id).catch(() => null);

  return {
    title: gallery?.title ? `${gallery.title} | Juju` : "Public Gallery | Juju",
    description: gallery?.prompt || "Explore this AI-generated public gallery",
    openGraph: gallery?.images?.length
      ? { images: [gallery.images[0]], title: gallery.title }
      : undefined,
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
