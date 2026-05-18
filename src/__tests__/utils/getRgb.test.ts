import { getRgb } from '../../utils/getRgb'

describe('getRgb', () => {
  it('parses 6-digit hex', () => {
    expect(getRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('parses hex without #', () => {
    expect(getRgb('00ff00')).toEqual({ r: 0, g: 255, b: 0 })
  })

  it('parses 3-digit hex', () => {
    expect(getRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('parses 8-digit hex with alpha', () => {
    const result = getRgb('#ff000080')
    expect(result?.r).toBe(255)
    expect(result?.g).toBe(0)
    expect(result?.b).toBe(0)
    expect(result?.a).toBeCloseTo(128 / 255)
  })

  it('parses rgb()', () => {
    expect(getRgb('rgb(100, 150, 200)')).toEqual({ r: 100, g: 150, b: 200 })
  })

  it('parses rgba()', () => {
    expect(getRgb('rgba(100, 150, 200, 0.5)')).toEqual({ r: 100, g: 150, b: 200, a: 0.5 })
  })

  it('parses named color', () => {
    expect(getRgb('red')).toEqual({ r: 255, g: 0, b: 0 })
    expect(getRgb('blue')).toEqual({ r: 0, g: 0, b: 255 })
    expect(getRgb('white')).toEqual({ r: 255, g: 255, b: 255 })
  })

  it('is case-insensitive', () => {
    expect(getRgb('RED')).toEqual({ r: 255, g: 0, b: 0 })
    expect(getRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('returns null for invalid input', () => {
    expect(getRgb('notacolor')).toBeNull()
    expect(getRgb('')).toBeNull()
  })
})
