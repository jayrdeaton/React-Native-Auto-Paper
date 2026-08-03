import { act, renderHook } from '@testing-library/react'
import { Appearance } from 'react-native'
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper'

import { SEMANTIC_BASE_COLORS, ThemeAppearance, useComputedTheme } from '../useComputedTheme'

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
    const { result, rerender } = renderHook(
      ({ color }: { color: string }) => useComputedTheme('light', color),
      { initialProps: { color: '#ff0000' } }
    )
    expect(result.current?.colors.primary).toBe('#ff0000')
    act(() => { rerender({ color: '#0000ff' }) })
    expect(result.current?.colors.primary).toBe('#0000ff')
  })

  it('recomputes when appearance changes', () => {
    const { result, rerender } = renderHook(
      ({ appearance }: { appearance: ThemeAppearance }) => useComputedTheme(appearance, '#6750a4'),
      { initialProps: { appearance: 'light' as ThemeAppearance } }
    )
    expect(result.current?.dark).toBe(false)
    act(() => { rerender({ appearance: 'dark' }) })
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
      act(() => { rerender({ color: '#00ffee' }) })
      expect(result.current?.colors.success).toBe(before.success)
      expect(result.current?.colors.warning).toBe(before.warning)
      expect(result.current?.colors.danger).toBe(before.danger)
    })

    it('keeps danger distinct from MD3\'s own error role', () => {
      const { result } = renderHook(() => useComputedTheme('light', '#6750a4'))
      expect(result.current?.colors.danger).not.toBe(result.current?.colors.error)
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
})
