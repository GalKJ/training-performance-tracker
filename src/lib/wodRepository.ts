import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Wod } from "../types/wod";
import { fetchWodBySlug, recentSlugs, slugForDate } from "./crossfitWod";

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

const todayIsoDate = (): string => {
  const now = new Date();
  return slugForDate(now);
};

export const getRecentWods = async (
  n: number,
  today: Date = new Date(),
): Promise<Wod[]> => {
  const slugs = recentSlugs(n, today);
  const cache = await readCache();
  const todaySlug = todayIsoDate();

  const slugsToFetch = slugs.filter((slug) => {
    if (!cache[slug]) {
      return true;
    }
    return slug === todaySlug;
  });

  if (slugsToFetch.length > 0) {
    const fetched = await Promise.all(
      slugsToFetch.map((slug) =>
        fetchWodBySlug(slug).catch((error) => {
          console.warn(`[wodRepository] fetch failed for ${slug}:`, error);
          return null;
        }),
      ),
    );

    let dirty = false;
    fetched.forEach((wod) => {
      if (wod) {
        cache[wod.slug] = wod;
        dirty = true;
      }
    });

    if (dirty) {
      await writeCache(cache);
    }
  }

  return slugs
    .map((slug) => cache[slug])
    .filter((wod): wod is Wod => wod !== undefined);
};

export const getCachedWodBySlug = async (slug: string): Promise<Wod | null> => {
  const cache = await readCache();
  if (cache[slug]) {
    return cache[slug];
  }

  const fetched = await fetchWodBySlug(slug).catch((error) => {
    console.warn(`[wodRepository] fetch failed for ${slug}:`, error);
    return null;
  });

  if (fetched) {
    cache[slug] = fetched;
    await writeCache(cache);
  }
  return fetched;
};
