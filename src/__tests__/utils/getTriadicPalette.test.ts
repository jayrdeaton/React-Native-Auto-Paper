import { getTriadicPalette } from '../../utils/getTriadicPalette'

describe('getTriadicPalette', () => {
  it('returns primary as the input color (as hex)', () => {
    const { primary } = getTriadicPalette('#ff0000')
    expect(primary).toBe('#ff0000')
  })

  it('red produces green secondary and blue tertiary', () => {
    const { secondary, tertiary } = getTriadicPalette('#ff0000')
    expect(secondary).toBe('#00ff00')
    expect(tertiary).toBe('#0000ff')
  })

  it('all three values are valid hex strings', () => {
    const palette = getTriadicPalette('#6750a4')
    const hexPattern = /^#[0-9a-f]{6}$/i
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
})
