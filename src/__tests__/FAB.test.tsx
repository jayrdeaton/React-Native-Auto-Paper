import { render } from '@testing-library/react'
import { FAB as PaperFAB } from 'react-native-paper'

import { FAB } from '../components/FAB'
import { PaperDefaultsContext } from '../PaperDefaultsContext'

const mockPaperFAB = PaperFAB as jest.MockedFunction<typeof PaperFAB>

beforeEach(() => jest.clearAllMocks())

describe('FAB', () => {
  it('passes props straight through with no Provider wrapping', () => {
    render(<FAB icon='plus' mode='flat' />)
    const call = mockPaperFAB.mock.calls[0][0]
    expect(call.icon).toBe('plus')
    expect(call.mode).toBe('flat')
  })

  it('merges defaults from PaperDefaultsContext', () => {
    render(
      <PaperDefaultsContext.Provider value={{ FAB: { mode: 'elevated' } }}>
        <FAB icon='plus' />
      </PaperDefaultsContext.Provider>
    )
    const call = mockPaperFAB.mock.calls[0][0]
    expect(call.mode).toBe('elevated')
  })

  it('explicit prop overrides the default of the same name', () => {
    render(
      <PaperDefaultsContext.Provider value={{ FAB: { mode: 'elevated' } }}>
        <FAB icon='plus' mode='flat' />
      </PaperDefaultsContext.Provider>
    )
    const call = mockPaperFAB.mock.calls[0][0]
    expect(call.mode).toBe('flat')
  })
})
