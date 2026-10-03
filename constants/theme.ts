import { Platform } from "react-native";

// Colours are estimated from the design mockup. Swap in exact values if you have them.
export const theme = {
  colors: {
    background: "#F7F3EA",
    card: "#FFFBF0",
    surface: "#FFFFFF",
    border: "#EFE8D6",
    primary: "#0F5B63",
    primaryText: "#FFFFFF",
    text: "#1F2A2E",
    muted: "#6B7280",
    mint: "#D9EFE6",
    mintText: "#1E6B4B",
    amber: "#FBE8B8",
    amberText: "#8A5A00",
    danger: "#A93226",
    tabInactive: "#6B7280",
  },
  radius: { card: 24, pill: 999, tab: 18, small: 14 },
  fonts: {
    // Serif for headings and big numbers (closest to the mockup without extra packages).
    // To use a custom font later (e.g. Fraunces), replace this name.
    heading: Platform.select({ ios: "Georgia", default: "serif" }),
  },
} as const;
