import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  schemaMarkup?: object;
}

export default function SEO({ title, description, keywords, canonicalUrl, schemaMarkup }: SEOProps) {
  useEffect(() => {
    // 1. Update Title
    const formattedTitle = title.includes('Toolique') 
      ? title 
      : `${title} | Toolique`;
    document.title = formattedTitle;

    // 2. Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // 3. Update Meta Keywords
    if (keywords && keywords.length > 0) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords.join(', '));
    }

    // 4. Update Canonical Link
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    const currentUrl = canonicalUrl || window.location.href;
    linkCanonical.setAttribute('href', currentUrl);

    // 5. Inject JSON-LD Schema
    const existingScript = document.getElementById('json-ld-schema');
    if (existingScript) {
      existingScript.remove();
    }

    if (schemaMarkup) {
      const script = document.createElement('script');
      script.id = 'json-ld-schema';
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(schemaMarkup);
      document.head.appendChild(script);
    }

    return () => {
      // Clean up injected schema on unmount to prevent duplicate schemas on page switch
      const script = document.getElementById('json-ld-schema');
      if (script) {
        script.remove();
      }
    };
  }, [title, description, keywords, canonicalUrl, schemaMarkup]);

  return null; // This component handles side-effects and renders nothing in the DOM
}

