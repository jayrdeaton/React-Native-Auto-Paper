import { getHex } from '../../utils/getHex'

describe('getHex', () => {
  it('converts rgb() to hex', () => {
    expect(getHex('rgb(255, 0, 0)')).toBe('#ff0000')
    expect(getHex('rgb(0, 255, 0)')).toBe('#00ff00')
    expect(getHex('rgb(0, 0, 255)')).toBe('#0000ff')
  })

  it('round-trips hex input', () => {
    expect(getHex('#ff0000')).toBe('#ff0000')
    expect(getHex('#a1b2c3')).toBe('#a1b2c3')
  })

  it('normalizes 3-digit hex to 6-digit', () => {
    expect(getHex('#f00')).toBe('#ff0000')
  })

  it('includes alpha in output for rgba', () => {
    const result = getHex('rgba(255, 0, 0, 1)')
    expect(result).toMatch(/^#ff0000/)
    expect(result?.length).toBe(9)
  })

  it('converts named colors', () => {
    expect(getHex('white')).toBe('#ffffff')
    expect(getHex('black')).toBe('#000000')
  })

  it('returns null for invalid input', () => {
    expect(getHex('notacolor')).toBeNull()
  })
})
