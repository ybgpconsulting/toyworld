import React, { useState, useEffect } from 'react';
import { HomepageBanner } from '../../types';

interface BannerCarouselProps {
  banners: HomepageBanner[];
}

export const BannerCarousel = ({ banners }: BannerCarouselProps) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  return (
    <div className="relative w-full h-[40vh] md:h-[60vh] overflow-hidden group">
      {banners.map((banner, idx) => (
        <a 
          key={banner.id} 
          href={banner.link}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Desktop Image */}
          <img 
            src={banner.imageUrl} 
            alt={banner.title || 'Banner'} 
            className="hidden md:block w-full h-full object-cover"
          />
          {/* Mobile Image */}
          <img 
            src={banner.mobileImageUrl || banner.imageUrl} 
            alt={banner.title || 'Banner'} 
            className="md:hidden w-full h-full object-cover"
          />
        </a>
      ))}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx === current ? 'bg-[var(--brand-orange)] w-6' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
