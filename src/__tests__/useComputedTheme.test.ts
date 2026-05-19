import { act, renderHook } from '@testing-library/react'
import { Appearance } from 'react-native'

import { ThemeAppearance, useComputedTheme } from '../useComputedTheme'

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
})
