import { render } from '@testing-library/react'
import { createRef, type Ref } from 'react'
import { TextInput as RNTextInput } from 'react-native'
import { TextInput as PaperTextInput, type TextInputProps } from 'react-native-paper'

import { TextInput } from '../components/TextInput'
import { PaperDefaultsContext } from '../PaperDefaultsContext'

// The mocked PaperTextInput (src/__mocks__/react-native-paper.ts) is a real
// React.forwardRef component rather than a jest.fn(), so it can't be cast to
// jest.MockedFunction directly. Spying on its `.render` (the function passed
// to forwardRef) recovers the (props, ref) arguments it's actually invoked
// with, while still calling through to the mock's real ref-forwarding behavior.
type PaperTextInputRender = (props: TextInputProps, ref: Ref<RNTextInput>) => unknown

const paperTextInputRender = jest.spyOn(PaperTextInput as unknown as { render: PaperTextInputRender }, 'render')

beforeEach(() => jest.clearAllMocks())

describe('TextInput', () => {
  it('passes props straight through with no Provider wrapping', () => {
    render(<TextInput label='Name' />)
    const [props] = paperTextInputRender.mock.calls[0]
    expect(props.label).toBe('Name')
  })

  it('merges defaults from PaperDefaultsContext', () => {
    render(
      <PaperDefaultsContext.Provider value={{ TextInput: { mode: 'outlined' } }}>
        <TextInput label='Name' />
      </PaperDefaultsContext.Provider>
    )
    const [props] = paperTextInputRender.mock.calls[0]
    expect(props.mode).toBe('outlined')
  })

  it('explicit prop overrides the default of the same name', () => {
    render(
      <PaperDefaultsContext.Provider value={{ TextInput: { mode: 'outlined' } }}>
        <TextInput label='Name' mode='flat' />
      </PaperDefaultsContext.Provider>
    )
    const [props] = paperTextInputRender.mock.calls[0]
    expect(props.mode).toBe('flat')
  })

  it('forwards a matching ref to the mocked PaperTextInput as the second render argument', () => {
    const ref = createRef<RNTextInput>()
    render(<TextInput label='Name' ref={ref} />)
    const [, forwardedRef] = paperTextInputRender.mock.calls[0]
    expect(forwardedRef).toBe(ref)
    expect(ref.current).toEqual({})
  })
})
