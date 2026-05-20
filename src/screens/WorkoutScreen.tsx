import { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { WorkoutStackParamList } from "../navigation/AppNavigator";
import type { Wod } from "../types/wod";
import { useWods } from "../hooks/useWods";
import { monoColors } from "../theme/mono";
import { WodView } from "../components/WodView";

const formatRowDate = (isoDate: string): string => {
  const date = new Date(`${isoDate}T00:00:00`);
  return date
    .toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
    .toUpperCase();
};

const teaserFor = (wod: Wod): string => {
  const firstLine = wod.bodyText
    .split(/\n+/)
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  return wod.description || firstLine || wod.slug;
};

export const WorkoutScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<WorkoutStackParamList>>();
  const { wods, isLoading, error, refresh } = useWods();

  useFocusEffect(
    useCallback(() => {
      refresh().catch(() => {
        // refresh manages its own error state
      });
    }, [refresh]),
  );

  const todayWod = wods[0];
  const recent = wods.slice(1);

  if (isLoading && wods.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-mono-background">
        <ActivityIndicator color={monoColors.primary} />
      </View>
    );
  }

  if (!todayWod) {
    return (
      <View className="flex-1 bg-mono-background px-5 pt-4">
        <Text
          style={{
            fontFamily: "Inter_900Black",
            fontSize: 32,
            letterSpacing: -0.8,
          }}
          className="text-mono-primary"
        >
          WORKOUT{"\n"}OF THE DAY
        </Text>
        <View className="mt-4 rounded-sm bg-mono-surface px-4 py-5">
          <Text
            style={{ fontFamily: "Inter_500Medium", fontSize: 14 }}
            className="text-mono-secondary"
          >
            {error ?? "No workouts available. Pull to retry."}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            refresh().catch(() => {
              // handled in hook
            });
          }}
          className="mt-4 self-start rounded-sm bg-mono-primary px-4 py-3"
        >
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 12,
              letterSpacing: 0.8,
            }}
            className="text-white"
          >
            RETRY
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-mono-background"
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refresh}
          tintColor={monoColors.primary}
        />
      }
    >
      <WodView wod={todayWod} />

      {recent.length > 0 ? (
        <View className="mt-6">
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 11,
              letterSpacing: 1.2,
            }}
            className="text-mono-secondary"
          >
            RECENT WODS
          </Text>
          <View className="mt-3 gap-2">
            {recent.map((wod) => (
              <Pressable
                key={wod.slug}
                onPress={() =>
                  navigation.navigate("WodDetail", { slug: wod.slug })
                }
                className="rounded-sm bg-mono-surface px-4 py-4"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text
                      style={{
                        fontFamily: "Inter_700Bold",
                        fontSize: 11,
                        letterSpacing: 0.8,
                      }}
                      className="text-mono-secondary"
                    >
                      {formatRowDate(wod.date)}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 14,
                        lineHeight: 20,
                      }}
                      className="mt-0.5 text-mono-primary"
                      numberOfLines={2}
                    >
                      {teaserFor(wod)}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: "Inter_700Bold",
                      fontSize: 18,
                    }}
                    className="text-mono-secondary"
                  >
                    ›
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {error && wods.length > 0 ? (
        <Text
          style={{ fontFamily: "Inter_500Medium", fontSize: 12 }}
          className="mt-4 text-mono-secondary"
        >
          {error}
        </Text>
      ) : null}
    </ScrollView>
  );
};
