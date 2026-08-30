import { act, renderHook } from '@testing-library/react'

import { SWATCH_GRID_COLUMNS, SWATCH_GRID_GAP, useSwatchSize } from '../useSwatchGrid'

describe('useSwatchSize', () => {
  it('returns the fallback size before any layout event fires', () => {
    const { result } = renderHook(() => useSwatchSize(48))
    expect(result.current.size).toBe(48)
  })

  it('recomputes size from the reported layout width once onLayout fires', () => {
    const { result } = renderHook(() => useSwatchSize(48))

    act(() => {
      result.current.onLayout({ nativeEvent: { layout: { width: 300 } } } as any)
    })

    const expected = (300 - SWATCH_GRID_GAP * (SWATCH_GRID_COLUMNS - 1)) / SWATCH_GRID_COLUMNS
    expect(result.current.size).toBe(expected)
  })
})
