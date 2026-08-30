import { act, renderHook } from '@testing-library/react'
import { useContext } from 'react'

import { defaultThemeSettings, ThemeSettingsContext } from '../ThemeSettingsContext'

// No '../ThemeProvider''s <Provider> wraps this hook, so React falls through to
// createContext's own default value - the `set: () => {}` no-op this suite targets.
describe('ThemeSettingsContext default value', () => {
  it('supplies defaultThemeSettings when consumed without a wrapping Provider', () => {
    const { result } = renderHook(() => useContext(ThemeSettingsContext))
    expect(result.current.settings).toEqual(defaultThemeSettings)
  })

  it('the default no-op set() does not throw, and settings remain at defaultThemeSettings afterward', () => {
    const { result } = renderHook(() => useContext(ThemeSettingsContext))

    expect(() => {
      act(() => {
        result.current.set({ color: '#00ff00' })
      })
    }).not.toThrow()

    expect(result.current.settings).toEqual(defaultThemeSettings)
  })
})
