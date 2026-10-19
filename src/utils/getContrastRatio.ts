import { getRgb } from './getRgb'

// WCAG 2's relative luminance (0 for black, 1 for white): the same formula isDarkColor applies.
export const getLuminance = (value: string): number => {
  const rgb = getRgb(value)
  if (!rgb) return 0
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((channel) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// WCAG 2's contrast ratio between two colors, 1 (identical) to 21 (black on white). Order doesn't matter.
export const getContrastRatio = (a: string, b: string): number => {
  const [lighter, darker] = [getLuminance(a), getLuminance(b)].sort((x, y) => y - x)
  return (lighter + 0.05) / (darker + 0.05)
}

export default getContrastRatio
