"use client"
import { useState, useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { DocumentGallery } from "@/app/common/dashboard/DocumentGallery"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [user, loading] = useAuthState(auth)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden mx-auto max-w-4xl">
      <main className="flex-1 overflow-y-auto p-3 lg:p-6">
        <DocumentGallery />
      </main>
    </div>
  )
}
