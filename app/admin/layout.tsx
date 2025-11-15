"use client"

import { DashboardHeader as Header } from '@/app/common/dashboard/Header';
import { MobileFooter } from '@/app/common/MobileFooter';
import { Users, FileText, Layout, Home, Brain } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AdminNav = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/documents', label: 'Documents', icon: FileText },
    { href: '/admin/stories', label: 'Stories', icon: FileText },
  ];

  return (
    <nav className="border-b bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex space-x-8">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors ${
                pathname === href
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AdminNav />
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      <MobileFooter />
    </div>
  );
}