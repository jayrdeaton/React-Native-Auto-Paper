import { render } from '@testing-library/react'
import { SegmentedButtons } from 'react-native-paper'

import { AppearancePicker } from '../components/AppearancePicker'

const mockSegmentedButtons = SegmentedButtons as jest.MockedFunction<typeof SegmentedButtons>

beforeEach(() => {
  jest.clearAllMocks()
})

describe('AppearancePicker', () => {
  it('passes the current value through and maps onValueChange to onChange', () => {
    const onChange = jest.fn()
    render(<AppearancePicker value='dark' onChange={onChange} />)

    const call = mockSegmentedButtons.mock.calls[0][0]
    expect(call.value).toBe('dark')

    // AppearancePicker never sets multiSelect, so onValueChange is always the single-value
    // (value: string) => void overload, cast past the SegmentedButtonsProps union TS can't
    // narrow from a plain mock call.
    const onValueChange = call.onValueChange as (value: string) => void
    onValueChange('light')
    expect(onChange).toHaveBeenCalledWith('light')
  })

  it('shows a label per segment by default', () => {
    render(<AppearancePicker value='system' onChange={jest.fn()} />)

    const { buttons } = mockSegmentedButtons.mock.calls[0][0]
    expect(buttons.map((b) => b.label)).toEqual(['System', 'Light', 'Dark'])
  })

  it('hides the visual label but keeps accessibilityLabel when showLabels is false', () => {
    render(<AppearancePicker value='system' onChange={jest.fn()} showLabels={false} />)

    const { buttons } = mockSegmentedButtons.mock.calls[0][0]
    expect(buttons.map((b) => b.label)).toEqual([undefined, undefined, undefined])
    expect(buttons.map((b) => b.accessibilityLabel)).toEqual(['System', 'Light', 'Dark'])
  })

  it('uses monitor/white-balance-sunny/weather-night by default', () => {
    render(<AppearancePicker value='system' onChange={jest.fn()} />)

    const { buttons } = mockSegmentedButtons.mock.calls[0][0]
    expect(buttons.map((b) => b.icon)).toEqual(['monitor', 'white-balance-sunny', 'weather-night'])
  })

  it('overrides only the given icons, leaving the rest at their default', () => {
    render(<AppearancePicker value='system' onChange={jest.fn()} icons={{ system: 'theme-light-dark' }} />)

    const { buttons } = mockSegmentedButtons.mock.calls[0][0]
    expect(buttons.map((b) => b.icon)).toEqual(['theme-light-dark', 'white-balance-sunny', 'weather-night'])
  })
})
