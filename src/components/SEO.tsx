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
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (keywords && keywords.length > 0) {
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords.join(', '));
    } else if (metaKeywords) {
      metaKeywords.setAttribute('content', 'Toolique, Online Tools, Calculators, Developer Utilities');
    }

    // 4. Update Canonical Link
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    // Clean canonical URL by stripping query parameters/hash values to avoid duplicate content penalties
    const currentUrl = canonicalUrl || (window.location.origin + window.location.pathname);
    linkCanonical.setAttribute('href', currentUrl);

    // 5. Update Open Graph Meta Tags (Dynamic Social Sharing)
    const setMetaProperty = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setMetaProperty('og:title', formattedTitle);
    setMetaProperty('og:description', description);
    setMetaProperty('og:type', 'website');
    setMetaProperty('og:locale', 'en_IN');
    setMetaProperty('og:url', currentUrl);
    setMetaProperty('og:image', 'https://www.toolique.in/favicon-512x512.png');
    setMetaProperty('og:image:width', '512');
    setMetaProperty('og:image:height', '512');
    setMetaProperty('og:site_name', 'Toolique');

    // 6. Update Twitter Card Meta Tags
    const setMetaName = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setMetaName('twitter:card', 'summary_large_image');
    setMetaName('twitter:title', formattedTitle);
    setMetaName('twitter:description', description);
    setMetaName('twitter:image', 'https://toolique.in/og-image.png');



    // 8. Inject JSON-LD Schema
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

