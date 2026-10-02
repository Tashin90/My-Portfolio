export const visualModes = {
  cyan: { label: "Cyan", primary: "#5ef2ff", secondary: "#3b82f6", tertiary: "#75ffd6", colors: [[.08, .86, 1], [.1, .32, 1], [.2, 1, .68]] },
  violet: { label: "Violet", primary: "#b28cff", secondary: "#58d8ff", tertiary: "#6d5cff", colors: [[.62, .3, 1], [.08, .68, 1], [.3, .18, 1]] },
  plasma: { label: "Plasma", primary: "#ff6bd6", secondary: "#76f7d1", tertiary: "#7c5cff", colors: [[1, .12, .66], [.1, .95, .66], [.36, .16, 1]] }
} as const;

export type VisualMode = keyof typeof visualModes;
