import { useEffect } from 'react';

type UseSEOOptions = {
  title?: string;
  description?: string;
  robots?: string; // e.g., "index,follow" | "noindex,nofollow"
  canonical?: string;
};

function upsertMeta(name: string, content: string) {
  if (!content) return;
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  if (!href) return;
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

export function useSEO({ title, description, robots, canonical }: UseSEOOptions) {
  useEffect(() => {
    const baseSuffix = '두뇌수련';
    if (title) {
      document.title = `${title} | ${baseSuffix}`;
    }
    if (description) {
      upsertMeta('description', description);
      // Twitter/OG 요약 동기화(간단히 description만)
      upsertMeta('twitter:description', description);
      const ogDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement | null;
      if (ogDesc) ogDesc.setAttribute('content', description);
    }
    if (robots) {
      upsertMeta('robots', robots);
    }
    const href = canonical || (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '');
    if (href) upsertLink('canonical', href);
  }, [title, description, robots, canonical]);
}

