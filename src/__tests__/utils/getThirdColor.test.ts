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
})
