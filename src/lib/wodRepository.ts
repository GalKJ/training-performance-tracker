import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Wod } from "../types/wod";
import {
  feedWindows,
  fetchMonthArchive,
  isRestDay,
  monthKeyForSlug,
  slugForDate,
} from "./crossfitWod";

const CACHE_KEY = "training-performance-tracker:wod:v1";

type WodCache = Record<string, Wod>;

const readCache = async (): Promise<WodCache> => {
  const raw = await AsyncStorage.getItem(CACHE_KEY);
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as WodCache;
  } catch {
    return {};
  }
};

const writeCache = async (cache: WodCache): Promise<void> => {
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

const currentMonthKey = (): string => {
  return monthKeyForSlug(slugForDate(new Date()));
};

const fetchMonthsInto = async (
  cache: WodCache,
  monthKeys: string[],
): Promise<boolean> => {
  const months = await Promise.all(
    monthKeys.map((monthKey) =>
      fetchMonthArchive(monthKey).catch((error) => {
        console.warn(`[wodRepository] archive failed for ${monthKey}:`, error);
        return [] as Wod[];
      }),
    ),
  );

  let dirty = false;
  months.flat().forEach((wod) => {
    cache[wod.slug] = wod;
    dirty = true;
  });
  return dirty;
};

/** Ensure the cache covers every slug, fetching whole months as needed. */
const hydrateCache = async (slugs: string[]): Promise<WodCache> => {
  const cache = await readCache();
  const thisMonth = currentMonthKey();

  // One request covers a whole month. Refetch the current month every time so
  // today's workout stays fresh; past months only when a slug is missing.
  const monthsToFetch = new Set(
    slugs
      .filter((slug) => !cache[slug] || monthKeyForSlug(slug) === thisMonth)
      .map(monthKeyForSlug),
  );

  if (monthsToFetch.size > 0) {
    if (await fetchMonthsInto(cache, [...monthsToFetch])) {
      await writeCache(cache);
    }
  }

  return cache;
};

const workoutsFrom = (cache: WodCache, slugs: string[]): Wod[] => {
  return slugs
    .map((slug) => cache[slug])
    .filter((wod): wod is Wod => wod !== undefined)
    .filter((wod) => !isRestDay(wod.title, wod.bodyText));
};

/**
 * How far back each window may reach to find its workouts. Rest days are about
 * a third of the calendar, so 14 days is ample headroom for 5 workouts while
 * still touching at most two month archives per window.
 */
const FEED_LOOKBACK_DAYS = 14;

/**
 * `perWindow` workouts counting back from today, then `perWindow` more counting
 * back from the same date a year ago. Rest days are skipped rather than counted,
 * so a full feed is `perWindow * 2` workouts.
 */
export const getWodFeed = async (
  perWindow: number,
  today: Date = new Date(),
): Promise<Wod[]> => {
  const windows = feedWindows(FEED_LOOKBACK_DAYS, today);
  const cache = await hydrateCache(windows.flat());

  return windows.flatMap((slugs) =>
    workoutsFrom(cache, slugs).slice(0, perWindow),
  );
};

export const getCachedWodBySlug = async (slug: string): Promise<Wod | null> => {
  const cache = await readCache();
  const cached = cache[slug];
  if (cached) {
    return isRestDay(cached.title, cached.bodyText) ? null : cached;
  }

  if (await fetchMonthsInto(cache, [monthKeyForSlug(slug)])) {
    await writeCache(cache);
  }

  const fetched = cache[slug];
  if (!fetched) {
    return null;
  }
  return isRestDay(fetched.title, fetched.bodyText) ? null : fetched;
};
