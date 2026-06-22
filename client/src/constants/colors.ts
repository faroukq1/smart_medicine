export const darkColors = {
  bg: '#03080f',
  card: '#070f1d',
  surface: '#050d1a',
  border: '#0f2035',
  primary: '#00e5c4',
  secondary: '#0077ff',
  danger: '#ff4060',
  warning: '#f59e0b',
  textMuted: '#4a7fa5',
  textDim: '#2a5070',
  textBright: '#cde0f0',
};

export const lightColors = {
  bg: '#f0f2f5',
  card: '#ffffff',
  surface: '#e4e8ee',
  border: '#d0d7e2',
  primary: '#00c9a7',
  secondary: '#0066dd',
  danger: '#d9364e',
  warning: '#c97d08',
  textMuted: '#6b7f94',
  textDim: '#9aafc5',
  textBright: '#1a2a3a',
};

export type ColorPalette = typeof darkColors;

// Keep default export for backward compatibility (always dark)
export const colors = darkColors;
