import { getBlendedColor } from '../../utils/getBlendedColor'

describe('getBlendedColor', () => {
  it('alpha=1 returns foreground color', () => {
    expect(getBlendedColor('#ff0000', '#0000ff', 1)).toBe('#ff0000')
  })

  it('alpha=0 returns background color', () => {
    expect(getBlendedColor('#ff0000', '#0000ff', 0)).toBe('#0000ff')
  })

  it('alpha=0.5 blends evenly', () => {
    const result = getBlendedColor('#ff0000', '#0000ff', 0.5)
    expect(result).toBe('#800080')
  })

  it('clamps alpha above 1', () => {
    expect(getBlendedColor('#ff0000', '#0000ff', 2)).toBe('#ff0000')
  })

  it('clamps alpha below 0', () => {
    expect(getBlendedColor('#ff0000', '#0000ff', -1)).toBe('#0000ff')
  })

  it('returns background when foreground is invalid', () => {
    expect(getBlendedColor('notacolor', '#0000ff', 0.5)).toBe('#0000ff')
  })

  it('blends white into black', () => {
    expect(getBlendedColor('#ffffff', '#000000', 0.5)).toBe('#808080')
  })
})
