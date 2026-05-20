import { useCallback, useEffect, useMemo, useState } from "react";

import type { Wod } from "../types/wod";
import { getRecentWods } from "../lib/wodRepository";

const DEFAULT_COUNT = 5;

type UseWodsResult = {
  wods: Wod[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export const useWods = (count: number = DEFAULT_COUNT): UseWodsResult => {
  const [wods, setWods] = useState<Wod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await getRecentWods(count);
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
  }, [count]);

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
