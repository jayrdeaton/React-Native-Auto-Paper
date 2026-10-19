import { getColorRoles } from '../../utils/getColorRoles'

const relativeLuminance = (hex: string): number => {
  const n = parseInt(hex.replace('#', ''), 16)
  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}
const contrastRatio = (hexA: string, hexB: string): number => {
  const [l1, l2] = [relativeLuminance(hexA), relativeLuminance(hexB)].sort((a, b) => b - a)
  return (l1 + 0.05) / (l2 + 0.05)
}

// Real MD3 surface tokens (see LightTheme.tsx/DarkTheme.tsx's palette.neutral99/neutral10), the
// same values useComputedTheme actually blends containers toward.
const SURFACE = { light: '#FFFBFE', dark: '#1C1B1F' }
const BASE_COLORS = { green: '#2E7D32', amber: '#B8860B', red: '#B00020' }

describe('getColorRoles', () => {
  it('returns the base color unchanged as `color`', () => {
    expect(getColorRoles('#2E7D32', SURFACE.light).color).toBe('#2E7D32')
  })

  it.each(Object.entries(BASE_COLORS))('keeps %s onContainer readable against its own container, in both light and dark surfaces', (_name, base) => {
    for (const surface of Object.values(SURFACE)) {
      const roles = getColorRoles(base, surface)
      expect(contrastRatio(roles.onContainer, roles.container)).toBeGreaterThanOrEqual(4.5)
    }
  })

  it.each(Object.entries(BASE_COLORS))('keeps %s onContainer readable directly against the surface too, in both light and dark', (_name, base) => {
    for (const surface of Object.values(SURFACE)) {
      const roles = getColorRoles(base, surface)
      expect(contrastRatio(roles.onContainer, surface)).toBeGreaterThanOrEqual(4.5)
    }
  })

  // onColor stays light (the fleet's buttons have always had light text) wherever light text still
  // reads, the picker's reds, blues and greens included, and turns dark on colors too light for it.
  it.each(Object.entries({ ...BASE_COLORS, red: '#F44336', coral: '#FF5722', emerald: '#4CAF50', blue: '#2196F3', indigo: '#3F51B5', magenta: '#D500F9' }))('keeps light onColor on %s, where it reads', (_name, base) => {
    const roles = getColorRoles(base, SURFACE.light)
    expect(relativeLuminance(roles.onColor)).toBeGreaterThan(relativeLuminance(base))
    expect(contrastRatio(roles.onColor, base)).toBeGreaterThanOrEqual(2.5)
  })

  // Jay, 2026-10-19: these took near-white text by the color's own darkness alone (1.96:1 on the
  // picker's Lime), unreadable on a button.
  it.each(Object.entries({ lime: '#8BC34A', amber: '#FF9800', cyan: '#00BCD4', sky: '#03A9F4', yellow: '#FDD835', materialLime: '#CDDC39' }))('takes dark onColor on %s, too light for light text', (_name, base) => {
    const roles = getColorRoles(base, SURFACE.light)
    expect(relativeLuminance(roles.onColor)).toBeLessThan(relativeLuminance(base))
    expect(contrastRatio(roles.onColor, base)).toBeGreaterThanOrEqual(4.5)
  })

  it('lightens the container toward a light surface, and darkens it toward a dark surface', () => {
    const lightContainer = getColorRoles('#2E7D32', SURFACE.light).container
    const darkContainer = getColorRoles('#2E7D32', SURFACE.dark).container
    expect(relativeLuminance(lightContainer)).toBeGreaterThan(relativeLuminance('#2E7D32'))
    expect(relativeLuminance(darkContainer)).toBeLessThan(relativeLuminance(lightContainer))
  })

  it('containerAlpha=0 returns the surface itself as the container', () => {
    expect(getColorRoles('#2E7D32', SURFACE.light, 0).container).toBe(SURFACE.light.toLowerCase())
  })

  it('containerAlpha=1 returns the base color itself as the container', () => {
    expect(getColorRoles('#2E7D32', SURFACE.light, 1).container).toBe('#2e7d32')
  })
})
