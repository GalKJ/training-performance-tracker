import type { SessionBlock, SessionPlan, Wod } from "../types/wod";
import {
  accessories,
  warmUps,
  type AccessoryTemplate,
  type Modality,
  type Region,
  type WarmUpTemplate,
} from "./workoutTemplates";

const MODALITY_KEYWORDS: Record<Modality, string[]> = {
  barbell: [
    "barbell",
    "back squat",
    "front squat",
    "overhead squat",
    "deadlift",
    "clean",
    "snatch",
    "jerk",
    "thruster",
    "press",
    "push press",
    "push jerk",
  ],
  kettlebell: ["kettlebell", "kb ", "goblet", "swing"],
  gymnastics: [
    "pull-up",
    "pull up",
    "muscle-up",
    "muscle up",
    "handstand",
    "hspu",
    "toes-to-bar",
    "toes to bar",
    "ring",
    "bar dip",
    "ring dip",
    "rope climb",
    "pistol",
  ],
  cardio: [
    "run",
    "row",
    "bike",
    "ski",
    "double-under",
    "double under",
    "single-under",
    "single under",
    "burpee",
    "jump",
  ],
  general: [],
};

const REGION_KEYWORDS: Record<Region, string[]> = {
  posterior: [
    "deadlift",
    "swing",
    "clean",
    "snatch",
    "row",
    "pull-up",
    "pull up",
    "kettlebell",
    "good morning",
    "rdl",
  ],
  anterior: [
    "bench",
    "push-up",
    "push up",
    "press",
    "push press",
    "push jerk",
    "thruster",
    "dip",
    "hspu",
    "handstand",
  ],
  core: [
    "toes-to-bar",
    "toes to bar",
    "sit-up",
    "sit up",
    "v-up",
    "v up",
    "hollow",
    "plank",
    "l-sit",
    "l sit",
    "knee raise",
  ],
  full: [
    "thruster",
    "burpee",
    "wall ball",
    "wallball",
    "clean",
    "snatch",
    "man-maker",
    "manmaker",
  ],
};

const countMatches = (text: string, keywords: string[]): number => {
  return keywords.reduce((total, keyword) => {
    return total + (text.includes(keyword) ? 1 : 0);
  }, 0);
};

export const detectModality = (bodyText: string): Modality => {
  const text = bodyText.toLowerCase();
  let best: Modality = "general";
  let bestScore = 0;
  (Object.keys(MODALITY_KEYWORDS) as Modality[]).forEach((modality) => {
    if (modality === "general") {
      return;
    }
    const score = countMatches(text, MODALITY_KEYWORDS[modality]);
    if (score > bestScore) {
      best = modality;
      bestScore = score;
    }
  });
  return best;
};

const detectDominantRegion = (bodyText: string): Region => {
  const text = bodyText.toLowerCase();
  let best: Region = "full";
  let bestScore = 0;
  (Object.keys(REGION_KEYWORDS) as Region[]).forEach((region) => {
    const score = countMatches(text, REGION_KEYWORDS[region]);
    if (score > bestScore) {
      best = region;
      bestScore = score;
    }
  });
  return best;
};

const COMPLEMENT: Record<Region, Region> = {
  posterior: "anterior",
  anterior: "posterior",
  core: "full",
  full: "core",
};

export const pickWarmUp = (bodyText: string): WarmUpTemplate => {
  const modality = detectModality(bodyText);
  const match = warmUps.find((template) =>
    template.modalities.includes(modality),
  );
  return match ?? warmUps[0];
};

export const pickAccessory = (bodyText: string): AccessoryTemplate => {
  const region = detectDominantRegion(bodyText);
  const complement = COMPLEMENT[region];
  const match = accessories.find((template) => template.region === complement);
  return match ?? accessories[0];
};

const extractWodMovements = (bodyText: string): string[] => {
  const lines = bodyText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const stopHeadings = [
    "stimulus and strategy",
    "intermediate option",
    "beginner option",
    "scaling",
    "post-workout",
    "post workout",
  ];

  const prescription: string[] = [];
  for (const line of lines) {
    if (stopHeadings.some((h) => line.toLowerCase().startsWith(h))) {
      break;
    }
    prescription.push(line);
  }
  return prescription.length > 0 ? prescription : lines;
};

const estimateWodDurationMin = (movements: string[]): number => {
  const text = movements.join(" ").toLowerCase();
  const amrapMatch = text.match(/(\d+)[- ]?(?:min|minute)/);
  if (text.includes("amrap") && amrapMatch) {
    return Number(amrapMatch[1]);
  }
  if (amrapMatch) {
    return Number(amrapMatch[1]);
  }
  const roundsMatch = text.match(/(\d+)\s*rounds?/);
  if (roundsMatch) {
    return Math.max(10, Math.min(30, Number(roundsMatch[1]) * 3));
  }
  return 20;
};

export const buildSessionPlan = (wod: Wod): SessionPlan => {
  const warmUpTemplate = pickWarmUp(wod.bodyText);
  const accessoryTemplate = pickAccessory(wod.bodyText);
  const wodMovements = extractWodMovements(wod.bodyText);
  const wodDurationMin = estimateWodDurationMin(wodMovements);

  const warmUp: SessionBlock = {
    label: "WARM-UP",
    name: warmUpTemplate.name,
    durationMin: warmUpTemplate.durationMin,
    movements: warmUpTemplate.movements,
  };

  const wodBlock: SessionBlock = {
    label: "WOD",
    name: wod.title.replace(/^.*Workout of the Day\s*/i, "").trim() || wod.slug,
    durationMin: wodDurationMin,
    movements: wodMovements,
  };

  const accessoriesBlock: SessionBlock = {
    label: "ACCESSORIES",
    name: accessoryTemplate.name,
    durationMin: accessoryTemplate.durationMin,
    movements: accessoryTemplate.movements,
  };

  return {
    warmUp,
    wod: wodBlock,
    accessories: accessoriesBlock,
    totalMin: warmUp.durationMin + wodBlock.durationMin + accessoriesBlock.durationMin,
  };
};
