import getTintTextColorDefault from '../../utils/getTintTextColor'
import { getTintTextColor } from '../../utils/getTintTextColor'

describe('getTintTextColor', () => {
  it('returns a light (0.92 lightness) tone when the blended backdrop is dark', () => {
    // Red tint over a black backdrop at low opacity blends to a near-black '#1a0000',
    // which isDarkColor reports as dark, so the result should target 0.92 lightness.
    expect(getTintTextColor('#ff0000', '#000000', 0.1)).toBe('#ffd6d6')
  })

  it('returns a dark (0.12 lightness) tone when the blended backdrop is light', () => {
    // Red tint over a white backdrop at low opacity blends to a near-white '#fff2f2',
    // which isDarkColor reports as light, so the result should target 0.12 lightness.
    expect(getTintTextColor('#ff0000', '#ffffff', 0.05)).toBe('#3d0000')
  })

  it('exposes the same function as both the named and default export', () => {
    expect(getTintTextColorDefault).toBe(getTintTextColor)
  })
})
