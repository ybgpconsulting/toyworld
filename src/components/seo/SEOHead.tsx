import React, { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const defaultTitle = "Toy World | India's Favorite Toy Store";
const defaultDescription = "Shop the best and most genuine toys online at Toy World. Fast Pan-India delivery, easy returns, and premium quality products for all age groups.";
const defaultImage = "https://toyworld.com/og-image.jpg"; // Placeholder

export const SEOHead = ({ title, description, image, url }: SEOHeadProps) => {
  useEffect(() => {
    const pageTitle = title ? `${title} | Toy World` : defaultTitle;
    const pageDesc = description || defaultDescription;
    const pageUrl = url || window.location.href;
    const pageImage = image || defaultImage;

    document.title = pageTitle;

    // Update meta tags dynamically
    const updateMetaTag = (selector: string, attribute: string, value: string) => {
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        if (selector.includes('name')) {
          const nameMatch = selector.match(/name="([^"]+)"/);
          if (nameMatch) tag.setAttribute('name', nameMatch[1]);
        } else if (selector.includes('property')) {
          const propMatch = selector.match(/property="([^"]+)"/);
          if (propMatch) tag.setAttribute('property', propMatch[1]);
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute(attribute, value);
    };

    updateMetaTag('meta[name="description"]', 'content', pageDesc);
    updateMetaTag('meta[property="og:title"]', 'content', pageTitle);
    updateMetaTag('meta[property="og:description"]', 'content', pageDesc);
    updateMetaTag('meta[property="og:image"]', 'content', pageImage);
    updateMetaTag('meta[property="og:url"]', 'content', pageUrl);
    updateMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
    
  }, [title, description, image, url]);

  return null;
};
