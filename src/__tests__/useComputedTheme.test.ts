import { act, renderHook } from '@testing-library/react'
import { Appearance } from 'react-native'
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper'

import { SEMANTIC_BASE_COLORS, ThemeAppearance, useComputedTheme } from '../useComputedTheme'
import { getBlendedColor } from '../utils/getBlendedColor'
import { getChalkboardColor, type PaletteTone } from '../utils/getChalkboardColor'
import { getColorRoles } from '../utils/getColorRoles'
import { getTriadicPalette } from '../utils/getTriadicPalette'

const relativeLuminance = (hex: string): number => {
  const n = parseInt(hex.replace('#', ''), 16)
  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}
const contrastRatio = (hexA: string, hexB: string): number => {
  const [l1, l2] = [relativeLuminance(hexA), relativeLuminance(hexB)].sort((a, b) => b - a)
  return (l1 + 0.05) / (l2 + 0.05)
}

const mockAppearance = Appearance as jest.Mocked<typeof Appearance>

beforeEach(() => {
  jest.clearAllMocks()
  mockAppearance.getColorScheme.mockReturnValue('light')
  mockAppearance.addChangeListener.mockReturnValue({ remove: jest.fn() })
})

describe('useComputedTheme', () => {
  it('returns an MD3Theme after mount', () => {
    const { result } = renderHook(() => useComputedTheme('light', '#ff0000'))
    expect(result.current).not.toBeNull()
    expect(result.current?.colors.primary).toBeDefined()
  })

  it('sets primary to the provided color', () => {
    const { result } = renderHook(() => useComputedTheme('light', '#ff0000'))
    expect(result.current?.colors.primary).toBe('#ff0000')
  })

  it('uses dark theme when appearance is dark', () => {
    const { result } = renderHook(() => useComputedTheme('dark', '#6750a4'))
    expect(result.current?.dark).toBe(true)
  })

  it('uses light theme when appearance is light', () => {
    const { result } = renderHook(() => useComputedTheme('light', '#6750a4'))
    expect(result.current?.dark).toBe(false)
  })

  it('resolves system to light when getColorScheme returns light', () => {
    mockAppearance.getColorScheme.mockReturnValue('light')
    const { result } = renderHook(() => useComputedTheme('system', '#6750a4'))
    expect(result.current?.dark).toBe(false)
  })

  it('resolves system to dark when getColorScheme returns dark', () => {
    mockAppearance.getColorScheme.mockReturnValue('dark')
    const { result } = renderHook(() => useComputedTheme('system', '#6750a4'))
    expect(result.current?.dark).toBe(true)
  })

  it('resolves system to light when getColorScheme returns null (no OS preference set)', () => {
    mockAppearance.getColorScheme.mockReturnValue(null)
    const { result } = renderHook(() => useComputedTheme('system', '#6750a4'))
    expect(result.current?.dark).toBe(false)
  })

  it('subscribes to Appearance.addChangeListener on mount', () => {
    renderHook(() => useComputedTheme('system', '#6750a4'))
    expect(mockAppearance.addChangeListener).toHaveBeenCalled()
  })

  it('unsubscribes on unmount', () => {
    const removeFn = jest.fn()
    mockAppearance.addChangeListener.mockReturnValue({ remove: removeFn })
    const { unmount } = renderHook(() => useComputedTheme('system', '#6750a4'))
    unmount()
    expect(removeFn).toHaveBeenCalled()
  })

  it('recomputes when color changes', () => {
    const { result, rerender } = renderHook(({ color }: { color: string }) => useComputedTheme('light', color), { initialProps: { color: '#ff0000' } })
    expect(result.current?.colors.primary).toBe('#ff0000')
    act(() => {
      rerender({ color: '#0000ff' })
    })
    expect(result.current?.colors.primary).toBe('#0000ff')
  })

  it('recomputes when appearance changes', () => {
    const { result, rerender } = renderHook(({ appearance }: { appearance: ThemeAppearance }) => useComputedTheme(appearance, '#6750a4'), { initialProps: { appearance: 'light' as ThemeAppearance } })
    expect(result.current?.dark).toBe(false)
    act(() => {
      rerender({ appearance: 'dark' })
    })
    expect(result.current?.dark).toBe(true)
  })

  describe('semantic roles (success/warning/danger)', () => {
    it.each(['light', 'dark'] as const)('sets success/warning/danger to SEMANTIC_BASE_COLORS in %s mode', (appearance) => {
      const { result } = renderHook(() => useComputedTheme(appearance, '#6750a4'))
      expect(result.current?.colors.success).toBe(SEMANTIC_BASE_COLORS.success)
      expect(result.current?.colors.warning).toBe(SEMANTIC_BASE_COLORS.warning)
      expect(result.current?.colors.danger).toBe(SEMANTIC_BASE_COLORS.danger)
    })

    it.each(['light', 'dark'] as const)('keeps onSuccessContainer/onWarningContainer/onDangerContainer at WCAG AA contrast (>= 4.5:1) against their own container, in %s mode', (appearance) => {
      const { result } = renderHook(() => useComputedTheme(appearance, '#6750a4'))
      expect(contrastRatio(result.current!.colors.onSuccessContainer, result.current!.colors.successContainer)).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(result.current!.colors.onWarningContainer, result.current!.colors.warningContainer)).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(result.current!.colors.onDangerContainer, result.current!.colors.dangerContainer)).toBeGreaterThanOrEqual(4.5)
    })

    it("doesn't change success/warning/danger when the seed color changes (fixed, not seed-derived)", () => {
      const { result, rerender } = renderHook(({ color }: { color: string }) => useComputedTheme('light', color), { initialProps: { color: '#ff0000' } })
      const before = { success: result.current?.colors.success, warning: result.current?.colors.warning, danger: result.current?.colors.danger }
      act(() => {
        rerender({ color: '#00ffee' })
      })
      expect(result.current?.colors.success).toBe(before.success)
      expect(result.current?.colors.warning).toBe(before.warning)
      expect(result.current?.colors.danger).toBe(before.danger)
    })

    it("keeps danger distinct from MD3's own error role", () => {
      const { result } = renderHook(() => useComputedTheme('light', '#6750a4'))
      expect(result.current?.colors.danger).not.toBe(result.current?.colors.error)
    })
  })

  describe('explicit triad ({ primary, secondary, tertiary })', () => {
    const triad = { primary: '#ff0000', secondary: '#00ff00', tertiary: '#0000ff' }

    it('assigns each field to its matching role, unaltered by harmony math', () => {
      const { result } = renderHook(() => useComputedTheme('light', triad))
      expect(result.current?.colors.primary).toBe('#ff0000')
      expect(result.current?.colors.secondary).toBe('#00ff00')
      expect(result.current?.colors.tertiary).toBe('#0000ff')
    })

    it('ignores the harmony argument in explicit mode', () => {
      const { result } = renderHook(() => useComputedTheme('light', triad, 'triadic'))
      expect(result.current?.colors.primary).toBe('#ff0000')
      expect(result.current?.colors.secondary).toBe('#00ff00')
      expect(result.current?.colors.tertiary).toBe('#0000ff')
    })

    it('accepts named colors in each slot', () => {
      const { result } = renderHook(() => useComputedTheme('light', { primary: 'red', secondary: 'lime', tertiary: 'blue' }))
      expect(result.current?.colors.primary).toBe('#ff0000')
      expect(result.current?.colors.secondary).toBe('#00ff00')
      expect(result.current?.colors.tertiary).toBe('#0000ff')
    })

    it('throws on an invalid color in any slot', () => {
      expect(() => renderHook(() => useComputedTheme('light', { primary: 'notacolor', secondary: '#00ff00', tertiary: '#0000ff' }))).toThrow('Invalid color format')
      expect(() => renderHook(() => useComputedTheme('light', { primary: '#ff0000', secondary: 'notacolor', tertiary: '#0000ff' }))).toThrow('Invalid color format')
    })

    it('does not recompute when a structurally-identical object literal is passed on rerender', () => {
      const { result, rerender } = renderHook(({ color }: { color: typeof triad }) => useComputedTheme('light', color), { initialProps: { color: triad } })
      const before = result.current
      act(() => {
        rerender({ color: { primary: '#ff0000', secondary: '#00ff00', tertiary: '#0000ff' } })
      })
      expect(result.current).toBe(before)
    })

    it('recomputes when a field in the triad changes', () => {
      const { result, rerender } = renderHook(({ color }: { color: typeof triad }) => useComputedTheme('light', color), { initialProps: { color: triad } })
      act(() => {
        rerender({ color: { ...triad, secondary: '#ffff00' } })
      })
      expect(result.current?.colors.secondary).toBe('#ffff00')
    })
  })

  describe('error role', () => {
    it('leaves error/onError/errorContainer/onErrorContainer exactly as stock MD3LightTheme in light mode', () => {
      const { result } = renderHook(() => useComputedTheme('light', '#6750a4'))
      expect(result.current?.colors.error).toBe(MD3LightTheme.colors.error)
      expect(result.current?.colors.onError).toBe(MD3LightTheme.colors.onError)
      expect(result.current?.colors.errorContainer).toBe(MD3LightTheme.colors.errorContainer)
      expect(result.current?.colors.onErrorContainer).toBe(MD3LightTheme.colors.onErrorContainer)
    })

    it('leaves error/onError/errorContainer/onErrorContainer exactly as stock MD3DarkTheme in dark mode', () => {
      const { result } = renderHook(() => useComputedTheme('dark', '#6750a4'))
      expect(result.current?.colors.error).toBe(MD3DarkTheme.colors.error)
      expect(result.current?.colors.onError).toBe(MD3DarkTheme.colors.onError)
      expect(result.current?.colors.errorContainer).toBe(MD3DarkTheme.colors.errorContainer)
      expect(result.current?.colors.onErrorContainer).toBe(MD3DarkTheme.colors.onErrorContainer)
    })
  })

  describe('paletteTone', () => {
    const SURFACES = { light: 'rgba(255, 251, 254, 1)', dark: 'rgba(28, 27, 31, 1)' }

    it.each(['light', 'dark'] as const)('tones each palette member after the harmony rotation (%s), and derives every role from the toned palette', (mode) => {
      const { result } = renderHook(() => useComputedTheme(mode, '#f44336', 'split-complementary', getChalkboardColor))
      const raw = getTriadicPalette('#f44336', 'split-complementary')
      const dark = mode === 'dark'
      const toned = { primary: getChalkboardColor(raw.primary, dark), secondary: getChalkboardColor(raw.secondary, dark), tertiary: getChalkboardColor(raw.tertiary, dark) }
      const colors = result.current!.colors

      expect([colors.primary, colors.secondary, colors.tertiary]).toEqual([toned.primary, toned.secondary, toned.tertiary])
      // Toning the seed first and rotating that would give a different secondary.
      expect(colors.secondary).not.toBe(getTriadicPalette(getChalkboardColor('#f44336', dark), 'split-complementary').secondary)
      const roles = getColorRoles(toned.primary, SURFACES[mode])
      expect([colors.onPrimary, colors.primaryContainer, colors.onPrimaryContainer]).toEqual([roles.onColor, roles.container, roles.onContainer])
      expect(colors.outline).toBe(getBlendedColor(toned.primary, (dark ? MD3DarkTheme : MD3LightTheme).colors.outline, 0.45))
      expect(colors.surfaceVariant).toBe(getBlendedColor(getBlendedColor(toned.primary, toned.secondary, 0.5), SURFACES[mode], 0.2))
    })

    it.each(['light', 'dark'] as const)('leaves the signal colors exactly as they are without a tone (%s)', (mode) => {
      const untoned = renderHook(() => useComputedTheme(mode, '#f44336')).result.current!.colors
      const toned = renderHook(() => useComputedTheme(mode, '#f44336', 'split-complementary', getChalkboardColor)).result.current!.colors
      const signals = ['success', 'onSuccess', 'successContainer', 'onSuccessContainer', 'warning', 'onWarning', 'warningContainer', 'onWarningContainer', 'danger', 'onDanger', 'dangerContainer', 'onDangerContainer', 'error', 'onError', 'errorContainer', 'onErrorContainer', 'surface', 'background', 'onSurface'] as const

      for (const key of signals) expect([key, toned[key]]).toEqual([key, untoned[key]])
      expect(toned.primary).not.toBe(untoned.primary)
    })

    // The picker's 20 swatches: marker stays below half luminance, so its fills keep light text like
    // every other app's; chalk's luminance floor puts its pastels above it, so they take dark text.
    it.each(['#f44336', '#ff5722', '#ff6d00', '#ff9800', '#fdd835', '#8bc34a', '#4caf50', '#009688', '#00bcd4', '#03a9f4', '#2196f3', '#3f51b5', '#673ab7', '#9c27b0', '#d500f9', '#ec407a', '#e91e63', '#795548', '#8d7b68', '#607d8b'])('gives %s light text on its marker primary and dark text on its chalk primary, both readable', (seed) => {
      const light = renderHook(() => useComputedTheme('light', seed, 'split-complementary', getChalkboardColor)).result.current!.colors
      const dark = renderHook(() => useComputedTheme('dark', seed, 'split-complementary', getChalkboardColor)).result.current!.colors

      expect(relativeLuminance(light.onPrimary)).toBeGreaterThan(relativeLuminance(light.primary))
      expect(contrastRatio(light.onPrimary, light.primary)).toBeGreaterThanOrEqual(3.3)
      expect(relativeLuminance(dark.onPrimary)).toBeLessThan(relativeLuminance(dark.primary))
      expect(contrastRatio(dark.onPrimary, dark.primary)).toBeGreaterThanOrEqual(7)
    })

    it('tells the tone which appearance it is toning for', () => {
      const tone = jest.fn<string, Parameters<PaletteTone>>((color) => color)
      renderHook(() => useComputedTheme('dark', '#f44336', 'triadic', tone))

      expect(tone).toHaveBeenCalledTimes(3)
      expect(tone.mock.calls.every(([, dark]) => dark)).toBe(true)
    })

    it('tones an explicit triad too', () => {
      const { result } = renderHook(() => useComputedTheme('light', { primary: '#ffeb3b', secondary: '#03a9f4', tertiary: '#e91e63' }, undefined, getChalkboardColor))

      expect(result.current!.colors.primary).toBe(getChalkboardColor('#ffeb3b', false))
      expect(result.current!.colors.tertiary).toBe(getChalkboardColor('#e91e63', false))
    })

    it('recomputes when the tone changes, and goes back to the untoned palette without one', () => {
      const { result, rerender } = renderHook(({ tone }: { tone?: PaletteTone }) => useComputedTheme('light', '#f44336', 'split-complementary', tone), { initialProps: { tone: getChalkboardColor as PaletteTone | undefined } })
      expect(result.current!.colors.primary).toBe(getChalkboardColor('#f44336', false))

      rerender({ tone: undefined })
      expect(result.current!.colors.primary).toBe('#f44336')
    })
  })
})
