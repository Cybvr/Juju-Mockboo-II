
"use client"

interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
}

export function GeneratingMedia({ isVisible, message = "Generating..." }: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-card border rounded-lg p-6 flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-foreground">{message}</p>
      </div>
    </div>
  )
}
