import { act, render } from '@testing-library/react'
import { TouchableOpacity, View } from 'react-native'
import { Icon, MD3LightTheme, TouchableRipple, useTheme } from 'react-native-paper'

import { defaultColors } from '../components/ColorPicker'
import { PalettePicker } from '../components/PalettePicker'
import { getContrastColor, getSwatchRing } from '../utils/getSwatchContrast'

// See ColorPicker.test.tsx for why Dialog is stubbed rather than rendered for real.
jest.mock('../components/Dialog', () => {
  const DialogMock = ({ visible, children }: { visible?: boolean; children?: React.ReactNode }) => (visible ? (children ?? null) : null)
  DialogMock.Content = ({ children }: { children?: React.ReactNode }) => children ?? null
  return { Dialog: DialogMock }
})

const mockTouchableRipple = TouchableRipple as jest.MockedFunction<typeof TouchableRipple>
const mockTouchableOpacity = TouchableOpacity as jest.MockedFunction<typeof TouchableOpacity>
const mockView = View as unknown as jest.Mock
const mockIcon = Icon as jest.MockedFunction<typeof Icon>
const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>

const OUTLINE = MD3LightTheme.colors.outlineVariant

beforeEach(() => {
  jest.clearAllMocks()
  mockUseTheme.mockReturnValue(MD3LightTheme as any)
})

const openDialog = () => {
  const { onPress } = mockTouchableRipple.mock.calls[0][0] as { onPress?: () => void }
  act(() => onPress?.())
}

// Only the trigger's and each swatch's ring View sets pointerEvents='none' (the Pie wedges never
// do), so this reliably isolates them from the many other Views Pie renders per swatch.
const ringViewStyles = () => mockView.mock.calls.filter(([props]) => (props as { pointerEvents?: string }).pointerEvents === 'none').map(([props]) => (props as { style: object[] }).style)

describe('PalettePicker', () => {
  it("rings the trigger's overlay icon with the resting ring against the theme outline", () => {
    render(<PalettePicker value="#ffffff" onChange={jest.fn()} />)

    const [triggerRing] = ringViewStyles()
    expect(triggerRing).toEqual(expect.arrayContaining([expect.objectContaining(getSwatchRing('#ffffff', false, OUTLINE))]))
  })

  it("picks the trigger icon's color for contrast against the seed color's own fill", () => {
    render(<PalettePicker value="#ffffff" onChange={jest.fn()} />)

    expect(mockIcon.mock.calls[0][0].color).toBe(getContrastColor('#ffffff'))
  })

  it('rings every swatch, thickest and contrast-colored on the selected one, resting-colored on the rest', () => {
    const selected = defaultColors[3].value
    render(<PalettePicker value={selected} onChange={jest.fn()} />)
    openDialog()

    // The trigger's own ring View was already mounted before the click, so the state update that
    // opens the dialog re-renders (not mounts) it a second time (two entries) before the 20
    // swatch rings, which mount for the first time in that same pass.
    const [, , ...swatchRings] = ringViewStyles()
    expect(swatchRings).toHaveLength(defaultColors.length)

    swatchRings.forEach((style, i) => {
      const hex = defaultColors[i].value
      expect(style).toEqual(expect.arrayContaining([expect.objectContaining(getSwatchRing(hex, hex === selected, OUTLINE))]))
    })
  })

  it('shows the check mark only on the selected swatch, colored for contrast against its own fill', () => {
    const selected = defaultColors[7].value
    render(<PalettePicker value={selected} onChange={jest.fn()} />)
    openDialog()

    const checkCalls = mockIcon.mock.calls.filter(([props]) => props.source === 'check')
    expect(checkCalls).toHaveLength(1)
    expect(checkCalls[0][0].color).toBe(getContrastColor(selected))
  })

  it('renders one swatch touch target per color, distinct from the ring overlay', () => {
    render(<PalettePicker value={defaultColors[0].value} onChange={jest.fn()} />)
    openDialog()

    expect(mockTouchableOpacity.mock.calls).toHaveLength(defaultColors.length)
  })
})
