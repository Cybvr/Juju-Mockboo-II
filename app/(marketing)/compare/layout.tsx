'use client';
import { useState } from 'react';
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
    <div>
      <MarketingHeader onAuthClick={handleAuthClick} />
      <div>
        {children}
      </div>
      <MarketingFooter />
    </div>
  );
}