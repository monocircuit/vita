const USER_AGENT = 'Vita/0.1 (https://github.com/monocircuit/vita)';

const BASE = 'https://en.wikipedia.org/api/rest_v1';

export interface WikipediaSearchHit {
  title: string;
  description?: string;
}

export interface WikipediaSummary {
  title: string;
  extract: string;
  pageUrl: string;
  thumbnail?: { source: string; width: number; height: number };
}

interface RawSearchResp {
  pages?: Array<{ title: string; description?: string }>;
}

interface RawSummaryResp {
  title?: string;
  extract?: string;
  content_urls?: { desktop?: { page?: string } };
  thumbnail?: { source: string; width: number; height: number };
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Api-User-Agent': USER_AGENT, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Wikipedia ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export async function wikipediaSearch(
  query: string,
  limit = 8,
): Promise<WikipediaSearchHit[]> {
  if (!query.trim()) return [];
  const url = `${BASE}/page/search/${encodeURIComponent(query)}?limit=${limit}`;
  const data = await get<RawSearchResp>(url);
  return (data.pages ?? []).map((p) => ({
    title: p.title,
    description: p.description,
  }));
}

export async function wikipediaSummary(title: string): Promise<WikipediaSummary | null> {
  const url = `${BASE}/page/summary/${encodeURIComponent(title)}`;
  try {
    const data = await get<RawSummaryResp>(url);
    return {
      title: data.title ?? title,
      extract: data.extract ?? '',
      pageUrl:
        data.content_urls?.desktop?.page ??
        `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      thumbnail: data.thumbnail,
    };
  } catch {
    return null;
  }
}
