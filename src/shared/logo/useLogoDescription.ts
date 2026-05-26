import { useQuery } from '@tanstack/react-query';
import { wikipediaSummary } from './wikipediaApi';

export function useLogoDescription(query: string) {
  return useQuery({
    queryKey: ['logo', 'description', query] as const,
    queryFn: () => wikipediaSummary(query),
    staleTime: 60 * 60 * 1000,
    enabled: query.trim().length > 0,
  });
}
