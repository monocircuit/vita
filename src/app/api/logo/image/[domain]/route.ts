import { NextResponse, type NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ domain: string }> },
) {
  const { domain: encodedDomain } = await context.params;
  const domain = decodeURIComponent(encodedDomain ?? "").trim();

  if (!domain) {
    return NextResponse.json({ error: "Missing domain" }, { status: 400 });
  }

  const token =
    process.env.LOGO_DEV_PUBLISHABLE_KEY ?? process.env.LOGO_DEV_SECRET_KEY;
  if (!token) {
    return NextResponse.json(
      { error: "Missing LOGO_DEV_PUBLISHABLE_KEY or LOGO_DEV_SECRET_KEY" },
      { status: 500 },
    );
  }

  const upstreamUrl = new URL(
    `https://img.logo.dev/${encodeURIComponent(domain)}`,
  );
  upstreamUrl.searchParams.set("token", token);

  const size = request.nextUrl.searchParams.get("size");
  const format = request.nextUrl.searchParams.get("format");
  const retina = request.nextUrl.searchParams.get("retina");

  if (size) upstreamUrl.searchParams.set("size", size);
  if (format) upstreamUrl.searchParams.set("format", format);
  if (retina) upstreamUrl.searchParams.set("retina", retina);

  const upstream = await fetch(upstreamUrl.toString(), {
    cache: "force-cache",
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "logo.dev image fetch failed" },
      { status: upstream.status },
    );
  }

  const contentType = upstream.headers.get("content-type") ?? "image/webp";
  const body = await upstream.arrayBuffer();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
