import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { WorkoutStackParamList } from "../navigation/AppNavigator";
import type { Wod } from "../types/wod";
import { getCachedWodBySlug } from "../lib/wodRepository";
import { monoColors } from "../theme/mono";
import { WodView } from "../components/WodView";

type Props = NativeStackScreenProps<WorkoutStackParamList, "WodDetail">;

export const WodDetailScreen = ({ route }: Props) => {
  const { slug } = route.params;
  const [wod, setWod] = useState<Wod | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    getCachedWodBySlug(slug)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setError("Couldn't load this workout.");
        } else {
          setWod(result);
        }
      })
      .catch((unknownError) => {
        if (cancelled) return;
        const message =
          unknownError instanceof Error
            ? unknownError.message
            : "Couldn't load this workout.";
        setError(message);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-mono-background">
        <ActivityIndicator color={monoColors.primary} />
      </View>
    );
  }

  if (!wod) {
    return (
      <View className="flex-1 bg-mono-background px-5 pt-4">
        <View className="rounded-sm bg-mono-surface px-4 py-5">
          <Text
            style={{ fontFamily: "Inter_500Medium", fontSize: 14 }}
            className="text-mono-secondary"
          >
            {error ?? "Workout not available."}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-mono-background"
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 }}
    >
      <WodView wod={wod} />
    </ScrollView>
  );
};
