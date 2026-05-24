import { NextResponse, type NextRequest } from "next/server";

interface LogoDevDescribeColor {
  r?: unknown;
  g?: unknown;
  b?: unknown;
  hex?: unknown;
}

interface LogoDevDescribeResult {
  name?: unknown;
  domain?: unknown;
  description?: unknown;
  logo?: unknown;
  colors?: unknown;
}

function getFallbackLogoUrl(domain: string): string {
  return `/api/logo/image/${encodeURIComponent(domain)}?size=32&format=webp&retina=true`;
}

function resolveLogoUrl(rawLogo: unknown, domain: string): string {
  if (typeof rawLogo !== "string") return getFallbackLogoUrl(domain);

  const publishable =
    process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY ??
    process.env.LOGO_DEV_PUBLISHABLE_KEY;

  if (publishable && rawLogo.includes("LOGO_DEV_PUBLISHABLE_KEY")) {
    return rawLogo.replace(/LOGO_DEV_PUBLISHABLE_KEY/g, publishable);
  }

  if (rawLogo.includes("LOGO_DEV_PUBLISHABLE_KEY")) {
    return getFallbackLogoUrl(domain);
  }

  return rawLogo || getFallbackLogoUrl(domain);
}

function toDescribeColors(
  rawColors: unknown,
): Array<{ r?: number; g?: number; b?: number; hex: string }> | undefined {
  if (!Array.isArray(rawColors)) return undefined;

  const colors: Array<{ r?: number; g?: number; b?: number; hex: string }> = [];

  rawColors.forEach(item => {
    const color = item as LogoDevDescribeColor;
    const hex = typeof color.hex === "string" ? color.hex.trim() : "";
    if (!hex) return;

    colors.push({
      r: typeof color.r === "number" ? color.r : undefined,
      g: typeof color.g === "number" ? color.g : undefined,
      b: typeof color.b === "number" ? color.b : undefined,
      hex,
    });
  });

  return colors.length > 0 ? colors : undefined;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ domain: string }> },
) {
  const { domain: encodedDomain } = await context.params;
  const domain = decodeURIComponent(encodedDomain ?? "").trim();

  if (!domain) {
    return NextResponse.json({ error: "Missing domain" }, { status: 400 });
  }

  const secretKey = process.env.LOGO_DEV_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Missing LOGO_DEV_SECRET_KEY" },
      { status: 500 },
    );
  }

  const upstream = await fetch(
    `https://api.logo.dev/describe/${encodeURIComponent(domain)}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
      cache: "no-store",
    },
  );

  if (!upstream.ok) {
    return NextResponse.json(
      {
        name: domain,
        domain,
        logo: getFallbackLogoUrl(domain),
      },
      { status: 200 },
    );
  }

  const payload: unknown = await upstream.json();
  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      {
        name: domain,
        domain,
        logo: getFallbackLogoUrl(domain),
      },
      { status: 200 },
    );
  }

  const describe = payload as LogoDevDescribeResult;
  const name =
    typeof describe.name === "string" && describe.name.trim().length > 0
      ? describe.name
      : domain;
  const description =
    typeof describe.description === "string" ? describe.description : undefined;

  return NextResponse.json({
    name,
    domain,
    description,
    logo: resolveLogoUrl(describe.logo, domain),
    colors: toDescribeColors(describe.colors),
  });
}
