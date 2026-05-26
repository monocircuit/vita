import { useQuery } from '@tanstack/react-query';
import { searchSimpleIcons } from './simpleIconLookup';
import { wikipediaSearch, type WikipediaSearchHit } from './wikipediaApi';

export interface LogoSearchResult {
  title: string;
  source: 'simple-icons' | 'wikipedia';
  slug?: string;
  description?: string;
}

export function useLogoSearch(query: string) {
  return useQuery({
    queryKey: ['logo', 'search', query] as const,
    queryFn: async (): Promise<LogoSearchResult[]> => {
      const icons = searchSimpleIcons(query, 6);
      const iconResults: LogoSearchResult[] = icons.map((i) => ({
        title: i.title,
        source: 'simple-icons',
        slug: i.slug,
      }));
      let wiki: WikipediaSearchHit[] = [];
      try {
        wiki = await wikipediaSearch(query, 4);
      } catch {
        wiki = [];
      }
      const wikiResults: LogoSearchResult[] = wiki.map((w) => ({
        title: w.title,
        source: 'wikipedia',
        description: w.description,
      }));
      return [...iconResults, ...wikiResults];
    },
    staleTime: 5 * 60 * 1000,
    enabled: query.trim().length > 0,
  });
}
