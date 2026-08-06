// Placeholder brand palette for Little Pixel Studios.
// Swap these values for the studio's actual brand colors —
// consuming code (Tailwind config, RN theme) should never hardcode hex values directly.
export const colors = {
  ink: {
    950: "#0a0a0b",
    900: "#151517",
    700: "#3a3a3f",
    500: "#6b6b72",
    300: "#a8a8b0",
    100: "#e4e4e8",
  },
  paper: {
    50: "#ffffff",
    100: "#faf9f7",
    200: "#f0eee9",
  },
  accent: {
    600: "#a8791f",
    500: "#c99a3a",
    400: "#dcb968",
  },
  success: { 500: "#1f8a4c" },
  warning: { 500: "#b8791f" },
  danger: { 500: "#c0392b" },
} as const;

export type ColorToken = typeof colors;
