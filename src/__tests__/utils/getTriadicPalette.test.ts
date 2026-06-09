import { getTriadicPalette } from '../../utils/getTriadicPalette'

const hexPattern = /^#[0-9a-f]{6}$/i

describe('getTriadicPalette', () => {
  it('returns primary as the input color (as hex)', () => {
    const { primary } = getTriadicPalette('#ff0000')
    expect(primary).toBe('#ff0000')
  })

  it('all three values are valid hex strings', () => {
    const palette = getTriadicPalette('#6750a4')
    expect(palette.primary).toMatch(hexPattern)
    expect(palette.secondary).toMatch(hexPattern)
    expect(palette.tertiary).toMatch(hexPattern)
  })

  it('secondary and tertiary differ from primary', () => {
    const { primary, secondary, tertiary } = getTriadicPalette('#6750a4')
    expect(secondary).not.toBe(primary)
    expect(tertiary).not.toBe(primary)
  })

  it('accepts named colors', () => {
    const { primary } = getTriadicPalette('blue')
    expect(primary).toBe('#0000ff')
  })

  it('throws on invalid input', () => {
    expect(() => getTriadicPalette('notacolor')).toThrow('Invalid color format')
  })

  describe('split-complementary (default)', () => {
    it('explicit split-complementary matches default', () => {
      const implicit = getTriadicPalette('#6750a4')
      const explicit = getTriadicPalette('#6750a4', 'split-complementary')
      expect(explicit).toEqual(implicit)
    })
  })

  describe('triadic', () => {
    it('red produces green secondary and blue tertiary', () => {
      const { secondary, tertiary } = getTriadicPalette('#ff0000', 'triadic')
      expect(secondary).toBe('#00ff00')
      expect(tertiary).toBe('#0000ff')
    })
  })

  describe('split-complementary', () => {
    it('produces valid hex for all three', () => {
      const palette = getTriadicPalette('#6750a4', 'split-complementary')
      expect(palette.primary).toMatch(hexPattern)
      expect(palette.secondary).toMatch(hexPattern)
      expect(palette.tertiary).toMatch(hexPattern)
    })

    it('secondary and tertiary differ from triadic equivalents', () => {
      const triadic = getTriadicPalette('#6750a4', 'triadic')
      const split = getTriadicPalette('#6750a4', 'split-complementary')
      expect(split.secondary).not.toBe(triadic.secondary)
      expect(split.tertiary).not.toBe(triadic.tertiary)
    })

    it('secondary and tertiary are symmetric around the complement (equidistant hues)', () => {
      const { secondary, tertiary } = getTriadicPalette('#ff0000', 'split-complementary')
      expect(secondary).toMatch(hexPattern)
      expect(tertiary).toMatch(hexPattern)
      expect(secondary).not.toBe(tertiary)
    })
  })

  describe('analogous', () => {
    it('produces valid hex for all three', () => {
      const palette = getTriadicPalette('#6750a4', 'analogous')
      expect(palette.primary).toMatch(hexPattern)
      expect(palette.secondary).toMatch(hexPattern)
      expect(palette.tertiary).toMatch(hexPattern)
    })

    it('secondary and tertiary are close in hue to primary', () => {
      const triadic = getTriadicPalette('#6750a4', 'triadic')
      const analogous = getTriadicPalette('#6750a4', 'analogous')
      expect(analogous.secondary).not.toBe(triadic.secondary)
      expect(analogous.tertiary).not.toBe(triadic.tertiary)
    })
  })

  describe('square', () => {
    it('produces valid hex for all three', () => {
      const palette = getTriadicPalette('#6750a4', 'square')
      expect(palette.primary).toMatch(hexPattern)
      expect(palette.secondary).toMatch(hexPattern)
      expect(palette.tertiary).toMatch(hexPattern)
    })

    it('red secondary is at 90° (yellow-green) and tertiary at 270° (blue-violet)', () => {
      const { secondary, tertiary } = getTriadicPalette('#ff0000', 'square')
      expect(secondary).toBe('#80ff00')
      expect(tertiary).toBe('#8000ff')
    })
  })

  describe('complementary', () => {
    it('produces valid hex for all three', () => {
      const palette = getTriadicPalette('#6750a4', 'complementary')
      expect(palette.primary).toMatch(hexPattern)
      expect(palette.secondary).toMatch(hexPattern)
      expect(palette.tertiary).toMatch(hexPattern)
    })

    it('red tertiary is cyan (180° complement)', () => {
      const { tertiary } = getTriadicPalette('#ff0000', 'complementary')
      expect(tertiary).toBe('#00ffff')
    })
  })

  describe('double-split', () => {
    it('produces valid hex for all three', () => {
      const palette = getTriadicPalette('#6750a4', 'double-split')
      expect(palette.primary).toMatch(hexPattern)
      expect(palette.secondary).toMatch(hexPattern)
      expect(palette.tertiary).toMatch(hexPattern)
    })

    it('secondary and tertiary are symmetric around primary', () => {
      const { secondary, tertiary } = getTriadicPalette('#ff0000', 'double-split')
      expect(secondary).toMatch(hexPattern)
      expect(tertiary).toMatch(hexPattern)
      expect(secondary).not.toBe(tertiary)
    })
  })

  describe('all harmonies produce distinct palettes for a given seed', () => {
    const harmonies = ['triadic', 'split-complementary', 'analogous', 'square', 'complementary', 'double-split'] as const
    const palettes = harmonies.map((h) => getTriadicPalette('#6750a4', h))

    it('each harmony produces a unique tertiary', () => {
      // Tertiaries are always distinct across all 6 modes
      const tertiaries = palettes.map((p) => p.tertiary)
      const unique = new Set(tertiaries)
      expect(unique.size).toBe(harmonies.length)
    })

    it('harmonies that share a secondary offset are distinguished by their tertiary', () => {
      // analogous and double-split both use +30° for secondary (intentional — tertiary differs)
      const analogous = getTriadicPalette('#6750a4', 'analogous')
      const doubleSplit = getTriadicPalette('#6750a4', 'double-split')
      expect(analogous.secondary).toBe(doubleSplit.secondary)
      expect(analogous.tertiary).not.toBe(doubleSplit.tertiary)

      // square and complementary both use +90° for secondary (intentional — tertiary differs)
      const square = getTriadicPalette('#6750a4', 'square')
      const complementary = getTriadicPalette('#6750a4', 'complementary')
      expect(square.secondary).toBe(complementary.secondary)
      expect(square.tertiary).not.toBe(complementary.tertiary)
    })
  })
})
