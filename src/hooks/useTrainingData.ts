import { useCallback, useEffect, useMemo, useState } from "react";

import type { AddLiftEntryInput, Exercise, LiftEntry } from "../types/domain";
import { addLiftEntry, getTrainingData } from "../lib/trainingRepository";

type UseTrainingDataResult = {
  exercises: Exercise[];
  liftEntries: LiftEntry[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addEntry: (input: AddLiftEntryInput) => Promise<void>;
};

export const useTrainingData = (): UseTrainingDataResult => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [liftEntries, setLiftEntries] = useState<LiftEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const snapshot = await getTrainingData();
      setExercises(snapshot.exercises);
      setLiftEntries(snapshot.liftEntries);
    } catch (unknownError) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Could not load training data.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addEntry = useCallback(
    async (input: AddLiftEntryInput) => {
      await addLiftEntry(input);
      await refresh();
    },
    [refresh],
  );

  useEffect(() => {
    refresh().catch(() => {
      // Refresh handles state.
    });
  }, [refresh]);

  return useMemo(
    () => ({ exercises, liftEntries, isLoading, error, refresh, addEntry }),
    [addEntry, error, exercises, isLoading, liftEntries, refresh],
  );
};
