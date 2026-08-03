import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper'

import { getContrastColor, getSwatchRing } from '../../utils/getSwatchContrast'

const LIGHT_OUTLINE = MD3LightTheme.colors.outlineVariant
const DARK_OUTLINE = MD3DarkTheme.colors.outlineVariant

describe('getContrastColor', () => {
  it('puts white content on dark fills and black content on light fills', () => {
    expect(getContrastColor('#000000')).toBe('#ffffff')
    expect(getContrastColor('#ffffff')).toBe('#000000')
  })

  it('handles the vivid defaults sensibly', () => {
    expect(getContrastColor('#fdd835')).toBe('#000000') // yellow
    expect(getContrastColor('#3f51b5')).toBe('#ffffff') // indigo
    expect(getContrastColor('#795548')).toBe('#ffffff') // brown
  })

  it('falls back to dark content for an unparseable colour rather than throwing', () => {
    expect(getContrastColor('not-a-colour')).toBe('#000000')
  })
})

describe('getSwatchRing', () => {
  // The reported bug: white was invisible in light mode and black invisible in dark mode, because
  // an unselected swatch had no outline at all and was edgeless against a same-coloured surface.
  it('outlines an unselected swatch against the surface in both appearances', () => {
    expect(getSwatchRing('#ffffff', false, LIGHT_OUTLINE)).toEqual({ borderColor: LIGHT_OUTLINE, borderWidth: 1 })
    expect(getSwatchRing('#000000', false, DARK_OUTLINE)).toEqual({ borderColor: DARK_OUTLINE, borderWidth: 1 })
  })

  it('gives every swatch an outline, not just the problem ones', () => {
    for (const hex of ['#000000', '#ffffff', '#f44336', '#fdd835', '#607d8b']) {
      expect(getSwatchRing(hex, false, LIGHT_OUTLINE).borderWidth).toBeGreaterThan(0)
    }
  })

  // The second half of the bug: the selected ring and check mark were hardcoded white, so picking
  // white showed white-on-white and gave no feedback that anything was selected.
  it('marks the selected swatch against its own fill, so white and black both read', () => {
    expect(getSwatchRing('#ffffff', true, LIGHT_OUTLINE)).toEqual({ borderColor: '#000000', borderWidth: 3 })
    expect(getSwatchRing('#000000', true, DARK_OUTLINE)).toEqual({ borderColor: '#ffffff', borderWidth: 3 })
  })

  it('never resolves a selected ring to the swatch colour itself', () => {
    for (const hex of ['#000000', '#ffffff', '#f44336', '#fdd835', '#009688', '#607d8b']) {
      const { borderColor } = getSwatchRing(hex, true, LIGHT_OUTLINE)
      expect(borderColor.toLowerCase()).not.toBe(hex.toLowerCase())
    }
  })

  it('makes the selected ring thicker than the resting outline so selection is legible', () => {
    const resting = getSwatchRing('#f44336', false, LIGHT_OUTLINE)
    const selected = getSwatchRing('#f44336', true, LIGHT_OUTLINE)
    expect(selected.borderWidth).toBeGreaterThan(resting.borderWidth)
  })
})
