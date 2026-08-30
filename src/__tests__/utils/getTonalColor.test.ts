import { getTonalColor } from '../../utils/getTonalColor'

const hexPattern = /^#[0-9a-f]{6}$/i

describe('getTonalColor', () => {
  it('returns a valid hex string', () => {
    expect(getTonalColor('#ff0000', 0.5)).toMatch(hexPattern)
  })

  it('returns the input color unchanged when the color string is invalid', () => {
    expect(getTonalColor('notacolor', 0.5)).toBe('notacolor')
  })

  describe('clamping lightness for a chromatic color', () => {
    it('darkens while preserving hue and saturation', () => {
      expect(getTonalColor('#ff0000', 0.25)).toBe('#800000')
    })

    it('lightens while preserving hue and saturation', () => {
      expect(getTonalColor('#ff0000', 0.75)).toBe('#ff8080')
    })
  })

  describe('achromatic input', () => {
    it('stays grey when darkened', () => {
      expect(getTonalColor('#808080', 0.2)).toBe('#333333')
    })

    it('stays grey when lightened', () => {
      expect(getTonalColor('#808080', 0.8)).toBe('#cccccc')
    })
  })

  describe('lightness clamping', () => {
    it('clamps lightness above 1 to white for a chromatic color', () => {
      expect(getTonalColor('#ff0000', 2)).toBe('#ffffff')
    })

    it('clamps lightness below 0 to black for a chromatic color', () => {
      expect(getTonalColor('#ff0000', -1)).toBe('#000000')
    })

    it('clamps lightness above 1 to white for an achromatic color', () => {
      expect(getTonalColor('#808080', 1)).toBe('#ffffff')
    })

    it('clamps lightness below 0 to black for an achromatic color', () => {
      expect(getTonalColor('#808080', 0)).toBe('#000000')
    })
  })

  describe('hue segments in the rebuild step', () => {
    it('h < 60', () => {
      expect(getTonalColor('#ff8000', 0.25)).toBe('#804000')
      expect(getTonalColor('#ff8000', 0.75)).toBe('#ffc080')
    })

    it('h < 120', () => {
      expect(getTonalColor('#80ff00', 0.25)).toBe('#408000')
      expect(getTonalColor('#80ff00', 0.75)).toBe('#c0ff80')
    })

    it('h < 180', () => {
      expect(getTonalColor('#00ff80', 0.25)).toBe('#008040')
      expect(getTonalColor('#00ff80', 0.75)).toBe('#80ffc0')
    })

    it('h < 240', () => {
      expect(getTonalColor('#0080ff', 0.25)).toBe('#004080')
      expect(getTonalColor('#0080ff', 0.75)).toBe('#80c0ff')
    })

    it('h < 300', () => {
      expect(getTonalColor('#8000ff', 0.25)).toBe('#400080')
      expect(getTonalColor('#8000ff', 0.75)).toBe('#c080ff')
    })

    it('h >= 300 (else branch)', () => {
      expect(getTonalColor('#ff0080', 0.25)).toBe('#800040')
      expect(getTonalColor('#ff0080', 0.75)).toBe('#ff80c0')
    })
  })
})
