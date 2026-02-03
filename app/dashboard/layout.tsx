"use client"
import { Sidebar } from "@/app/common/dashboard/Sidebar"
import { MobileFooter } from "@/app/common/MobileFooter"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, loading] = useAuthState(auth)
  const pathname = usePathname()
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if current page should hide sidebar
  const shouldHideSidebar = pathname?.includes('/dashboard/images') ||
    pathname?.includes('/dashboard/videos')

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Dot Grid Background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #9ca3af 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />
      {!shouldHideSidebar && (
        <div className="hidden md:block">
          <Sidebar
            className="h-full"
            isExpanded={sidebarExpanded}
            onToggle={() => setSidebarExpanded(!sidebarExpanded)}
          />
        </div>
      )}
      <main className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex min-h-screen items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          children
        )}
      </main>
      {!shouldHideSidebar && <MobileFooter />}
    </div>
  )
}