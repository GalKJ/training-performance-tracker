import { useCallback, useEffect, useMemo, useState } from "react";

import type { Wod } from "../types/wod";
import { getWodFeed } from "../lib/wodRepository";

/** Days per window — one window up to today, one the same run a year back. */
const DEFAULT_PER_WINDOW = 5;

type UseWodsResult = {
  wods: Wod[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export const useWods = (
  perWindow: number = DEFAULT_PER_WINDOW,
): UseWodsResult => {
  const [wods, setWods] = useState<Wod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await getWodFeed(perWindow);
      setWods(result);
      if (result.length === 0) {
        setError("Couldn't reach crossfit.com — pull to retry.");
      }
    } catch (unknownError) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Could not load workouts.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [perWindow]);

  useEffect(() => {
    refresh().catch(() => {
      // refresh manages its own error state
    });
  }, [refresh]);

  return useMemo(
    () => ({ wods, isLoading, error, refresh }),
    [wods, isLoading, error, refresh],
  );
};
