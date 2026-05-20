export type Modality =
  | "barbell"
  | "kettlebell"
  | "gymnastics"
  | "cardio"
  | "general";

export type Region = "posterior" | "anterior" | "core" | "full";

export type WarmUpTemplate = {
  id: string;
  name: string;
  durationMin: number;
  modalities: Modality[];
  movements: string[];
};

export type AccessoryTemplate = {
  id: string;
  name: string;
  durationMin: number;
  region: Region;
  movements: string[];
};

export const warmUps: WarmUpTemplate[] = [
  {
    id: "general-dynamic",
    name: "General Dynamic",
    durationMin: 10,
    modalities: ["general"],
    movements: [
      "500m row, easy",
      "10 inchworms",
      "10/side world's greatest stretch",
      "20 air squats",
      "10 scap pull-ups",
    ],
  },
  {
    id: "kettlebell-prep",
    name: "Kettlebell Prep",
    durationMin: 10,
    modalities: ["kettlebell"],
    movements: [
      "3 min easy bike or row",
      "10 goblet squats (light)",
      "10/side single-arm KB deadlift",
      "10 KB halos/side",
      "15 unloaded hip hinges",
    ],
  },
  {
    id: "barbell-prep",
    name: "Barbell Prep",
    durationMin: 10,
    modalities: ["barbell"],
    movements: [
      "3 min row, easy",
      "2 rounds: 5 PVC pass-throughs, 5 PVC overhead squats",
      "5 empty-bar Romanian deadlifts",
      "5 empty-bar front squats",
      "5 empty-bar strict presses",
    ],
  },
  {
    id: "gymnastics-prep",
    name: "Gymnastics Prep",
    durationMin: 10,
    modalities: ["gymnastics"],
    movements: [
      "3 min jump rope, easy",
      "10 scap pull-ups",
      "10 scap push-ups",
      "30s hollow hold + 30s arch hold",
      "5 kip swings",
      "3-5 strict pull-ups",
    ],
  },
  {
    id: "cardio-prep",
    name: "Engine Prep",
    durationMin: 10,
    modalities: ["cardio"],
    movements: [
      "3 min row or bike, easy",
      "3 rounds, building pace: 30s row + 30s rest",
      "10 leg swings/side",
      "10 lunges/side",
      "20 single-unders",
    ],
  },
];

export const accessories: AccessoryTemplate[] = [
  {
    id: "posterior-builder",
    name: "Posterior Builder",
    durationMin: 20,
    region: "posterior",
    movements: [
      "3 x 10 Romanian deadlifts (moderate)",
      "3 x 8/side single-leg glute bridge",
      "3 x 12 bent-over dumbbell row",
      "3 x 30s wall sit between sets",
    ],
  },
  {
    id: "upper-push",
    name: "Upper Push",
    durationMin: 20,
    region: "anterior",
    movements: [
      "4 x 8 strict press",
      "3 x 10 dumbbell bench or floor press",
      "3 x 10 dips (scale as needed)",
      "3 x 12 lateral raise",
    ],
  },
  {
    id: "core-midline",
    name: "Core + Midline",
    durationMin: 20,
    region: "core",
    movements: [
      "3 x 45s hollow hold",
      "3 x 12 toes-to-bar (or hanging knee raise)",
      "3 x 60s plank",
      "3 x 15 weighted Russian twists/side",
    ],
  },
  {
    id: "lower-strength",
    name: "Lower Strength",
    durationMin: 20,
    region: "full",
    movements: [
      "5 x 5 back squat (moderate)",
      "3 x 8/side walking lunge",
      "3 x 15 calf raise",
      "3 x 12 goblet squat",
    ],
  },
];
