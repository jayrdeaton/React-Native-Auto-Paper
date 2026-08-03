import { renderHook } from '@testing-library/react'
import { useTheme as usePaperTheme } from 'react-native-paper'

import { useAutoPaperTheme } from '../useTheme'

describe('useAutoPaperTheme', () => {
  it("delegates to react-native-paper's own useTheme", () => {
    const { result } = renderHook(() => useAutoPaperTheme())
    expect(result.current).toBe((usePaperTheme as jest.Mock).mock.results[0].value)
  })
})
