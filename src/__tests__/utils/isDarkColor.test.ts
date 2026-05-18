import { isDarkColor } from '../../utils/isDarkColor'

describe('isDarkColor', () => {
  it('identifies black as dark', () => {
    expect(isDarkColor('#000000')).toBe(true)
  })

  it('identifies white as light', () => {
    expect(isDarkColor('#ffffff')).toBe(false)
  })

  it('identifies dark navy as dark', () => {
    expect(isDarkColor('#00008b')).toBe(true)
  })

  it('identifies yellow as light', () => {
    expect(isDarkColor('#ffff00')).toBe(false)
  })

  it('identifies mid-gray correctly', () => {
    expect(isDarkColor('#808080')).toBe(true)
  })

  it('returns false for invalid color', () => {
    expect(isDarkColor('notacolor')).toBe(false)
  })

  it('uses WCAG relative luminance (green is light)', () => {
    expect(isDarkColor('#00ff00')).toBe(false)
  })
})
