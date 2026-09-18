import { renderHook } from '@testing-library/react'

import type { ThemeBridgeProps } from '../useThemeBridgeProps'
import { useThemeBridgeProps } from '../useThemeBridgeProps'

describe('useThemeBridgeProps', () => {
  it('passes every field through unchanged, under its own ProviderProps name', () => {
    const onChange = jest.fn()
    const onReady = jest.fn()
    const props: ThemeBridgeProps = {
      initialValue: { appearance: 'dark' },
      onChange,
      onReady
    }

    const { result } = renderHook(() => useThemeBridgeProps(props))

    expect(result.current).toEqual(props)
  })

  it('is a safe no-op when every field is omitted', () => {
    const { result } = renderHook(() => useThemeBridgeProps({}))

    expect(result.current).toEqual({ initialValue: undefined, onChange: undefined, onReady: undefined })
  })

  it('returns a referentially stable object across re-renders when inputs are unchanged', () => {
    const onChange = jest.fn()
    const onReady = jest.fn()
    const props: ThemeBridgeProps = { initialValue: { appearance: 'light' }, onChange, onReady }

    const { result, rerender } = renderHook((p: ThemeBridgeProps) => useThemeBridgeProps(p), { initialProps: props })
    const first = result.current
    rerender(props)

    expect(result.current).toBe(first)
  })

  it('returns a new object once an input changes', () => {
    const onChange = jest.fn()
    const onReady = jest.fn()
    const { result, rerender } = renderHook((p: ThemeBridgeProps) => useThemeBridgeProps(p), {
      initialProps: { initialValue: { appearance: 'light' }, onChange, onReady } as ThemeBridgeProps
    })
    const first = result.current

    rerender({ initialValue: { appearance: 'dark' }, onChange, onReady })

    expect(result.current).not.toBe(first)
    expect(result.current.initialValue).toEqual({ appearance: 'dark' })
  })
})
