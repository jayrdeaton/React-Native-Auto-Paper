import { getThirdColor } from '../../utils/getThirdColor'

const hexPattern = /^#[0-9a-f]{6}$/i

describe('getThirdColor', () => {
  it('returns a valid hex string', () => {
    const result = getThirdColor('#ff0000', '#0000ff')
    expect(result).toMatch(hexPattern)
  })

  it('differs from both inputs', () => {
    const result = getThirdColor('#ff0000', '#0000ff')
    expect(result).not.toBe('#ff0000')
    expect(result).not.toBe('#0000ff')
  })

  it('accepts named colors', () => {
    const result = getThirdColor('red', 'blue')
    expect(result).toMatch(hexPattern)
  })

  it('is symmetric: argument order does not matter', () => {
    const ab = getThirdColor('#ff0000', '#00ff00')
    const ba = getThirdColor('#00ff00', '#ff0000')
    expect(ab).toBe(ba)
  })

  it('is the true triadic third when inputs are already 120° apart', () => {
    const result = getThirdColor('#ff0000', '#00ff00')
    expect(result).toBe('#0000ff')
  })

  it('falls back to a perpendicular hue for exact complements', () => {
    const result = getThirdColor('#ff0000', '#00ffff')
    expect(result).toMatch(hexPattern)
    expect(result).not.toBe('#ff0000')
    expect(result).not.toBe('#00ffff')
  })

  it('same color twice returns its own complement', () => {
    const result = getThirdColor('#ff0000', '#ff0000')
    expect(result).toBe('#00ffff')
  })

  it('throws on invalid first color', () => {
    expect(() => getThirdColor('notacolor', '#ff0000')).toThrow('Invalid color format')
  })

  it('throws on invalid second color', () => {
    expect(() => getThirdColor('#ff0000', 'notacolor')).toThrow('Invalid color format')
  })

  it('fallback hue for exact complements computes (hA + 90) % 360', () => {
    // red (hue 0) and cyan (hue 180) are exact complements, so x=y=0 and thirdHue
    // falls back to (0 + 90) % 360 = 90, averaging both inputs' full saturation and mid lightness
    const result = getThirdColor('#ff0000', '#00ffff')
    expect(result).toBe('#80ff00')
  })

  it('exercises the hslToHex h < 60 branch', () => {
    // green (hue 120) and blue (hue 240) produce a thirdHue of exactly 0
    const result = getThirdColor('#00ff00', '#0000ff')
    expect(result).toBe('#ff0000')
  })

  it('exercises the hslToHex h < 300 branch away from the boundary', () => {
    // red (hue 0) and spring green (hue 150) produce a thirdHue of ~255, well inside [240, 300)
    const result = getThirdColor('#ff0000', '#00ff80')
    expect(result).toBe('#4000ff')
  })

  it('exercises the hslToHex final else branch (h >= 300)', () => {
    // yellow (hue 60) and cyan (hue 180) produce a thirdHue of exactly 300
    const result = getThirdColor('#ffff00', '#00ffff')
    expect(result).toBe('#ff00ff')
  })
})
