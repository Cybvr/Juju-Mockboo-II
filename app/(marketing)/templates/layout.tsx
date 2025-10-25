
'use client';
import { MarketingHeader } from '@/app/common/marketing/Header';
import { MarketingFooter } from '@/app/common/marketing/Footer';

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleAuthClick = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <MarketingHeader onAuthClick={handleAuthClick} />
      <div className="pt-4 lg:pt-12">
        {children}
      </div>
      <MarketingFooter />
    </div>
  );
}
