import { act, render } from '@testing-library/react'
import { TouchableOpacity } from 'react-native'
import { Icon, MD3DarkTheme, MD3LightTheme, SegmentedButtons, TouchableRipple, useTheme } from 'react-native-paper'

import { AutoPalettePicker } from '../components/AutoPalettePicker'
import { defaultColors } from '../components/ColorPicker'
import { PalettePicker } from '../components/PalettePicker'
import { usePaletteTone } from '../ThemeProvider'
import { defaultThemeSettings, ThemeSettingsContext } from '../ThemeSettingsContext'
import { getChalkboardColor } from '../utils/getChalkboardColor'
import { getContrastColor } from '../utils/getSwatchContrast'

// See ColorPicker.test.tsx for why Dialog is stubbed rather than rendered for real.
jest.mock('../components/Dialog', () => {
  const DialogMock = ({ visible, children }: { visible?: boolean; children?: React.ReactNode }) => (visible ? (children ?? null) : null)
  DialogMock.Content = ({ children }: { children?: React.ReactNode }) => children ?? null
  return { Dialog: DialogMock }
})

// The Provider's paletteTone, normally read from its context; absent unless a test sets one.
jest.mock('../ThemeProvider', () => ({ ...jest.requireActual('../ThemeProvider'), usePaletteTone: jest.fn(() => undefined) }))
// The real PalettePicker, wrapped to read the props AutoPalettePicker hands it.
jest.mock('../components/PalettePicker', () => {
  const actual = jest.requireActual('../components/PalettePicker')
  return { ...actual, PalettePicker: jest.fn(actual.PalettePicker) }
})
const mockUsePaletteTone = usePaletteTone as jest.MockedFunction<typeof usePaletteTone>
const mockPalettePicker = PalettePicker as jest.MockedFunction<typeof PalettePicker>

const mockTouchableRipple = TouchableRipple as jest.MockedFunction<typeof TouchableRipple>
const mockTouchableOpacity = TouchableOpacity as jest.MockedFunction<typeof TouchableOpacity>
const mockSegmentedButtons = SegmentedButtons as jest.MockedFunction<typeof SegmentedButtons>
const mockIcon = Icon as jest.MockedFunction<typeof Icon>
const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>

beforeEach(() => {
  jest.clearAllMocks()
  mockUseTheme.mockReturnValue(MD3LightTheme as any)
})

const openDialog = () => {
  const { onPress } = mockTouchableRipple.mock.calls[0][0] as { onPress?: () => void }
  act(() => onPress?.())
}

const renderWithSettings = (color: (typeof defaultThemeSettings)['color'], set = jest.fn(), harmony: (typeof defaultThemeSettings)['harmony'] = defaultThemeSettings.harmony) =>
  render(
    <ThemeSettingsContext.Provider value={{ settings: { ...defaultThemeSettings, color, harmony }, set }}>
      <AutoPalettePicker />
    </ThemeSettingsContext.Provider>
  )

describe('AutoPalettePicker', () => {
  it("reads its seed color from the Provider's own ThemeSettings, not a prop", () => {
    const selected = defaultColors[3].value
    renderWithSettings(selected)
    openDialog()

    // Same "check mark only on the selected swatch" proof PalettePicker.test.tsx's own test
    // uses - this only lands on defaultColors[3] if the seed actually reached PalettePicker.
    const checkCalls = mockIcon.mock.calls.filter(([props]) => props.source === 'check')
    expect(checkCalls).toHaveLength(1)
    expect(checkCalls[0][0].color).toBe(getContrastColor(selected))
  })

  it('resolves a TriadicPalette color down to its own primary, same as resolveSeedColor', () => {
    const primary = defaultColors[5].value
    renderWithSettings({ primary, secondary: '#000000', tertiary: '#ffffff' })
    openDialog()

    // If the raw TriadicPalette object had leaked through unresolved instead of narrowing to
    // `.primary`, no swatch's hex would ever === that object, and no check mark would render at
    // all - this only passes because the narrowed string actually reached PalettePicker.
    const checkCalls = mockIcon.mock.calls.filter(([props]) => props.source === 'check')
    expect(checkCalls).toHaveLength(1)
    expect(checkCalls[0][0].color).toBe(getContrastColor(primary))
  })

  it('writes a picked swatch straight back into ThemeSettings via set(), with no onChange prop to wire up', () => {
    const set = jest.fn()
    renderWithSettings(defaultColors[0].value, set)
    openDialog()

    const target = defaultColors[2].value
    const { onPress } = mockTouchableOpacity.mock.calls[2][0] as { onPress?: () => void }
    act(() => onPress?.())

    expect(set).toHaveBeenCalledWith({ color: target })
  })

  it('shows the harmony row and writes a picked harmony straight back into ThemeSettings via set()', () => {
    const set = jest.fn()
    renderWithSettings(defaultColors[0].value, set, 'triadic')
    openDialog()

    const call = mockSegmentedButtons.mock.calls[0][0]
    expect(call.value).toBe('triadic')

    const onValueChange = call.onValueChange as (value: string) => void
    onValueChange('square')

    expect(set).toHaveBeenCalledWith({ harmony: 'square' })
  })

  describe("the Provider's paletteTone", () => {
    it('previews the swatches through it, in the current appearance', () => {
      mockUsePaletteTone.mockReturnValue(getChalkboardColor)
      mockUseTheme.mockReturnValue(MD3DarkTheme as any)
      renderWithSettings('#f44336')

      const { previewColor } = mockPalettePicker.mock.calls[0][0]
      expect(previewColor).toBeDefined()
      expect(previewColor!('#2196f3')).toBe(getChalkboardColor('#2196f3', true))
    })

    it('previews the raw palette when there is none', () => {
      mockUsePaletteTone.mockReturnValue(undefined)
      renderWithSettings('#f44336')

      expect(mockPalettePicker.mock.calls[0][0].previewColor).toBeUndefined()
    })
  })
})
