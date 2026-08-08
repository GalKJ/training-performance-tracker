import { useMemo } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";

import { formatDuration, parseDurationToSeconds } from "../lib/duration";
import { monoColors } from "../theme/mono";

// Colon-friendly keypad on iOS; Android's default keyboard already has one.
export const TIME_KEYBOARD =
  Platform.OS === "ios" ? "numbers-and-punctuation" : "default";

type SplitTimesInputProps = {
  /** Raw, user-typed split values. Parsing happens on save. */
  splits: string[];
  onChange: (splits: string[]) => void;
};

export const SplitTimesInput = ({ splits, onChange }: SplitTimesInputProps) => {
  // Running total shown under the splits, so the user can sanity-check them.
  const splitsTotal = useMemo(() => {
    const filled = splits.filter((split) => split.trim());
    if (filled.length === 0) {
      return null;
    }

    const parsed = filled.map(parseDurationToSeconds);
    if (parsed.some((seconds) => seconds === null)) {
      return null;
    }

    return (parsed as number[]).reduce((total, seconds) => total + seconds, 0);
  }, [splits]);

  return (
    <View className="rounded-sm bg-mono-surface px-3 py-3">
      <View className="flex-row items-center justify-between">
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 11,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
          className="text-mono-secondary"
        >
          Split Times
        </Text>
        <Pressable
          onPress={() => onChange([...splits, ""])}
          accessibilityRole="button"
          accessibilityLabel="Add a split time"
          hitSlop={8}
          className="rounded-sm bg-mono-surfaceContainer px-3 py-1"
        >
          <Text
            style={{ fontFamily: "Inter_700Bold", fontSize: 12 }}
            className="text-mono-primary"
          >
            + Add split
          </Text>
        </Pressable>
      </View>

      {splits.length === 0 ? (
        <Text
          style={{ fontFamily: "Inter_400Regular", fontSize: 13 }}
          className="mt-2 text-mono-secondary"
        >
          Add a split for each round, lap or interval.
        </Text>
      ) : (
        <View className="mt-3 gap-2">
          {splits.map((split, index) => (
            <View key={index} className="flex-row items-center gap-2">
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 11,
                  letterSpacing: 0.5,
                }}
                className="w-6 text-mono-secondary"
              >
                {index + 1}
              </Text>
              <TextInput
                value={split}
                onChangeText={(value) =>
                  onChange(
                    splits.map((current, currentIndex) =>
                      currentIndex === index ? value : current,
                    ),
                  )
                }
                placeholder="mm:ss"
                keyboardType={TIME_KEYBOARD}
                placeholderTextColor={monoColors.secondary}
                className="flex-1 rounded-sm bg-mono-surfaceContainer px-3 py-2 text-mono-primary"
                style={{ fontFamily: "Inter_500Medium" }}
              />
              <Pressable
                onPress={() =>
                  onChange(
                    splits.filter((_, currentIndex) => currentIndex !== index),
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={`Remove split ${index + 1}`}
                hitSlop={8}
                className="h-8 w-8 items-center justify-center rounded-sm bg-mono-surfaceContainer"
              >
                <Text
                  style={{ fontFamily: "Inter_700Bold", fontSize: 14 }}
                  className="text-mono-secondary"
                >
                  ×
                </Text>
              </Pressable>
            </View>
          ))}

          {splitsTotal ? (
            <Text
              style={{ fontFamily: "Inter_500Medium", fontSize: 12 }}
              className="mt-1 text-mono-secondary"
            >
              Splits total {formatDuration(splitsTotal)}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
};

/**
 * Parses the raw split inputs, skipping blanks.
 * Returns null if any non-blank value is not a valid duration.
 */
export const parseSplitInputs = (splits: string[]): number[] | null => {
  const parsed: number[] = [];

  for (const split of splits) {
    if (!split.trim()) {
      continue;
    }

    const seconds = parseDurationToSeconds(split);
    if (seconds === null) {
      return null;
    }

    parsed.push(seconds);
  }

  return parsed;
};
