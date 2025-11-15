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
import { productsData } from '@/data/productsData';

interface MarketingHeaderProps {
  onAuthClick: () => void;
}

export function MarketingHeader({ onAuthClick }: MarketingHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, loading] = useAuthState(auth);
  const navItems = [
    { label: 'Pricing', href: '/pricing' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 glass-effect border-none">
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
                      {productsData.map((product) => (
                        <NavigationMenuLink key={product.id} asChild>
                          <Link
                            href={product.href}
                            className="flex h-full w-full select-none flex-col justify-end rounded-md relative overflow-hidden p-6 no-underline outline-none focus:shadow-md"
                          >
                            <Image
                              src={product.image}
                              alt={`${product.title} Background`}
                              fill
                              className="object-cover"
                            />
                            <div className="relative z-10 bg-black/50 p-4 rounded-md">
                              <div className="mb-2 mt-4 text-lg font-medium text-white">
                                {product.icon} {product.title}
                              </div>
                              <p className="text-sm leading-tight text-white/80">
                                {product.description}
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      ))}
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
                {productsData.map((product) => (
                  <Link
                    key={product.id}
                    href={product.href}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {product.icon} {product.title}
                  </Link>
                ))}
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
