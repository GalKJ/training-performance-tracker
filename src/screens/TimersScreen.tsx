import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type Split = {
  index: number;
  /** Elapsed time on the stopwatch when the split was taken. */
  totalMs: number;
  /** Time since the previous split. */
  lapMs: number;
};

const pad = (value: number, length = 2) => String(value).padStart(length, "0");

const formatDuration = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);

  return {
    clock: `${pad(minutes)}:${pad(seconds)}`,
    centiseconds: pad(centiseconds),
  };
};

const formatFull = (ms: number) => {
  const { clock, centiseconds } = formatDuration(ms);
  return `${clock}.${centiseconds}`;
};

export const TimersScreen = () => {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [splits, setSplits] = useState<Split[]>([]);

  // Wall-clock anchors so the timer stays accurate even if the interval drifts.
  const startedAtRef = useRef(0);
  const accumulatedRef = useRef(0);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const tick = () => {
      setElapsedMs(accumulatedRef.current + (Date.now() - startedAtRef.current));
    };

    tick();
    const interval = setInterval(tick, 50);

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStartStop = () => {
    if (isRunning) {
      accumulatedRef.current += Date.now() - startedAtRef.current;
      setElapsedMs(accumulatedRef.current);
      setIsRunning(false);
      return;
    }

    startedAtRef.current = Date.now();
    setIsRunning(true);
  };

  const handleSplit = () => {
    const totalMs = isRunning
      ? accumulatedRef.current + (Date.now() - startedAtRef.current)
      : elapsedMs;
    const previousTotal = splits.length > 0 ? splits[0].totalMs : 0;

    setSplits((current) => [
      {
        index: current.length + 1,
        totalMs,
        lapMs: totalMs - previousTotal,
      },
      ...current,
    ]);
  };

  const handleReset = () => {
    accumulatedRef.current = 0;
    startedAtRef.current = 0;
    setIsRunning(false);
    setElapsedMs(0);
    setSplits([]);
  };

  const display = useMemo(() => formatDuration(elapsedMs), [elapsedMs]);

  const canSplit = isRunning || elapsedMs > 0;
  const canReset = !isRunning && (elapsedMs > 0 || splits.length > 0);

  const fastestSplit = useMemo(() => {
    if (splits.length < 2) {
      return null;
    }
    return splits.reduce((best, split) =>
      split.lapMs < best.lapMs ? split : best,
    );
  }, [splits]);

  const slowestSplit = useMemo(() => {
    if (splits.length < 2) {
      return null;
    }
    return splits.reduce((worst, split) =>
      split.lapMs > worst.lapMs ? split : worst,
    );
  }, [splits]);

  return (
    <View className="flex-1 bg-mono-background px-5 pt-2">
      {/* Stopwatch readout */}
      <View className="rounded-sm bg-mono-surface px-4 py-6">
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 11,
            letterSpacing: 0.8,
          }}
          className="text-mono-secondary"
        >
          STOPWATCH
        </Text>

        <View className="mt-1 flex-row items-baseline">
          <Text
            style={{
              fontFamily: "Inter_900Black",
              fontSize: 64,
              letterSpacing: -2.5,
              fontVariant: ["tabular-nums"],
            }}
            className="text-mono-primary"
          >
            {display.clock}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_800ExtraBold",
              fontSize: 28,
              letterSpacing: -0.8,
              fontVariant: ["tabular-nums"],
            }}
            className="ml-1 text-mono-secondary"
          >
            .{display.centiseconds}
          </Text>
        </View>

        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 10,
            letterSpacing: 1.2,
          }}
          className="text-mono-secondary"
        >
          {isRunning ? "RUNNING" : elapsedMs > 0 ? "PAUSED" : "READY"}
        </Text>
      </View>

      {/* Controls */}
      <View className="mt-3 flex-row gap-3">
        <Pressable
          onPress={handleStartStop}
          className={`flex-1 items-center rounded-sm py-4 ${
            isRunning ? "bg-mono-primaryContainer" : "bg-mono-primary"
          }`}
        >
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 12,
              letterSpacing: 1.2,
            }}
            className="text-mono-background"
          >
            {isRunning ? "STOP" : elapsedMs > 0 ? "RESUME" : "START"}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSplit}
          disabled={!canSplit}
          className={`flex-1 items-center rounded-sm py-4 ${
            canSplit ? "bg-mono-surfaceContainer" : "bg-mono-surface"
          }`}
        >
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 12,
              letterSpacing: 1.2,
            }}
            className={canSplit ? "text-mono-primary" : "text-mono-secondary"}
          >
            SPLIT
          </Text>
        </Pressable>

        <Pressable
          onPress={handleReset}
          disabled={!canReset}
          className={`flex-1 items-center rounded-sm py-4 ${
            canReset ? "bg-mono-surfaceContainer" : "bg-mono-surface"
          }`}
        >
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 12,
              letterSpacing: 1.2,
            }}
            className={canReset ? "text-mono-primary" : "text-mono-secondary"}
          >
            RESET
          </Text>
        </Pressable>
      </View>

      {/* Splits */}
      <Text
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: 11,
          letterSpacing: 0.8,
        }}
        className="mt-6 text-mono-secondary"
      >
        SPLITS ({splits.length})
      </Text>

      {splits.length === 0 ? (
        <View className="mt-3 rounded-sm bg-mono-surface px-4 py-6">
          <Text
            style={{ fontFamily: "Inter_500Medium", fontSize: 13 }}
            className="text-mono-secondary"
          >
            Start the stopwatch and tap SPLIT to record a lap. Each split stores
            the lap time and the total elapsed time.
          </Text>
        </View>
      ) : (
        <ScrollView
          className="mt-3"
          contentContainerStyle={{ paddingBottom: 24, gap: 2 }}
          showsVerticalScrollIndicator={false}
        >
          {splits.map((split) => {
            const isFastest = fastestSplit?.index === split.index;
            const isSlowest = slowestSplit?.index === split.index;

            return (
              <View
                key={split.index}
                className={`flex-row items-center rounded-sm px-4 py-3 ${
                  isFastest ? "bg-mono-surfaceContainer" : "bg-mono-surface"
                }`}
              >
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 11,
                    letterSpacing: 0.6,
                  }}
                  className="w-10 text-mono-secondary"
                >
                  {pad(split.index)}
                </Text>

                <View className="flex-1">
                  <Text
                    style={{
                      fontFamily: "Inter_900Black",
                      fontSize: 22,
                      letterSpacing: -0.5,
                      fontVariant: ["tabular-nums"],
                    }}
                    className="text-mono-primary"
                  >
                    {formatFull(split.lapMs)}
                  </Text>
                  {(isFastest || isSlowest) && (
                    <Text
                      style={{
                        fontFamily: "Inter_700Bold",
                        fontSize: 9,
                        letterSpacing: 1,
                      }}
                      className="text-mono-secondary"
                    >
                      {isFastest ? "FASTEST" : "SLOWEST"}
                    </Text>
                  )}
                </View>

                <View className="items-end">
                  <Text
                    style={{
                      fontFamily: "Inter_700Bold",
                      fontSize: 9,
                      letterSpacing: 1,
                    }}
                    className="text-mono-secondary"
                  >
                    TOTAL
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_700Bold",
                      fontSize: 15,
                      fontVariant: ["tabular-nums"],
                    }}
                    className="text-mono-primary"
                  >
                    {formatFull(split.totalMs)}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};
