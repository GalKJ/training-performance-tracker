import { useMemo } from "react";
import { Linking, Pressable, Text, View } from "react-native";

import type { SessionBlock, Wod } from "../types/wod";
import { buildSessionPlan } from "../lib/workoutBuilder";

type Props = {
  wod: Wod;
};

const formatHeroDate = (isoDate: string): string => {
  const date = new Date(`${isoDate}T00:00:00`);
  return date
    .toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
    .toUpperCase();
};

const formatTitleLine = (title: string): string => {
  const stripped = title.replace(/^CrossFit\s*\|\s*/i, "").trim();
  return stripped || "Workout of the Day";
};

const SessionBlockView = ({ block }: { block: SessionBlock }) => (
  <View className="mt-4">
    <View className="flex-row items-baseline justify-between">
      <Text
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: 11,
          letterSpacing: 0.8,
        }}
        className="text-mono-secondary"
      >
        {block.label} · {block.name.toUpperCase()}
      </Text>
      <Text
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: 11,
          letterSpacing: 0.8,
        }}
        className="text-mono-secondary"
      >
        ~{block.durationMin} MIN
      </Text>
    </View>
    <View className="mt-1.5">
      {block.movements.map((movement, idx) => (
        <Text
          key={`${block.label}-${idx}`}
          style={{
            fontFamily: "Inter_500Medium",
            fontSize: 14,
            lineHeight: 20,
          }}
          className="text-mono-primary"
        >
          {movement}
        </Text>
      ))}
    </View>
  </View>
);

export const WodView = ({ wod }: Props) => {
  const plan = useMemo(() => buildSessionPlan(wod), [wod]);

  const bodyLines = useMemo(
    () =>
      wod.bodyText
        .split(/\n+/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
    [wod.bodyText],
  );

  return (
    <View>
      <Text
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: 11,
          letterSpacing: 1.2,
        }}
        className="text-mono-secondary"
      >
        {formatHeroDate(wod.date)}
      </Text>
      <Text
        style={{
          fontFamily: "Inter_900Black",
          fontSize: 32,
          letterSpacing: -0.8,
        }}
        className="mt-1 text-mono-primary"
      >
        CROSSFIT {wod.slug}
      </Text>
      {wod.description ? (
        <Text
          style={{ fontFamily: "Inter_500Medium", fontSize: 13 }}
          className="mt-1 text-mono-secondary"
          numberOfLines={3}
        >
          {wod.description}
        </Text>
      ) : null}

      <View className="mt-4 rounded-sm bg-mono-surface px-4 py-5">
        <View className="flex-row items-baseline justify-between">
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 11,
              letterSpacing: 0.8,
            }}
            className="text-mono-secondary"
          >
            TODAY'S WOD
          </Text>
          <Pressable onPress={() => Linking.openURL(wod.url)}>
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 11,
                letterSpacing: 0.8,
              }}
              className="text-mono-secondary"
            >
              SOURCE ›
            </Text>
          </Pressable>
        </View>
        <View className="mt-2">
          {bodyLines.map((line, idx) => (
            <Text
              key={`wod-line-${idx}`}
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 15,
                lineHeight: 22,
              }}
              className="text-mono-primary"
            >
              {line}
            </Text>
          ))}
        </View>
      </View>

      <View className="mt-3 rounded-sm bg-mono-surface px-4 py-5">
        <View className="flex-row items-baseline justify-between">
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 11,
              letterSpacing: 0.8,
            }}
            className="text-mono-secondary"
          >
            60-MINUTE SESSION
          </Text>
          <Text
            style={{
              fontFamily: "Inter_900Black",
              fontSize: 22,
              letterSpacing: -0.4,
            }}
            className="text-mono-primary"
          >
            ~{plan.totalMin} MIN
          </Text>
        </View>
        <SessionBlockView block={plan.warmUp} />
        <SessionBlockView block={plan.wod} />
        <SessionBlockView block={plan.accessories} />
      </View>
    </View>
  );
};
