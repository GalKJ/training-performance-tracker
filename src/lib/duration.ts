// Durations are stored as seconds. The UI accepts "45", "mm:ss" or "h:mm:ss".

const NUMERIC_PART = /^\d*\.?\d+$/;

/**
 * Parses a user-typed duration into seconds.
 * Returns null when the value is empty or not a valid positive duration.
 */
export const parseDurationToSeconds = (raw: string): number | null => {
  const value = raw.trim();
  if (!value) {
    return null;
  }

  const parts = value.split(":");
  if (parts.length > 3) {
    return null;
  }

  let seconds = 0;
  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index].trim();
    if (!NUMERIC_PART.test(part)) {
      return null;
    }

    const parsed = Number(part);
    // In mm:ss / h:mm:ss form every segment after the first is a 0-59 unit.
    if (parts.length > 1 && index > 0 && parsed >= 60) {
      return null;
    }

    seconds = seconds * 60 + parsed;
  }

  if (!Number.isFinite(seconds) || seconds <= 0) {
    return null;
  }

  return Math.round(seconds * 100) / 100;
};

/** Formats seconds as m:ss, or h:mm:ss once the duration passes an hour. */
export const formatDuration = (totalSeconds: number): string => {
  const rounded = Math.round(totalSeconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;
  const pad = (value: number) => String(value).padStart(2, "0");

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
};
