import type { Wod } from "../types/wod";

const BASE_URL = "https://www.crossfit.com";

const pad2 = (n: number): string => String(n).padStart(2, "0");

export const slugForDate = (date: Date): string => {
  return (
    pad2(date.getFullYear() % 100) +
    pad2(date.getMonth() + 1) +
    pad2(date.getDate())
  );
};

export const isoDateForSlug = (slug: string): string => {
  const yy = Number(slug.slice(0, 2));
  const mm = Number(slug.slice(2, 4));
  const dd = Number(slug.slice(4, 6));
  const year = yy >= 70 ? 1900 + yy : 2000 + yy;
  return `${year}-${pad2(mm)}-${pad2(dd)}`;
};

export const recentSlugs = (n: number, today: Date = new Date()): string[] => {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return slugForDate(d);
  });
};

const META_TAG_RE = /<meta\b[^>]*>/gi;
const ATTR_RE = /(\w[\w-]*)\s*=\s*"([^"]*)"/g;

const parseMetaAttrs = (tag: string): Record<string, string> => {
  const attrs: Record<string, string> = {};
  let match: RegExpExecArray | null;
  ATTR_RE.lastIndex = 0;
  while ((match = ATTR_RE.exec(tag)) !== null) {
    attrs[match[1].toLowerCase()] = match[2];
  }
  return attrs;
};

const extractMeta = (html: string, key: string): string => {
  const target = key.toLowerCase();
  META_TAG_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = META_TAG_RE.exec(html)) !== null) {
    const attrs = parseMetaAttrs(match[0]);
    if (
      (attrs.property && attrs.property.toLowerCase() === target) ||
      (attrs.name && attrs.name.toLowerCase() === target)
    ) {
      return attrs.content ?? "";
    }
  }
  return "";
};

const decodeEntities = (input: string): string => {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code)),
    );
};

const htmlToText = (html: string): string => {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/(h[1-6]|li|div)>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const looksLikeWod = (title: string, articleHtml: string): boolean => {
  if (!articleHtml.trim()) {
    return false;
  }
  return /workout of the day/i.test(title);
};

export const parseWodHtml = (slug: string, html: string): Wod | null => {
  const articleMatch = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
  const articleHtml = articleMatch?.[1] ?? "";
  const title = extractMeta(html, "og:title");

  if (!looksLikeWod(title, articleHtml)) {
    return null;
  }

  const description = extractMeta(html, "og:description");
  const imageUrl = extractMeta(html, "og:image");
  const canonicalMatch = html.match(
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i,
  );
  const url = canonicalMatch?.[1] ?? `${BASE_URL}/${slug}`;

  const bodyText = htmlToText(articleHtml);
  if (!bodyText) {
    return null;
  }

  return {
    slug,
    date: isoDateForSlug(slug),
    url,
    title: decodeEntities(title),
    description: decodeEntities(description),
    imageUrl,
    bodyHtml: articleHtml,
    bodyText,
    fetchedAt: new Date().toISOString(),
  };
};

export const fetchWodBySlug = async (slug: string): Promise<Wod | null> => {
  const response = await fetch(`${BASE_URL}/${slug}`, {
    headers: { Accept: "text/html" },
  });

  if (!response.ok) {
    return null;
  }

  const html = await response.text();
  return parseWodHtml(slug, html);
};

export const fetchWodByDate = async (date: Date): Promise<Wod | null> => {
  return fetchWodBySlug(slugForDate(date));
};

export const fetchRecentWods = async (
  n: number,
  today: Date = new Date(),
): Promise<Wod[]> => {
  const slugs = recentSlugs(n, today);
  const results = await Promise.all(
    slugs.map((slug) =>
      fetchWodBySlug(slug).catch((error) => {
        console.warn(`[crossfitWod] fetch failed for ${slug}:`, error);
        return null;
      }),
    ),
  );
  return results.filter((wod): wod is Wod => wod !== null);
};
