import { render } from '@testing-library/react'
import { Button as PaperButton } from 'react-native-paper'

import { Button } from '../components/Button'
import { PaperDefaultsContext } from '../PaperDefaultsContext'

const mockPaperButton = PaperButton as jest.MockedFunction<typeof PaperButton>

beforeEach(() => jest.clearAllMocks())

describe('Button', () => {
  it('passes props straight through with no Provider wrapping', () => {
    render(<Button mode='contained'>Save</Button>)
    const call = mockPaperButton.mock.calls[0][0]
    expect(call.mode).toBe('contained')
  })

  it('merges defaults from PaperDefaultsContext', () => {
    render(
      <PaperDefaultsContext.Provider value={{ Button: { mode: 'outlined' } }}>
        <Button>Save</Button>
      </PaperDefaultsContext.Provider>
    )
    const call = mockPaperButton.mock.calls[0][0]
    expect(call.mode).toBe('outlined')
  })

  it('explicit prop overrides the default of the same name', () => {
    render(
      <PaperDefaultsContext.Provider value={{ Button: { mode: 'outlined' } }}>
        <Button mode='contained'>Save</Button>
      </PaperDefaultsContext.Provider>
    )
    const call = mockPaperButton.mock.calls[0][0]
    expect(call.mode).toBe('contained')
  })
})
