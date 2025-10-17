"use client"
import { Sidebar } from "@/app/common/dashboard/Sidebar"
import { MobileFooter } from "@/app/common/MobileFooter"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, loading] = useAuthState(auth)
  const pathname = usePathname()

  // Check if current page should hide sidebar
  const shouldHideSidebar = pathname?.includes('/dashboard/images') || 
    pathname?.includes('/dashboard/canvas') ||
    pathname?.includes('/dashboard/videos') ||  
    
    pathname?.match(/\/dashboard\/stories\/[^\/]+$/)

  // Always render the same structure to avoid hydration mismatch
  return (
    <div className="flex h-screen overflow-hidden">
      {!shouldHideSidebar && (
        <div className="hidden md:block">
          <Sidebar
            className="h-full"
            isExpanded={true}
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