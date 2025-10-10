'use client';
import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Menu, ChevronDown } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import Image from 'next/image';
import Link from 'next/link';
import { toolsData } from '@/data/toolsData';
import { ProfileDropdown } from '@/app/common/dashboard/ProfileDropdown';
import { competitors } from '@/data/compareData';

interface MarketingHeaderProps {
  onAuthClick: () => void;
}

export function MarketingHeader({ onAuthClick }: MarketingHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, loading] = useAuthState(auth);
  const navItems = [
    { label: 'Pricing', href: '#pricing' },
  ];
  return (
    <header className="fixed top-0 w-full z-50 glass-effect border-b">
      <div className="container mx-auto px-4 h-12 flex items-center justify-between max-w-6xl">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center space-x-2">
            <div className="rounded-lg overflow-hidden w-20 h-20 flex items-center justify-center">
              <Image
                src="/images/juju.png"
                alt="Juju Logo"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
          </div>
        </Link>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50">
                  Products
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[500px] lg:w-[600px] lg:grid-cols-2">
                    <NavigationMenuLink asChild>
                      <Link
                        href="/products/mixboard"
                        className="flex h-full w-full select-none flex-col justify-end rounded-md relative overflow-hidden p-6 no-underline outline-none focus:shadow-md"
                      >
                        <Image
                          src="/assets/images/workspace.jpg"
                          alt="Mixboard Background"
                          fill
                          className="object-cover"
                        />
                        <div className="relative z-10 bg-black/50 p-4 rounded-md">
                          <div className="mb-2 mt-4 text-lg font-medium text-white">
                            🎨 Mixboard
                          </div>
                          <p className="text-sm leading-tight text-white/80">
                            Infinite canvas design tool for graphics, mockups, and creative projects.
                          </p>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/products/juju-vids"
                        className="flex h-full w-full select-none flex-col justify-end rounded-md relative overflow-hidden p-6 no-underline outline-none focus:shadow-md"
                      >
                        <Image
                          src="/assets/images/scenes.jpg"
                          alt="Juju Vids Background"
                          fill
                          className="object-cover"
                        />
                        <div className="relative z-10 bg-black/50 p-4 rounded-md">
                          <div className="mb-2 mt-4 text-lg font-medium text-white">
                            🎬 Juju Vids
                          </div>
                          <p className="text-sm leading-tight text-white/80">
                            AI-powered video creation and scene-based editing platform.
                          </p>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50">
                  Tools
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[500px] lg:w-[600px] lg:grid-cols-2">
                    <div className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/tools"
                          className="flex h-full w-full select-none flex-col justify-end rounded-md relative overflow-hidden p-6 no-underline outline-none focus:shadow-md"
                        >
                          <Image
                            src="/assets/images/all.jpg"
                            alt="Tools Background"
                            fill
                            className="object-cover"
                          />
                          <div className="relative z-10 bg-black/50 p-4 rounded-md">
                            <div className="mb-2 mt-4 text-lg font-medium text-white">
                              All Tools
                            </div>
                            <p className="text-sm leading-tight text-white/80">
                              Explore all our powerful creative tools and features.
                            </p>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                    {toolsData.slice(0, 3).map((feature) => (
                      <NavigationMenuLink asChild key={feature.id}>
                        <Link
                          href={`/tools/${feature.slug}`}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">
                            {feature.title}
                          </div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                            {feature.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50">
                  Industries
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[500px] lg:w-[600px] lg:grid-cols-2">
                    <div className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/industries"
                          className="flex h-full w-full select-none flex-col justify-end rounded-md relative overflow-hidden p-6 no-underline outline-none focus:shadow-md bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                        >
                          <div className="relative z-10 bg-black/50 p-4 rounded-md">
                            <div className="mb-2 mt-4 text-lg font-medium text-white">
                              🏢 All Industries
                            </div>
                            <p className="text-sm leading-tight text-white/80">
                              Discover solutions tailored for your industry needs.
                            </p>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/industries/ecommerce"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">
                          🛍️ E-commerce
                        </div>
                        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                          Product variations and lifestyle shots
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/industries/real-estate"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">
                          🏠 Real Estate
                        </div>
                        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                          Virtual staging and property visuals
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/industries/marketing"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">
                          📊 Marketing
                        </div>
                        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                          Campaign visuals and brand content
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50">
                  Compare
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[500px] lg:w-[600px] lg:grid-cols-2">
                    <div className="row-span-4">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/compare"
                          className="flex h-full w-full select-none flex-col justify-end rounded-md relative overflow-hidden p-6 no-underline outline-none focus:shadow-md bg-gradient-to-br from-primary/20 to-primary/5"
                        >
                          <div className="relative z-10 bg-black/50 p-4 rounded-md">
                            <div className="mb-2 mt-4 text-lg font-medium text-white">
                              🆚 Compare All
                            </div>
                            <p className="text-sm leading-tight text-white/80">
                              See detailed feature comparison between JUJU and all competitors.
                            </p>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                    {Object.entries(competitors).map(([key, competitor]) => (
                      <NavigationMenuLink asChild key={key}>
                        <Link
                          href={`/compare/${key}`}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">
                            JUJU vs {competitor.name}
                          </div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                            {competitor.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {!loading && user ? (
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Dashboard
                </Button>
              </Link>
              <ProfileDropdown />
            </div>
          ) : (
            <Button
              className="bg-primary text-white border-0"
              onClick={onAuthClick}
            >
              Get Started
            </Button>
          )}
        </div>
        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col space-y-4 mt-8">
              <Link
                href="/dashboard"
                className="text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Products
              </Link>
              <div className="pl-4 space-y-2 border-l-2 border-muted">
                <Link
                  href="/products/mixboard"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  🎨 Mixboard
                </Link>
                <Link
                  href="/products/juju-vids"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  🎬 Juju Vids
                </Link>
              </div>
              <Link
                href="/tools"
                className="text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Tools
              </Link>
              <div className="pl-4 space-y-2 border-l-2 border-muted">
                {toolsData.slice(0, 3).map((feature) => (
                  <Link
                    key={feature.id}
                    href={`/tools/${feature.slug}`}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {feature.title}
                  </Link>
                ))}
              </div>
              <Link
                href="/industries"
                className="text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Industries
              </Link>
              <div className="pl-4 space-y-2 border-l-2 border-muted">
                <Link
                  href="/industries"
                  className="block text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  🏢 All Industries
                </Link>
                <Link
                  href="/industries/ecommerce"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  🛍️ E-commerce
                </Link>
                <Link
                  href="/industries/real-estate"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  🏠 Real Estate
                </Link>
                <Link
                  href="/industries/marketing"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  📊 Marketing
                </Link>
              </div>
              <Link
                href="/compare"
                className="text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Compare
              </Link>
              <div className="pl-4 space-y-2 border-l-2 border-muted">
                <Link
                  href="/compare"
                  className="block text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  🆚 Full Comparison
                </Link>
                {Object.entries(competitors).map(([key, competitor]) => (
                  <Link
                    key={key}
                    href={`/compare/${key}`}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    JUJU vs {competitor.name}
                  </Link>
                ))}
              </div>
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t pt-4 space-y-3">
                {!loading && user ? (
                  <div className="space-y-3">
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                        Dashboard
                      </Button>
                    </Link>
                    <div className="flex justify-center">
                      <ProfileDropdown />
                    </div>
                  </div>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => { onAuthClick(); setIsOpen(false); }}
                    >
                      Sign In
                    </Button>
                    <Button
                      className="w-full bg-primary text-white border-0"
                      onClick={() => { onAuthClick(); setIsOpen(false); }}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
