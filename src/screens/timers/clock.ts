// Millisecond formatting for the live readouts on the Timers screen.
// (src/lib/duration.ts covers the second-based durations stored on entries.)

export const pad = (value: number, length = 2) =>
  String(value).padStart(length, "0");

export const formatClock = (ms: number) => {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((safeMs % 1000) / 10);

  return {
    clock: `${pad(minutes)}:${pad(seconds)}`,
    centiseconds: pad(centiseconds),
  };
};

export const formatFull = (ms: number) => {
  const { clock, centiseconds } = formatClock(ms);
  return `${clock}.${centiseconds}`;
};
