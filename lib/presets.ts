export type Preset = {
  name: string;
  color: string;
  period: "day" | "week";
  target_per_period: number;
  unit?: string;
};

export const PRESETS: Record<string, Preset> = {
  water: {
    name: "Drink water",
    color: "#2a6b6b",
    period: "day",
    target_per_period: 8,
    unit: "cups",
  },
  steps: {
    name: "Walk 10k steps",
    color: "#3e7a52",
    period: "day",
    target_per_period: 10000,
    unit: "steps",
  },
  meditate: {
    name: "Meditate",
    color: "#5a4a8a",
    period: "day",
    target_per_period: 1,
  },
  read: {
    name: "Read pages",
    color: "#1f4e7a",
    period: "day",
    target_per_period: 20,
    unit: "pages",
  },
  pushups: {
    name: "Push-ups",
    color: "#c4623d",
    period: "day",
    target_per_period: 30,
  },
  sleep: {
    name: "Sleep early",
    color: "#9c2a2a",
    period: "day",
    target_per_period: 1,
  },
  cardio: {
    name: "Cardio sessions",
    color: "#d39c2b",
    period: "week",
    target_per_period: 3,
  },
};

export function listPresets(): Array<{ key: string; preset: Preset }> {
  return Object.entries(PRESETS).map(([key, preset]) => ({ key, preset }));
}
