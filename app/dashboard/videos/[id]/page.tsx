// @/app/dashboard/scenes/[id]/page.tsx
"use client"

import { use } from "react"
import { ScenesVideoEditor } from "../common/scenes-video-editor"

interface ScenesPageProps {
  params: Promise<{ id: string }>
}

export default function ScenePage({ params }: ScenesPageProps) {
  const { id } = use(params)
  
  return (
    <div className="min-h-screen">
      <ScenesVideoEditor projectId={id} />
    </div>
  )
}
