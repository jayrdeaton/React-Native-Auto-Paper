import { render } from '@testing-library/react'
import { SegmentedButtons } from 'react-native-paper'

import { HarmonyPicker } from '../components/HarmonyPicker'

const mockSegmentedButtons = SegmentedButtons as jest.MockedFunction<typeof SegmentedButtons>

const HARMONY_LABELS = ['Triadic', 'Split', 'Analogous', 'Square', 'Complement', 'Dbl Split']

beforeEach(() => {
  jest.clearAllMocks()
})

describe('HarmonyPicker', () => {
  it('shows a label per segment by default, with no compact min-width override', () => {
    render(<HarmonyPicker value='triadic' onChange={jest.fn()} />)

    const { buttons } = mockSegmentedButtons.mock.calls[0][0]
    expect(buttons.map((b) => b.label)).toEqual(HARMONY_LABELS)
    buttons.forEach((b) => {
      expect((b.style as object[])[0]).toBeUndefined()
    })
  })

  it('hides the visual label and applies the compact min-width override when showLabels is false', () => {
    render(<HarmonyPicker value='triadic' onChange={jest.fn()} showLabels={false} />)

    const { buttons } = mockSegmentedButtons.mock.calls[0][0]
    expect(buttons.map((b) => b.label)).toEqual(buttons.map(() => undefined))
    buttons.forEach((b) => {
      expect((b.style as object[])[0]).toEqual({ minWidth: 0 })
    })
  })

  it('keeps accessibilityLabel set to the harmony label regardless of showLabels', () => {
    render(<HarmonyPicker value='triadic' onChange={jest.fn()} showLabels={false} />)

    const { buttons } = mockSegmentedButtons.mock.calls[0][0]
    expect(buttons.map((b) => b.accessibilityLabel)).toEqual(HARMONY_LABELS)
  })

  it('passes checkedColor and uncheckedColor through onto every button unconditionally', () => {
    render(<HarmonyPicker value='triadic' onChange={jest.fn()} checkedColor='#111111' uncheckedColor='#222222' />)

    const { buttons } = mockSegmentedButtons.mock.calls[0][0]
    buttons.forEach((b) => {
      expect(b.checkedColor).toBe('#111111')
      expect(b.uncheckedColor).toBe('#222222')
    })
  })

  it('applies checkedContainerColor only to the selected button and uncheckedContainerColor to the rest', () => {
    render(<HarmonyPicker value='square' onChange={jest.fn()} checkedContainerColor='#0000ff' uncheckedContainerColor='#00ff00' />)

    const { buttons } = mockSegmentedButtons.mock.calls[0][0]
    buttons.forEach((b) => {
      const expectedColor = b.value === 'square' ? '#0000ff' : '#00ff00'
      expect((b.style as object[])[1]).toEqual({ backgroundColor: expectedColor })
    })
  })

  it('omits any backgroundColor style entry when no container colors are passed', () => {
    render(<HarmonyPicker value='square' onChange={jest.fn()} />)

    const { buttons } = mockSegmentedButtons.mock.calls[0][0]
    buttons.forEach((b) => {
      expect((b.style as object[])[1]).toBeUndefined()
    })
  })

  it('passes value through and maps onValueChange to onChange, casting back to ColorHarmony', () => {
    const onChange = jest.fn()
    render(<HarmonyPicker value='analogous' onChange={onChange} />)

    const call = mockSegmentedButtons.mock.calls[0][0]
    expect(call.value).toBe('analogous')

    const onValueChange = call.onValueChange as (value: string) => void
    onValueChange('double-split')
    expect(onChange).toHaveBeenCalledWith('double-split')
  })
})
