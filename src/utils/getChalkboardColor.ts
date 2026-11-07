import { getLuminance } from './getContrastRatio'
import { getOklch, getOklchHex } from './getOklch'

// What Provider's `paletteTone` takes: a pure function from one palette color (primary, secondary
// or tertiary, after the harmony rotation) and the resolved appearance to the color the theme
// should actually use. It must be referentially stable (a module-level function, not an inline
// arrow), since the theme recomputes whenever it changes.
export type PaletteTone = (color: string, dark: boolean) => string

export type ChalkboardToneOptions = {
  // Light mode, marker on a whiteboard: deep ink, never neon. A color lighter than `maxLightness`
  // (OKLCH lightness) is brought down to it, and every color keeps `chroma` of its chroma.
  marker?: { maxLightness?: number; chroma?: number }
  // Dark mode, chalk on a chalkboard: pastel at an even value. Lightness moves `lift` of the way
  // toward `lightness` (never darker), chroma is scaled by `chroma`, and then lightness rises until
  // the color's WCAG luminance reaches `minLuminance`, so it reads as chalk on the board and takes
  // dark text when it's a fill (0 turns that floor off).
  chalk?: { lightness?: number; lift?: number; chroma?: number; minLuminance?: number }
}

const MARKER = { maxLightness: 0.6, chroma: 0.85 }
const CHALK = { lightness: 0.86, lift: 0.5, chroma: 0.8, minLuminance: 0.5 }

// The pickers tone 60 colors per render (20 swatches, three wedges each), and chalk's luminance
// floor is a search, so results are cached per tone. Bounded, since a picker only ever shows a
// few dozen distinct colors.
const CACHE_LIMIT = 512

// A PaletteTone for apps that want their palette muted like marker and chalk: a little in light
// mode (deeper, slightly less chroma), more in dark mode (pastel). Hue never moves, so a palette
// keeps its colors, only toned down. Signal colors (success, warning, danger, error) never pass
// through a tone. Pass the result straight to Provider's `paletteTone`; `getChalkboardColor` below
// is this with the defaults.
export const createChalkboardTone = (options: ChalkboardToneOptions = {}): PaletteTone => {
  const marker = { ...MARKER, ...options.marker }
  const chalk = { ...CHALK, ...options.chalk }
  const cache = new Map<string, string>()

  const toMarker = (color: string) => {
    const oklch = getOklch(color)
    if (!oklch) return color
    return getOklchHex({ l: Math.min(oklch.l, marker.maxLightness), c: oklch.c * marker.chroma, h: oklch.h })
  }

  const toChalk = (color: string) => {
    const oklch = getOklch(color)
    if (!oklch) return color
    const c = oklch.c * chalk.chroma
    const lifted = oklch.l < chalk.lightness ? oklch.l + (chalk.lightness - oklch.l) * chalk.lift : oklch.l
    const result = getOklchHex({ l: lifted, c, h: oklch.h })
    if (getLuminance(result) >= chalk.minLuminance) return result
    // Luminance rises with lightness at a fixed hue, so the lowest lightness that clears the floor
    // is a bisection between the lifted lightness and white.
    let low = lifted
    let high = 1
    for (let i = 0; i < 20; i++) {
      const mid = (low + high) / 2
      if (getLuminance(getOklchHex({ l: mid, c, h: oklch.h })) >= chalk.minLuminance) high = mid
      else low = mid
    }
    return getOklchHex({ l: high, c, h: oklch.h })
  }

  return (color, dark) => {
    const key = `${dark ? 'd' : 'l'}${color}`
    const cached = cache.get(key)
    if (cached !== undefined) return cached
    const result = dark ? toChalk(color) : toMarker(color)
    if (cache.size >= CACHE_LIMIT) cache.clear()
    cache.set(key, result)
    return result
  }
}

export const getChalkboardColor: PaletteTone = createChalkboardTone()

export default getChalkboardColor
