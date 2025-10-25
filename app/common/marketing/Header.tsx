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
import { ProfileDropdown } from '@/app/common/dashboard/ProfileDropdown';

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
      <div className="container mx-auto px-4 h-12 flex items-center justify-between max-w-5xl">
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/images/juju/JUJUBLACK.png"
              alt="Juju"
              width={48}
              height={48}
              className="object-contain dark:hidden"
            />
            <Image
              src="/assets/images/juju/JUJUWHITE.png"
              alt="Juju"
              width={48}
              height={48}
              className="object-contain hidden dark:block"
            />
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6"></nav>
        </div>
        
        {/* Navigation Menu - moved outside of logo container for better spacing */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <nav className="flex items-center space-x-6">
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
                          href="/products/canvas"
                          className="flex h-full w-full select-none flex-col justify-end rounded-md relative overflow-hidden p-6 no-underline outline-none focus:shadow-md"
                        >
                          <Image
                            src="/assets/images/workspace.jpg"
                            alt="Canvas Background"
                            fill
                            className="object-cover"
                          />
                          <div className="relative z-10 bg-black/50 p-4 rounded-md">
                            <div className="mb-2 mt-4 text-lg font-medium text-white">
                              🎨 Canvas
                            </div>
                            <p className="text-sm leading-tight text-white/80">
                              Infinite design workspace for creative projects and visual collaboration.
                            </p>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/products/galleries"
                          className="flex h-full w-full select-none flex-col justify-end rounded-md relative overflow-hidden p-6 no-underline outline-none focus:shadow-md"
                        >
                          <Image
                            src="/assets/images/all.jpg"
                            alt="Galleries Background"
                            fill
                            className="object-cover"
                          />
                          <div className="relative z-10 bg-black/50 p-4 rounded-md">
                            <div className="mb-2 mt-4 text-lg font-medium text-white">
                              🖼️ Galleries
                            </div>
                            <p className="text-sm leading-tight text-white/80">
                              Curated collections of AI-generated images for creative projects.
                            </p>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/products/stories"
                          className="flex h-full w-full select-none flex-col justify-end rounded-md relative overflow-hidden p-6 no-underline outline-none focus:shadow-md"
                        >
                          <Image
                            src="/assets/images/scenes.jpg"
                            alt="Stories Background"
                            fill
                            className="object-cover"
                          />
                          <div className="relative z-10 bg-black/50 p-4 rounded-md">
                            <div className="mb-2 mt-4 text-lg font-medium text-white">
                              📖 Stories
                            </div>
                            <p className="text-sm leading-tight text-white/80">
                              AI-powered video storytelling and scene-based content creation.
                            </p>
                          </div>
                        </Link>
                      </NavigationMenuLink>
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
                  Teams
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[500px] lg:w-[600px] lg:grid-cols-2">
                    <div className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/teams"
                          className="flex h-full w-full select-none flex-col justify-end rounded-md relative overflow-hidden p-6 no-underline outline-none focus:shadow-md bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                        >
                          <div className="relative z-10 bg-black/50 p-4 rounded-md">
                            <div className="mb-2 mt-4 text-lg font-medium text-white">
                              👥 All Teams
                            </div>
                            <p className="text-sm leading-tight text-white/80">
                              Discover solutions built for every team in your organization.
                            </p>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/teams/design"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">
                          🎨 Design Teams
                        </div>
                        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                          10x faster design iterations
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/teams/marketing"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">
                          📊 Marketing Teams
                        </div>
                        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                          3x more campaign output
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/teams/production"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">
                          🎬 Production Teams
                        </div>
                        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                          50% faster video production
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

            </NavigationMenuList>
            </NavigationMenu>
            <Link
              href="/templates"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Templates
            </Link>
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
        </div>
        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {!loading && user ? (
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button className="bg-primary text-white hover:bg-primary/90 border-0">
                  Go to Dashboard
                </Button>
              </Link>
              <ProfileDropdown />
            </div>
          ) : (
            <Button 
              className="bg-primary text-white hover:bg-primary/90 border-0"
              onClick={onAuthClick}
            >
              Start Creating Free
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
                  href="/products/canvas"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  🎨 Canvas
                </Link>
                <Link
                  href="/products/galleries"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  🖼️ Galleries
                </Link>
                <Link
                  href="/products/stories"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  📖 Stories
                </Link>
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
                href="/teams"
                className="text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Teams
              </Link>
              <div className="pl-4 space-y-2 border-l-2 border-muted">
                <Link
                  href="/teams"
                  className="block text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  👥 All Teams
                </Link>
                <Link
                  href="/teams/design"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  🎨 Design Teams
                </Link>
                <Link
                  href="/teams/marketing"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  📊 Marketing Teams
                </Link>
                <Link
                  href="/teams/production"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  🎬 Production Teams
                </Link>
              </div>

              <Link
                href="/templates"
                className="text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Templates
              </Link>

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
                      <Button className="w-full bg-primary text-white hover:bg-primary/90 border-0">
                        Go to Dashboard
                      </Button>
                    </Link>
                    <div className="flex justify-center">
                      <ProfileDropdown />
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full bg-primary text-white border-0"
                    onClick={() => { onAuthClick(); setIsOpen(false); }}
                  >
                    Start Creating Free
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}