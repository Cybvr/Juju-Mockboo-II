"use client"
import { Button } from "@/components/ui/button"

interface Gallery3DHeroProps {
  onAuthClick?: () => void;
  onNavigate?: (path: string) => void;
}

export function Gallery3DHero({ onAuthClick, onNavigate }: Gallery3DHeroProps) {
  return (
    <div className="relative w-full pt-16">
      <div className=" flex items-center justify-center pointer-events-none">
        <div className="text-center max-w-4xl mx-auto px-6 pointer-events-auto">
          <h1 className="text-5xl lg:text-7xl font-semibold text-white mb-6 leading-tight drop-shadow-lg">
            Dream It.<br />Design It.<br />Done.
          </h1>
          <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow">
            Your Image and Video Concepting App. Turn your ideas into stunning visuals in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="px-8 py-6 text-lg rounded-full bg-white hover:bg-white/90 text-black hover:text-black border-0 shadow-lg"
              onClick={onAuthClick}
            >
              Start Creating Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg rounded-full text-white hover:bg-white/10 hover:text-white border-0 shadow-lg"
              onClick={() => onNavigate?.('/templates')}
            >
              View Templates
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 border-2 border-white/20" />
                ))}
              </div>
              <span>10,000+ creators</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⭐⭐⭐⭐⭐</span>
              <span>4.9/5 rating</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}