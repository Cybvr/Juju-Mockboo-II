"use client"
import { useState, useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { GoHomeFill } from "react-icons/go"
import { PiSlideshowBold } from "react-icons/pi"
import { IoAlbumsOutline } from "react-icons/io5"
import { IoLayersOutline } from "react-icons/io5"
import { HiOutlineVideoCamera } from "react-icons/hi2"
import { PiPaletteBold } from "react-icons/pi"
import Link from "next/link"
import { userService } from "@/services/userService"

export default function DashboardPage() {
  const [user, loading] = useAuthState(auth)
  const router = useRouter()
  const [userName, setUserName] = useState<string>("")
  const [greeting, setGreeting] = useState<string>("")
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);

  const features = [
    {
      mediaUrl: '/assets/videos/1.mp4',
      mediaType: 'video',
      label: 'Kling 2.5 now available in Shorts'
    },
    {
      mediaUrl: '/assets/images/hero.jpg',
      mediaType: 'image',
      label: 'Enhanced AI voice narration with 50+ new voices'
    },
    {
      mediaUrl: '/assets/videos/2.mp4',
      mediaType: 'video',
      label: 'Real-time collaboration on Canvas projects'
    }
  ];

  const goToPreviousFeature = () => {
    setCurrentFeatureIndex((prevIndex) =>
      prevIndex === 0 ? features.length - 1 : prevIndex - 1
    );
  };

  const goToNextFeature = () => {
    setCurrentFeatureIndex((prevIndex) =>
      prevIndex === features.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
  };

  useEffect(() => {
    const interval = setInterval(() => {
      goToNextFeature();
    }, 3000);

    return () => clearInterval(interval);
  }, [currentFeatureIndex]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return
      try {
        const firestoreUser = await userService.getUserById(user.uid)
        if (firestoreUser) {
          setUserName(firestoreUser.name || user.displayName || user.email?.split('@')[0] || "")
        } else {
          setUserName(user.displayName || user.email?.split('@')[0] || "")
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        setUserName(user.displayName || user.email?.split('@')[0] || "")
      }
    }
    fetchUserData()
  }, [user])

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting("Good morning")
    } else if (hour < 18) {
      setGreeting("Good afternoon")
    } else {
      setGreeting("Good evening")
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const navCards = [
    {
      title: 'Stories',
      description: 'Create and manage your stories',
      icon: PiSlideshowBold,
      href: '/dashboard/stories',
      color: 'text-blue-500'
    },
    {
      title: 'Canvas',
      description: 'Design and create visual content',
      icon: PiPaletteBold,
      href: '/dashboard/canvas',
      color: 'text-orange-500'
    },
    {
      title: 'Shorts',
      description: 'Generate short videos',
      icon: HiOutlineVideoCamera,
      href: '/dashboard/shorts',
      color: 'text-red-500'
    },
    {
      title: 'Galleries',
      description: 'Browse and organize your galleries',
      icon: IoAlbumsOutline,
      href: '/dashboard/galleries',
      color: 'text-green-500'
    },
    {
      title: 'Templates',
      description: 'Use pre-made templates',
      icon: IoLayersOutline,
      href: '/dashboard/templates',
      color: 'text-purple-500'
    }
  ]

  return (
    <div className="flex-1 flex flex-col overflow-hidden mx-auto max-w-4xl">
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-8">
          {/* Carousel of features */}
          <div className="relative overflow-hidden rounded-lg">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentFeatureIndex * 100}%)` }}
            >
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="min-w-full h-64 relative bg-muted"
                >
                  {feature.mediaType === 'video' ? (
                    <video
                      src={feature.mediaUrl}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      onError={(e) => {
                        // Fallback to gradient background on error
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <img
                      src={feature.mediaUrl}
                      alt={feature.label}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to gradient background on error
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}

                  {/* Fallback gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 -z-10"></div>

                  {/* Overlay and text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-white font-semibold text-lg">{feature.label}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={goToPreviousFeature} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75">
              ←
            </button>
            <button onClick={goToNextFeature} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75">
              →
            </button>
            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeatureIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${index === currentFeatureIndex ? 'bg-white w-6' : 'bg-white bg-opacity-50'}`}
                />
              ))}
            </div>
          </div>

          {/* Greeting */}
          <div>
            <h1 className="text-3xl font-bold">
              {greeting}{userName && `, ${userName}`}!
            </h1>
            <p className="text-muted-foreground mt-2">
              What would you like to create today?
            </p>
          </div>

          {/* Nav cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {navCards.map((card) => {
              const Icon = card.icon
              return (
                <Link key={card.href} href={card.href}>
                  <div className="transition-all duration-200 cursor-pointer h-full p-2 rounded-3xl border border-border bg-card">
                    <div className="flex flex-col items-start text-left space-y-3">
                      <div className={`p-2 rounded-full bg-gradient-to-br ${
                        card.title === 'Stories' ? 'from-blue-100 to-blue-200' :
                        card.title === 'Canvas' ? 'from-orange-100 to-orange-200' :
                        card.title === 'Shorts' ? 'from-red-100 to-red-200' :
                        card.title === 'Galleries' ? 'from-green-100 to-green-200' :
                        'from-purple-100 to-purple-200'
                      }`}>
                        <Icon className={`h-6 w-6 ${card.color}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-1">{card.title}</h3>
                        <p className="text-sm text-muted-foreground">{card.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}