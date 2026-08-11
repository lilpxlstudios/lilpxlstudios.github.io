// Little Pixel Studios brand palette — warm gold accent on charcoal/cream,
// sourced from the studio's marketing site design.
export const colors = {
  ink: {
    950: "#0a0a0b",
    900: "#1d1916",
    700: "#3a3a3f",
    500: "#6b6b72",
    300: "#a8a8b0",
    100: "#e4e4e8",
  },
  paper: {
    50: "#ffffff",
    100: "#fcfaf8",
    200: "#f0eee9",
  },
  accent: {
    600: "#a5871d",
    500: "#bd9d28",
    400: "#dcb968",
  },
  success: { 500: "#1f8a4c" },
  warning: { 500: "#b8791f" },
  danger: { 500: "#c0392b" },
} as const;

export type ColorToken = typeof colors;
