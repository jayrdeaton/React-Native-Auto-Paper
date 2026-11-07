import { getRgb } from './getRgb'

// OKLCH: lightness 0-1, chroma (0 for greys, about 0.37 at most inside sRGB), hue in degrees.
export type Oklch = { l: number; c: number; h: number }

type Triple = [number, number, number]

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

// Björn Ottosson's OKLab matrices (https://bottosson.github.io/posts/oklab/), from linear sRGB.
const linearToOklab = ([r, g, b]: Triple): Triple => {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]
}

const oklabToLinear = ([L, a, b]: Triple): Triple => {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
}

const inGamut = (rgb: Triple) => rgb.every((v) => v >= -1e-6 && v <= 1 + 1e-6)

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

const toHex = (rgb: Triple) =>
  `#${rgb
    .map((v) =>
      Math.round(clamp01(toGamma(clamp01(v))) * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`

// A color in OKLCH, the perceptual space where equal steps of lightness or chroma look equal
// across hues (HSL's lightness doesn't: a yellow and a blue at the same HSL lightness differ
// several-fold in brightness). Null for anything getRgb can't parse. Alpha is dropped.
export const getOklch = (value: string): Oklch | null => {
  const rgb = getRgb(value)
  if (!rgb) return null
  const [l, a, b] = linearToOklab([toLinear(rgb.r / 255), toLinear(rgb.g / 255), toLinear(rgb.b / 255)])
  return { l, c: Math.hypot(a, b), h: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360 }
}

// Back to a hex string. A color outside sRGB keeps its lightness and hue and loses only as much
// chroma as it has to (a bisection on chroma, CSS Color 4's gamut mapping without its JND
// shortcut), so lifting a saturated blue toward pastel can't swing it off toward purple.
export const getOklchHex = ({ l, c, h }: Oklch): string => {
  const lightness = Math.min(1, Math.max(0, l))
  const radians = (h * Math.PI) / 180
  const atChroma = (chroma: number) => oklabToLinear([lightness, chroma * Math.cos(radians), chroma * Math.sin(radians)])
  const direct = atChroma(Math.max(0, c))
  if (inGamut(direct)) return toHex(direct)
  let low = 0
  let high = c
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2
    if (inGamut(atChroma(mid))) low = mid
    else high = mid
  }
  return toHex(atChroma(low))
}

export default getOklch
