import { NextResponse, type NextRequest } from "next/server";

interface LogoDevSearchResult {
  name?: unknown;
  domain?: unknown;
}

function toSearchResult(
  item: LogoDevSearchResult,
): { name: string; domain: string } | null {
  const name = typeof item.name === "string" ? item.name.trim() : "";
  const domain = typeof item.domain === "string" ? item.domain.trim() : "";

  if (!domain) return null;

  return {
    name: name || domain,
    domain,
  };
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json([]);
  }

  const secretKey = process.env.LOGO_DEV_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Missing LOGO_DEV_SECRET_KEY" },
      { status: 500 },
    );
  }

  const strategy =
    request.nextUrl.searchParams.get("strategy") === "match"
      ? "match"
      : "typeahead";

  const upstreamUrl = new URL("https://api.logo.dev/search");
  upstreamUrl.searchParams.set("q", query);
  if (strategy === "match") {
    upstreamUrl.searchParams.set("strategy", "match");
  }

  const upstream = await fetch(upstreamUrl.toString(), {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
    cache: "no-store",
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "logo.dev search failed" },
      { status: upstream.status },
    );
  }

  const payload: unknown = await upstream.json();
  const results = Array.isArray(payload)
    ? payload
        .map(item => toSearchResult(item as LogoDevSearchResult))
        .filter(
          (item): item is { name: string; domain: string } => item !== null,
        )
    : [];

  return NextResponse.json(results);
}
