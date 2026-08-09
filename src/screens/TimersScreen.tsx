import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { StopwatchPanel } from "./timers/StopwatchPanel";
import { TimerPanel } from "./timers/TimerPanel";

type TimersTab = "stopwatch" | "timer";

const TABS: { key: TimersTab; label: string }[] = [
  { key: "stopwatch", label: "STOPWATCH" },
  { key: "timer", label: "TIMER" },
];

export const TimersScreen = () => {
  const [activeTab, setActiveTab] = useState<TimersTab>("stopwatch");

  return (
    <View className="flex-1 bg-mono-background px-5 pt-2">
      {/* Tabs */}
      <View className="flex-row gap-2 rounded-sm bg-mono-surface p-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-1 items-center rounded-sm py-3 ${
                isActive ? "bg-mono-primary" : "bg-transparent"
              }`}
            >
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 12,
                  letterSpacing: 1.2,
                }}
                className={
                  isActive ? "text-mono-background" : "text-mono-secondary"
                }
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Both panels stay mounted so a running stopwatch or timer keeps
          counting while the other tab is on screen. */}
      <View
        className="mt-3 flex-1"
        style={{ display: activeTab === "stopwatch" ? "flex" : "none" }}
      >
        <StopwatchPanel />
      </View>

      <View
        className="mt-3 flex-1"
        style={{ display: activeTab === "timer" ? "flex" : "none" }}
      >
        <TimerPanel />
      </View>
    </View>
  );
};
