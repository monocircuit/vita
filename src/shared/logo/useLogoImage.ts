import { useQuery } from '@tanstack/react-query';
import { findSimpleIconExact, loadSimpleIconSvg } from './simpleIconLookup';
import { wikipediaSummary } from './wikipediaApi';

export interface LogoImage {
  svg?: string;
  imageUrl?: string;
  source: 'simple-icons' | 'wikipedia' | 'none';
  attributionUrl?: string;
}

export function useLogoImage(query: string) {
  return useQuery({
    queryKey: ['logo', 'image', query] as const,
    queryFn: async (): Promise<LogoImage> => {
      const exact = findSimpleIconExact(query);
      if (exact) {
        const svg = await loadSimpleIconSvg(exact.slug);
        if (svg) return { svg, source: 'simple-icons' };
      }
      const summary = await wikipediaSummary(query);
      if (summary?.thumbnail) {
        return {
          imageUrl: summary.thumbnail.source,
          source: 'wikipedia',
          attributionUrl: summary.pageUrl,
        };
      }
      return { source: 'none' };
    },
    staleTime: 60 * 60 * 1000,
    enabled: query.trim().length > 0,
  });
}
