import { useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  Vibration,
  View,
} from "react-native";

import { parseDurationToSeconds } from "../../lib/duration";
import { monoColors } from "../../theme/mono";
import { formatClock } from "./clock";

const MINUTE_MS = 60_000;

const PRESET_MINUTES = [1, 2, 3, 4, 5, 8, 10, 12, 15, 20];

const DEFAULT_DURATION_MS = 3 * MINUTE_MS;

/**
 * Parses the custom duration field. A bare number is read as minutes (the
 * natural unit for a gym timer); anything with a colon falls through to the
 * shared mm:ss / h:mm:ss parser.
 */
const parseTimerInput = (raw: string): number | null => {
  const value = raw.trim();
  if (!value) {
    return null;
  }

  if (!value.includes(":")) {
    const minutes = Number(value);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      return null;
    }
    return Math.round(minutes * MINUTE_MS);
  }

  const seconds = parseDurationToSeconds(value);
  return seconds === null ? null : Math.round(seconds * 1000);
};

const formatPreset = (minutes: number) => `${minutes} MIN`;

// Vibration is unavailable on web, so both calls are no-ops there.
const buzz = () => {
  if (Platform.OS !== "web") {
    Vibration.vibrate([0, 400, 200, 400, 200, 600]);
  }
};

const stopBuzz = () => {
  if (Platform.OS !== "web") {
    Vibration.cancel();
  }
};

export const TimerPanel = () => {
  const [durationMs, setDurationMs] = useState(DEFAULT_DURATION_MS);
  const [remainingMs, setRemainingMs] = useState(DEFAULT_DURATION_MS);
  const [isRunning, setIsRunning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [customValue, setCustomValue] = useState("");

  // Wall-clock anchor so the countdown stays accurate even if the interval drifts.
  const endsAtRef = useRef(0);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const tick = () => {
      const left = endsAtRef.current - Date.now();

      if (left <= 0) {
        setRemainingMs(0);
        setIsRunning(false);
        setHasFinished(true);
        buzz();
        return;
      }

      setRemainingMs(left);
    };

    tick();
    const interval = setInterval(tick, 50);

    return () => clearInterval(interval);
  }, [isRunning]);

  const applyDuration = (nextDurationMs: number) => {
    setDurationMs(nextDurationMs);
    setRemainingMs(nextDurationMs);
    setIsRunning(false);
    setHasFinished(false);
    stopBuzz();
  };

  const handleStartStop = () => {
    if (isRunning) {
      setRemainingMs(endsAtRef.current - Date.now());
      setIsRunning(false);
      return;
    }

    // Starting after the timer has run out replays the whole duration.
    const startFrom = remainingMs > 0 ? remainingMs : durationMs;
    setRemainingMs(startFrom);
    setHasFinished(false);
    stopBuzz();
    endsAtRef.current = Date.now() + startFrom;
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setHasFinished(false);
    setRemainingMs(durationMs);
    stopBuzz();
  };

  const handleApplyCustom = () => {
    const parsed = parseTimerInput(customValue);
    if (parsed === null) {
      return;
    }

    applyDuration(parsed);
    setCustomValue("");
    Keyboard.dismiss();
  };

  const display = useMemo(() => formatClock(remainingMs), [remainingMs]);

  const customIsValid = parseTimerInput(customValue) !== null;
  const canReset = !isRunning && remainingMs !== durationMs;
  const isIdle = !isRunning && !hasFinished && remainingMs === durationMs;

  const progress = durationMs > 0 ? 1 - remainingMs / durationMs : 0;
  const progressPercent: `${number}%` = `${Math.min(
    100,
    Math.max(0, progress * 100),
  )}%`;

  const status = isRunning
    ? "COUNTING DOWN"
    : hasFinished
      ? "TIME"
      : isIdle
        ? "READY"
        : "PAUSED";

  return (
    <View className="flex-1">
      {/* Countdown readout */}
      <View
        className={`rounded-sm px-4 py-6 ${
          hasFinished ? "bg-mono-surfaceContainer" : "bg-mono-surface"
        }`}
      >
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 11,
            letterSpacing: 0.8,
          }}
          className="text-mono-secondary"
        >
          TIMER
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
          {status}
        </Text>

        {/* Progress — a background shift rather than a bordered bar. */}
        <View className="mt-4 h-1 w-full bg-mono-surfaceDim">
          <View
            className="h-1 bg-mono-primary"
            style={{ width: progressPercent }}
          />
        </View>
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
            {isRunning
              ? "PAUSE"
              : hasFinished
                ? "RESTART"
                : isIdle
                  ? "START"
                  : "RESUME"}
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

      <ScrollView
        className="mt-6"
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 11,
            letterSpacing: 0.8,
          }}
          className="text-mono-secondary"
        >
          LENGTH
        </Text>

        <View className="mt-3 flex-row flex-wrap gap-2">
          {PRESET_MINUTES.map((minutes) => {
            const presetMs = minutes * MINUTE_MS;
            const isSelected = durationMs === presetMs;

            return (
              <Pressable
                key={minutes}
                onPress={() => applyDuration(presetMs)}
                className={`rounded-sm px-4 py-3 ${
                  isSelected ? "bg-mono-primary" : "bg-mono-surfaceContainer"
                }`}
              >
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 12,
                    letterSpacing: 0.8,
                  }}
                  className={
                    isSelected ? "text-mono-background" : "text-mono-primary"
                  }
                >
                  {formatPreset(minutes)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 11,
            letterSpacing: 0.8,
          }}
          className="mt-6 text-mono-secondary"
        >
          CUSTOM
        </Text>

        <View className="mt-3 flex-row gap-3">
          <TextInput
            value={customValue}
            onChangeText={setCustomValue}
            onSubmitEditing={handleApplyCustom}
            placeholder="7 or 7:30"
            placeholderTextColor={monoColors.secondary}
            keyboardType="numbers-and-punctuation"
            returnKeyType="done"
            style={{ fontFamily: "Inter_500Medium", fontSize: 14 }}
            className="flex-1 rounded-sm bg-mono-surfaceContainer px-4 py-3 text-mono-primary"
          />

          <Pressable
            onPress={handleApplyCustom}
            disabled={!customIsValid}
            className={`items-center justify-center rounded-sm px-6 ${
              customIsValid ? "bg-mono-primary" : "bg-mono-surface"
            }`}
          >
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 12,
                letterSpacing: 1.2,
              }}
              className={
                customIsValid ? "text-mono-background" : "text-mono-secondary"
              }
            >
              SET
            </Text>
          </Pressable>
        </View>

        <Text
          style={{ fontFamily: "Inter_500Medium", fontSize: 12 }}
          className="mt-2 text-mono-secondary"
        >
          A plain number is read as minutes. Use mm:ss for anything finer.
        </Text>
      </ScrollView>
    </View>
  );
};
