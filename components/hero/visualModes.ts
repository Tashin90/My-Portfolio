export const visualModes = {
  violet: { label: "Violet Matrix", primary: "#a78bfa", secondary: "#67e8f9", tertiary: "#6366f1", colors: [[.58, .32, 1], [.16, .78, .96], [.32, .31, .94]] },
  cyan: { label: "Cyan Neural", primary: "#67e8f9", secondary: "#60a5fa", tertiary: "#a78bfa", colors: [[.12, .83, .96], [.15, .38, 1], [.55, .3, .95]] },
  plasma: { label: "Plasma Core", primary: "#f0abfc", secondary: "#5eead4", tertiary: "#22d3ee", colors: [[.94, .22, .73], [.12, .85, .65], [.13, .74, .98]] }
} as const;

export type VisualMode = keyof typeof visualModes;
