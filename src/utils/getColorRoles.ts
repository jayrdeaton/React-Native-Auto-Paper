import { getBlendedColor } from './getBlendedColor'
import { getContrastRatio } from './getContrastRatio'
import { getTonalColor } from './getTonalColor'
import { isDarkColor } from './isDarkColor'

export type ColorRoles = {
  color: string
  onColor: string
  container: string
  onContainer: string
}

// The lowest contrast light text may have on a color before onColor turns dark instead. The fleet's
// colored buttons have always had light text, and keep it wherever it reads about as well as it does on
// their reds, blues and greens (2.8 to 3.1:1 for the picker's Red, Blue, Emerald and Coral); only
// colors light enough that it fades take dark text: the picker's Lime, Amber, Cyan and Sky (Yellow
// already did). Judging by the color's own darkness alone gave those near-white text that all but
// vanished (Jay, 2026-10-19: 1.96:1 on a light green Ready button).
const MIN_LIGHT_ON_COLOR_CONTRAST = 2.5

// The MD3 "color / onColor / container / onContainer" quadruple, generalized from the math
// useComputedTheme already uses for primary/secondary/tertiary: onColor is tuned to sit on the
// vivid color itself (light while it reads, MIN_LIGHT_ON_COLOR_CONTRAST, else dark), container is
// base blended toward the theme's real surface (so it inherits
// that surface's actual lightness rather than a fixed light/dark guess), and onContainer is tuned
// against the *computed* container rather than a light/dark assumption, so it stays readable
// whatever surface color it's handed. onContainer also reads safely directly on `surface` itself
// (not just on `container`), since container is only lightly blended toward it.
export const getColorRoles = (base: string, surface: string, containerAlpha = 0.15): ColorRoles => {
  const container = getBlendedColor(base, surface, containerAlpha)
  const lightOnColor = getTonalColor(base, 0.95)
  return {
    color: base,
    onColor: getContrastRatio(lightOnColor, base) >= MIN_LIGHT_ON_COLOR_CONTRAST ? lightOnColor : getTonalColor(base, 0.08),
    container,
    onContainer: getTonalColor(base, isDarkColor(container) ? 0.92 : 0.12)
  }
}

export default getColorRoles
