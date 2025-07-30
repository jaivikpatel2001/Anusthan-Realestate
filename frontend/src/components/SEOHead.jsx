import { useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';

const SEOHead = ({ 
  title = '', 
  description = '', 
  keywords = [], 
  image = null,
  url = null,
  type = 'website',
  noIndex = false 
}) => {
  const { getPageTitle, getMetaDescription, getMetaKeywords, seo, companyName } = useSettings();

  useEffect(() => {
    // Update document title
    document.title = getPageTitle(title);

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', getMetaDescription(description));
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = getMetaDescription(description);
      document.head.appendChild(meta);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    const keywordsContent = getMetaKeywords(keywords);
    if (keywordsContent) {
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywordsContent);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'keywords';
        meta.content = keywordsContent;
        document.head.appendChild(meta);
      }
    }

    // Update robots meta tag
    const robotsMeta = document.querySelector('meta[name="robots"]');
    const robotsContent = noIndex ? 'noindex, nofollow' : 'index, follow';
    if (robotsMeta) {
      robotsMeta.setAttribute('content', robotsContent);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = robotsContent;
      document.head.appendChild(meta);
    }

    // Update Open Graph tags
    const currentUrl = url || window.location.href;
    const ogImage = image || seo.ogImage?.url;

    // OG Title
    updateOrCreateMetaTag('property', 'og:title', getPageTitle(title));
    
    // OG Description
    updateOrCreateMetaTag('property', 'og:description', getMetaDescription(description));
    
    // OG Type
    updateOrCreateMetaTag('property', 'og:type', type);
    
    // OG URL
    updateOrCreateMetaTag('property', 'og:url', currentUrl);
    
    // OG Site Name
    updateOrCreateMetaTag('property', 'og:site_name', companyName);
    
    // OG Image
    if (ogImage) {
      updateOrCreateMetaTag('property', 'og:image', ogImage);
      updateOrCreateMetaTag('property', 'og:image:alt', getPageTitle(title));
    }

    // Twitter Card tags
    updateOrCreateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateOrCreateMetaTag('name', 'twitter:title', getPageTitle(title));
    updateOrCreateMetaTag('name', 'twitter:description', getMetaDescription(description));
    if (ogImage) {
      updateOrCreateMetaTag('name', 'twitter:image', ogImage);
    }

    // Canonical URL
    updateOrCreateLinkTag('canonical', currentUrl);

  }, [title, description, keywords, image, url, type, noIndex, getPageTitle, getMetaDescription, getMetaKeywords, seo, companyName]);

  return null; // This component doesn't render anything
};

// Helper function to update or create meta tags
const updateOrCreateMetaTag = (attribute, value, content) => {
  let meta = document.querySelector(`meta[${attribute}="${value}"]`);
  if (meta) {
    meta.setAttribute('content', content);
  } else {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, value);
    meta.setAttribute('content', content);
    document.head.appendChild(meta);
  }
};

// Helper function to update or create link tags
const updateOrCreateLinkTag = (rel, href) => {
  let link = document.querySelector(`link[rel="${rel}"]`);
  if (link) {
    link.setAttribute('href', href);
  } else {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    link.setAttribute('href', href);
    document.head.appendChild(link);
  }
};

export default SEOHead;
