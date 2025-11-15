
'use client';
import { MarketingHeader } from '@/app/common/marketing/Header';
import { MarketingFooter } from '@/app/common/marketing/Footer';

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleAuthClick = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MarketingHeader onAuthClick={handleAuthClick} />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
      <MarketingFooter />
    </div>
  );
}
