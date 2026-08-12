import { Pressable, Text, View } from "react-native";

import type { ExerciseCategory } from "../types/domain";

const TABS: { key: ExerciseCategory; label: string }[] = [
  { key: "lift", label: "Lift" },
  { key: "wod", label: "WOD" },
];

type CategoryTabsProps = {
  value: ExerciseCategory;
  onChange: (category: ExerciseCategory) => void;
};

/** Lift / WOD switch used by the History and Metrics screens. */
export const CategoryTabs = ({ value, onChange }: CategoryTabsProps) => {
  return (
    <View className="flex-row gap-2">
      {TABS.map((tab) => {
        const isActive = tab.key === value;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            className={`flex-1 items-center rounded-sm py-2.5 ${
              isActive ? "bg-mono-primary" : "bg-mono-surfaceContainer"
            }`}
          >
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 11,
                letterSpacing: 0.8,
              }}
              className={isActive ? "text-mono-background" : "text-mono-secondary"}
            >
              {tab.label.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
