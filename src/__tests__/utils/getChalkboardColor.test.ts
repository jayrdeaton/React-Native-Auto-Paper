import { createChalkboardTone, getChalkboardColor } from '../../utils/getChalkboardColor'
import { getLuminance } from '../../utils/getContrastRatio'
import { getOklch } from '../../utils/getOklch'

// The picker's 20 default swatches plus a near-black and a near-white.
const SEEDS = ['#f44336', '#ff5722', '#ff6d00', '#ff9800', '#fdd835', '#8bc34a', '#4caf50', '#009688', '#00bcd4', '#03a9f4', '#2196f3', '#3f51b5', '#673ab7', '#9c27b0', '#d500f9', '#ec407a', '#e91e63', '#795548', '#8d7b68', '#607d8b', '#111111', '#f5f5f5']
const hueDistance = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b))
const oklch = (hex: string) => getOklch(hex)!

describe('getChalkboardColor in light mode (marker)', () => {
  it.each(SEEDS)('never lightens %s, caps it at 0.6 lightness, and keeps its hue', (seed) => {
    const before = oklch(seed)
    const after = oklch(getChalkboardColor(seed, false))

    expect(after.l).toBeLessThanOrEqual(Math.min(before.l, 0.6) + 0.005)
    expect(after.c).toBeLessThanOrEqual(before.c * 0.85 + 0.005)
    if (before.c > 0.03) expect(hueDistance(after.h, before.h)).toBeLessThan(3)
  })

  it('only trims the chroma of a color already darker than the cap', () => {
    const before = oklch('#3f51b5')
    const after = oklch(getChalkboardColor('#3f51b5', false))

    expect(after.l).toBeCloseTo(before.l, 2)
    expect(after.c).toBeCloseTo(before.c * 0.85, 2)
  })
})

describe('getChalkboardColor in dark mode (chalk)', () => {
  it.each(SEEDS)('lifts %s to a pastel at least half white in luminance, never darker, with its hue kept', (seed) => {
    const before = oklch(seed)
    const toned = getChalkboardColor(seed, true)
    const after = oklch(toned)

    expect(getLuminance(toned)).toBeGreaterThanOrEqual(0.5)
    expect(after.l).toBeGreaterThanOrEqual(before.l - 0.005)
    expect(after.c).toBeLessThanOrEqual(before.c * 0.8 + 0.005)
    if (before.c > 0.03) expect(hueDistance(after.h, before.h)).toBeLessThan(3)
  })

  it('stops at the lowest lightness that clears the floor, rather than jumping to white', () => {
    const toned = getChalkboardColor('#3f51b5', true)

    expect(getLuminance(toned)).toBeLessThan(0.56)
    expect(toned).not.toBe('#ffffff')
  })
})

describe('createChalkboardTone', () => {
  it("is what getChalkboardColor is, with the defaults (Hangman's red: marker #d8473a, chalk #ffa496)", () => {
    const tone = createChalkboardTone()
    expect(tone('#f44336', false)).toBe('#d8473a')
    expect(tone('#f44336', true)).toBe('#ffa496')
    expect(getChalkboardColor('#f44336', true)).toBe('#ffa496')
  })

  it('takes each setting separately, keeping the defaults for the rest', () => {
    const deeper = createChalkboardTone({ marker: { maxLightness: 0.5 } })
    expect(oklch(deeper('#ffeb3b', false)).l).toBeLessThanOrEqual(0.505)
    expect(oklch(deeper('#ffeb3b', false)).c).toBeLessThanOrEqual(oklch('#ffeb3b').c * 0.85 + 0.005)

    // No luminance floor: chalk only moves halfway toward 0.86 lightness.
    const softer = createChalkboardTone({ chalk: { minLuminance: 0 } })
    const before = oklch('#3f51b5')
    expect(oklch(softer('#3f51b5', true)).l).toBeCloseTo(before.l + (0.86 - before.l) * 0.5, 2)
    expect(getLuminance(softer('#3f51b5', true))).toBeLessThan(0.5)
  })

  it('returns anything it cannot parse unchanged', () => {
    expect(getChalkboardColor('not a color', false)).toBe('not a color')
    expect(getChalkboardColor('not a color', true)).toBe('not a color')
  })

  it('gives the same answer from its cache as it did the first time, for both appearances', () => {
    const tone = createChalkboardTone()
    const first = [tone('#2196f3', false), tone('#2196f3', true)]
    expect([tone('#2196f3', false), tone('#2196f3', true)]).toEqual(first)
    expect(first[0]).not.toBe(first[1])
  })

  it('keeps working past its cache limit', () => {
    const tone = createChalkboardTone()
    const expected = tone('#2196f3', true)
    for (let i = 0; i < 600; i++) tone(`#${i.toString(16).padStart(6, '0')}`, i % 2 === 0)
    expect(tone('#2196f3', true)).toBe(expected)
  })
})
