'use client';
import Image from 'next/image';
import { productsData } from '@/data/productsData';

export function MarketingFooter() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="px-6 py-4 lg:py-4 mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-center gap-8 mb-2 text-center">
          <div className="relative">
            <Image
              src="/images/juju.png"
              alt="Juju Logo"
              width={900}
              height={900}
            />
          </div>
          {/* Navigation items below logo */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="space-y-4">
              <h3 className="font-normal text-lg">Products</h3>
              <ul className="flex flex-col items-center space-y-3 text-muted-foreground md:flex-row md:space-y-0 md:space-x-8">
                {productsData.map((product) => (
                  <li key={product.id}>
                    <a href={product.href} className="hover:text-foreground cursor-pointer">
                      {product.icon} {product.title}
                    </a>
                  </li>
                ))}
                <li><a href="/dashboard/templates" className="hover:text-foreground cursor-pointer">Templates</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-normal text-lg">Legal</h3>
              <ul className="flex flex-col items-center space-y-3 text-muted-foreground md:flex-row md:space-y-0 md:space-x-8">
                <li className="hover:text-foreground cursor-pointer">Privacy</li>
                <li className="hover:text-foreground cursor-pointer">Terms</li>
                <li className="hover:text-foreground cursor-pointer">Security</li>
                <li className="hover:text-foreground cursor-pointer">GDPR</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t py-4  items-center gap-6">
          <p className="text-muted-foreground mx-auto md:mx-0 text-center ">
            © 2025 Juju. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}