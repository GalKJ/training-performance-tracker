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

/**
 * The same calendar date a year earlier. A 29 Feb start normalises to 1 Mar,
 * which is the behaviour we want — there is no 29 Feb to look back at.
 */
export const oneYearBefore = (date: Date): Date => {
  const shifted = new Date(date);
  shifted.setFullYear(shifted.getFullYear() - 1);
  return shifted;
};

/**
 * The Workout tab's two feed windows, each newest-first: the run up to today,
 * then the run up to the same date a year earlier.
 *
 * `lookbackDays` is deliberately longer than the number of workouts wanted —
 * roughly a third of crossfit.com's days are rest days, so a strict 5-day
 * window would yield 3 or 4 workouts. Callers take what they need off the front.
 */
export const feedWindows = (
  lookbackDays: number,
  today: Date = new Date(),
): string[][] => {
  return [
    recentSlugs(lookbackDays, today),
    recentSlugs(lookbackDays, oneYearBefore(today)),
  ];
};

/**
 * Date label for WOD rows and hero cards. The feed mixes this year's workouts
 * with the same dates a year back, so the year is shown whenever it isn't the
 * current one — without it the two blocks read identically.
 */
export const formatWodDate = (
  isoDate: string,
  today: Date = new Date(),
): string => {
  const date = new Date(`${isoDate}T00:00:00`);
  const showYear = date.getFullYear() !== today.getFullYear();
  return date
    .toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      ...(showYear ? { year: "numeric" as const } : {}),
    })
    .toUpperCase();
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

const REST_DAY_RE = /rest\s+day/i;

/**
 * crossfit.com publishes rest days alongside workouts and titles them the same
 * way, so only the body gives it away — it opens with a "Rest Day" heading.
 * Match on both to be safe.
 */
export const isRestDay = (title: string, bodyText: string): boolean => {
  return REST_DAY_RE.test(title) || REST_DAY_RE.test(bodyText);
};

/**
 * Month archive key for a slug, as `YYYY-MM`. Slugs are `yymmdd`, so the month
 * is derivable without a fetch.
 */
export const monthKeyForSlug = (slug: string): string => {
  return isoDateForSlug(slug).slice(0, 7);
};

const ENTRY_SEPARATOR = '<div class="row content-container">';
const BODY_CELL_OPEN = /<div class="col-sm-6">/i;
const DIV_TOKEN_RE = /<div\b[^>]*>|<\/div>/gi;

/**
 * The body cell can in principle contain nested divs, so walk the tags and
 * track depth rather than stopping at the first `</div>`.
 */
const bodyCellHtml = (block: string): string => {
  const open = block.match(BODY_CELL_OPEN);
  if (!open || open.index === undefined) {
    return "";
  }

  const contentStart = open.index + open[0].length;
  DIV_TOKEN_RE.lastIndex = contentStart;

  let depth = 1;
  let token: RegExpExecArray | null;
  while ((token = DIV_TOKEN_RE.exec(block)) !== null) {
    depth += token[0].startsWith("</") ? -1 : 1;
    if (depth === 0) {
      return block.slice(contentStart, token.index);
    }
  }
  return block.slice(contentStart);
};

/**
 * Every workout carries a "Stimulus and Strategy" note; its opening sentence is
 * what the per-date pages used to expose as og:description. Rest days have no
 * such note, which is harmless — they get filtered out anyway.
 */
const descriptionFrom = (bodyText: string): string => {
  const marker = bodyText.match(/Stimulus and Strategy:?\s*/i);
  if (!marker || marker.index === undefined) {
    return "";
  }

  const after = bodyText.slice(marker.index + marker[0].length).trim();
  const paragraph = after.split(/\n\n/)[0]?.trim() ?? "";
  return paragraph.match(/^[\s\S]*?\.(?:\s|$)/)?.[0].trim() ?? paragraph;
};

/**
 * Parse a `/workout/YYYY/MM` archive page into one Wod per day.
 *
 * The archive is plain server-rendered markup, unlike the per-date pages, which
 * only sometimes arrive server-rendered and otherwise need a JS runtime to show
 * anything. One request covers a whole month.
 */
export const parseArchiveHtml = (html: string): Wod[] => {
  const fetchedAt = new Date().toISOString();

  return html
    .split(ENTRY_SEPARATOR)
    .slice(1)
    .flatMap((block) => {
      const heading = block.match(
        /<h3 class="show"><a href="\/(\d{6})">([^<]*)<\/a>/i,
      );
      if (!heading) {
        return [];
      }

      const slug = heading[1];
      const bodyHtml = bodyCellHtml(block);
      const bodyText = htmlToText(bodyHtml);
      if (!bodyText) {
        return [];
      }

      return [
        {
          slug,
          date: isoDateForSlug(slug),
          url: `${BASE_URL}/${slug}`,
          title: decodeEntities(heading[2]).trim(),
          description: descriptionFrom(bodyText),
          imageUrl: block.match(/<img[^>]+src="([^"]+)"/i)?.[1] ?? "",
          bodyHtml,
          bodyText,
          fetchedAt,
        },
      ];
    });
};

export const fetchMonthArchive = async (monthKey: string): Promise<Wod[]> => {
  const [year, month] = monthKey.split("-");
  const response = await fetch(`${BASE_URL}/workout/${year}/${month}`, {
    headers: { Accept: "text/html" },
  });

  if (!response.ok) {
    return [];
  }

  return parseArchiveHtml(await response.text());
};
