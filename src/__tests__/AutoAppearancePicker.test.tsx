import { render } from '@testing-library/react'
import { SegmentedButtons } from 'react-native-paper'

import { AutoAppearancePicker } from '../components/AutoAppearancePicker'
import { defaultThemeSettings, ThemeSettingsContext } from '../ThemeSettingsContext'

const mockSegmentedButtons = SegmentedButtons as jest.MockedFunction<typeof SegmentedButtons>

beforeEach(() => {
  jest.clearAllMocks()
})

const renderWithSettings = (appearance: (typeof defaultThemeSettings)['appearance'], set = jest.fn()) =>
  render(
    <ThemeSettingsContext.Provider value={{ settings: { ...defaultThemeSettings, appearance }, set }}>
      <AutoAppearancePicker />
    </ThemeSettingsContext.Provider>
  )

describe('AutoAppearancePicker', () => {
  it("reads its value from the Provider's own ThemeSettings, not a prop", () => {
    renderWithSettings('dark')

    expect(mockSegmentedButtons.mock.calls[0][0].value).toBe('dark')
  })

  it("writes changes straight back into ThemeSettings via set(), with no onChange prop to wire up", () => {
    const set = jest.fn()
    renderWithSettings('system', set)

    // Same single-value overload as AppearancePicker.test.tsx's own cast — AutoAppearancePicker
    // never sets multiSelect either.
    const onValueChange = mockSegmentedButtons.mock.calls[0][0].onValueChange as (value: string) => void
    onValueChange('light')

    expect(set).toHaveBeenCalledWith({ appearance: 'light' })
  })

  it('still forwards unrelated props (showLabels, icons) straight through to AppearancePicker', () => {
    render(
      <ThemeSettingsContext.Provider value={{ settings: { ...defaultThemeSettings, appearance: 'system' }, set: jest.fn() }}>
        <AutoAppearancePicker showLabels={false} icons={{ system: 'theme-light-dark' }} />
      </ThemeSettingsContext.Provider>
    )

    const { buttons } = mockSegmentedButtons.mock.calls[0][0]
    expect(buttons.map((b) => b.label)).toEqual([undefined, undefined, undefined])
    expect(buttons.map((b) => b.icon)).toEqual(['theme-light-dark', 'white-balance-sunny', 'weather-night'])
  })
})
