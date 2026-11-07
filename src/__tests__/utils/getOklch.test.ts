import { getOklch, getOklchHex } from '../../utils/getOklch'

const hueDistance = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b))

describe('getOklch', () => {
  it('matches the published OKLCH values for white, black and sRGB red', () => {
    expect(getOklch('#ffffff')!.l).toBeCloseTo(1, 3)
    expect(getOklch('#ffffff')!.c).toBeCloseTo(0, 3)
    expect(getOklch('#000000')!.l).toBeCloseTo(0, 3)
    // CSS Color 4's oklch(62.8% 0.2577 29.23) for #ff0000.
    const red = getOklch('#ff0000')!
    expect(red.l).toBeCloseTo(0.628, 3)
    expect(red.c).toBeCloseTo(0.2577, 3)
    expect(red.h).toBeCloseTo(29.23, 1)
  })

  it('reads any format getRgb does, and returns null for anything it cannot', () => {
    expect(getOklch('rgb(255, 0, 0)')).toEqual(getOklch('#ff0000'))
    expect(getOklch('red')).toEqual(getOklch('#ff0000'))
    expect(getOklch('not a color')).toBeNull()
  })
})

describe('getOklchHex', () => {
  it.each(['#f44336', '#2196f3', '#4caf50', '#9c27b0', '#ffeb3b', '#009688', '#795548', '#000000', '#ffffff'])('round-trips %s exactly', (hex) => {
    expect(getOklchHex(getOklch(hex)!)).toBe(hex)
  })

  // A pastel blue this saturated sits outside sRGB, so it has to lose chroma to be drawn at all.
  it('maps an out-of-gamut color into sRGB by cutting chroma only, keeping lightness and hue', () => {
    const wanted = { l: 0.9, c: 0.3, h: 264 }
    const drawn = getOklch(getOklchHex(wanted))!

    expect(drawn.l).toBeCloseTo(0.9, 2)
    expect(hueDistance(drawn.h, 264)).toBeLessThan(2)
    expect(drawn.c).toBeLessThan(0.3)
    expect(drawn.c).toBeGreaterThan(0.03)
  })

  it('clamps lightness to 0-1 and treats a negative chroma as grey', () => {
    expect(getOklchHex({ l: 1.4, c: 0, h: 0 })).toBe('#ffffff')
    expect(getOklchHex({ l: -0.2, c: 0, h: 0 })).toBe('#000000')
    expect(getOklchHex({ l: 0.5, c: -1, h: 120 })).toBe(getOklchHex({ l: 0.5, c: 0, h: 0 }))
  })
})
