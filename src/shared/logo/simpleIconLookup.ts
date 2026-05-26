import { simpleIconManifest, type SimpleIconEntry } from './simpleIconManifest';

const lowerTitleIndex = new Map<string, SimpleIconEntry>();
for (const entry of simpleIconManifest) {
  lowerTitleIndex.set(entry.title.toLowerCase(), entry);
  lowerTitleIndex.set(entry.slug, entry);
}

export function findSimpleIconExact(query: string): SimpleIconEntry | null {
  return lowerTitleIndex.get(query.toLowerCase()) ?? null;
}

export function searchSimpleIcons(query: string, limit = 8): SimpleIconEntry[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const hits: SimpleIconEntry[] = [];
  for (const entry of simpleIconManifest) {
    if (entry.title.toLowerCase().startsWith(q) || entry.slug.startsWith(q)) {
      hits.push(entry);
      if (hits.length >= limit) break;
    }
  }
  return hits;
}

export async function loadSimpleIconSvg(slug: string): Promise<string | null> {
  try {
    const mod = await import(`simple-icons/icons/${slug}.js`);
    const icon = mod.default;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#${icon.hex}"><path d="${icon.path}"/></svg>`;
  } catch {
    return null;
  }
}
