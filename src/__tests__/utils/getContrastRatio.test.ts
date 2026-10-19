import { getContrastRatio, getLuminance } from '../../utils/getContrastRatio'
import { isDarkColor } from '../../utils/isDarkColor'

describe('getLuminance', () => {
  it('is 0 for black, 1 for white, and 0 for anything unparseable', () => {
    expect(getLuminance('#000000')).toBe(0)
    expect(getLuminance('#ffffff')).toBe(1)
    expect(getLuminance('nope')).toBe(0)
  })

  it('agrees with isDarkColor on which side of 0.5 a color falls', () => {
    for (const hex of ['#f44336', '#ffeb3b', '#2196f3', '#bdbdbd', '#ffa496']) expect(getLuminance(hex) < 0.5).toBe(isDarkColor(hex))
  })
})

describe('getContrastRatio', () => {
  it('is 21 for black on white and 1 for a color on itself, in either order', () => {
    expect(getContrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(getContrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5)
    expect(getContrastRatio('#f44336', '#f44336')).toBe(1)
  })

  it("matches WCAG's worked value for #767676 on white (4.54:1, the lightest grey that passes AA)", () => {
    expect(getContrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2)
  })
})
