import { act, render } from '@testing-library/react'
import { TouchableOpacity, View } from 'react-native'
import { Icon, MD3LightTheme, SegmentedButtons, TouchableRipple, useTheme } from 'react-native-paper'

import { defaultColors } from '../components/ColorPicker'
import { Dialog } from '../components/Dialog'
import { PalettePicker } from '../components/PalettePicker'
import { getChalkboardColor } from '../utils/getChalkboardColor'
import { getContrastColor, getSwatchRing } from '../utils/getSwatchContrast'
import { getTriadicPalette } from '../utils/getTriadicPalette'

// See ColorPicker.test.tsx for why Dialog is stubbed rather than rendered for real. Wrapped in
// jest.fn() (rather than the plain function component other suites stub it with) so this file can
// also inspect the props PalettePicker passes to Dialog, namely onDismiss below.
jest.mock('../components/Dialog', () => {
  const DialogMock = jest.fn(({ visible, children }: { visible?: boolean; children?: React.ReactNode }) => (visible ? (children ?? null) : null))
  const DialogContentMock = jest.fn(({ children }: { children?: React.ReactNode }) => children ?? null)
  return { Dialog: Object.assign(DialogMock, { Content: DialogContentMock }) }
})

const mockTouchableRipple = TouchableRipple as jest.MockedFunction<typeof TouchableRipple>
const mockTouchableOpacity = TouchableOpacity as jest.MockedFunction<typeof TouchableOpacity>
const mockView = View as unknown as jest.Mock
const mockIcon = Icon as jest.MockedFunction<typeof Icon>
const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>
const mockSegmentedButtons = SegmentedButtons as jest.MockedFunction<typeof SegmentedButtons>
const mockDialog = Dialog as jest.MockedFunction<typeof Dialog>

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
    render(<PalettePicker value='#ffffff' onChange={jest.fn()} />)

    const [triggerRing] = ringViewStyles()
    expect(triggerRing).toEqual(expect.arrayContaining([expect.objectContaining(getSwatchRing('#ffffff', false, OUTLINE))]))
  })

  it("picks the trigger icon's color for contrast against the seed color's own fill", () => {
    render(<PalettePicker value='#ffffff' onChange={jest.fn()} />)

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

  it('omits the harmony row entirely when onHarmonyChange is not passed', () => {
    render(<PalettePicker value={defaultColors[0].value} onChange={jest.fn()} />)
    openDialog()

    expect(mockSegmentedButtons.mock.calls).toHaveLength(0)
  })

  it('shows a compact, label-less harmony row wired to onHarmonyChange when it is passed', () => {
    const onHarmonyChange = jest.fn()
    render(<PalettePicker value={defaultColors[0].value} onChange={jest.fn()} harmony='triadic' onHarmonyChange={onHarmonyChange} />)
    openDialog()

    const call = mockSegmentedButtons.mock.calls[0][0]
    expect(call.value).toBe('triadic')
    expect((call.buttons as { label?: string }[]).every((b) => b.label === undefined)).toBe(true)

    const onValueChange = call.onValueChange as (value: string) => void
    onValueChange('square')
    expect(onHarmonyChange).toHaveBeenCalledWith('square')
  })

  it('closes the dialog by flipping visible back to false when Dialog fires onDismiss', () => {
    render(<PalettePicker value={defaultColors[0].value} onChange={jest.fn()} />)
    openDialog()

    const lastDialogProps = () => mockDialog.mock.calls[mockDialog.mock.calls.length - 1][0]
    expect(lastDialogProps().visible).toBe(true)

    act(() => lastDialogProps().onDismiss?.())

    expect(lastDialogProps().visible).toBe(false)
  })

  describe('previewColor', () => {
    const chalk = (color: string) => getChalkboardColor(color, true)
    // Every Pie wedge fill, in render order (each pie draws primary, tertiary, secondary).
    const wedgeFills = () =>
      mockView.mock.calls
        .map(([props]) => (props as { style?: unknown }).style)
        .flatMap((style) => (Array.isArray(style) ? style : [style]))
        .filter((style): style is { backgroundColor: string } => typeof (style as { backgroundColor?: unknown } | undefined)?.backgroundColor === 'string')
        .map((style) => style.backgroundColor)
    const pieOf = (hex: string, tone = chalk) => {
      const palette = getTriadicPalette(hex, 'triadic')
      return [tone(palette.primary), tone(palette.tertiary), tone(palette.secondary)]
    }

    it('draws the trigger and every swatch through it, each wedge toned after the harmony rotation', () => {
      render(<PalettePicker value='#f44336' onChange={jest.fn()} harmony='triadic' previewColor={chalk} />)
      expect(wedgeFills().slice(0, 3)).toEqual(pieOf('#f44336'))

      mockView.mockClear()
      openDialog()
      const fills = wedgeFills()
      defaultColors.forEach(({ value: hex }) => expect(fills).toEqual(expect.arrayContaining(pieOf(hex))))
    })

    it('rings and checks against the drawn color, while matching, selecting and reporting the raw seed', () => {
      const onChange = jest.fn()
      const selected = defaultColors[11].value
      render(<PalettePicker value={selected} onChange={onChange} harmony='triadic' previewColor={chalk} />)
      openDialog()

      const drawn = chalk(getTriadicPalette(selected, 'triadic').primary)
      const checks = mockIcon.mock.calls.filter(([props]) => props.source === 'check')
      expect(checks).toHaveLength(1)
      expect(checks[0][0].color).toBe(getContrastColor(drawn))
      const [, , ...swatchRings] = ringViewStyles()
      expect(swatchRings[11]).toEqual(expect.arrayContaining([expect.objectContaining(getSwatchRing(drawn, true, OUTLINE))]))

      const { onPress } = mockTouchableOpacity.mock.calls[4][0] as { onPress?: () => void }
      act(() => onPress?.())
      expect(onChange).toHaveBeenCalledWith(defaultColors[4].value)
    })

    it('draws the raw palette without it', () => {
      render(<PalettePicker value='#f44336' onChange={jest.fn()} harmony='triadic' />)
      expect(wedgeFills().slice(0, 3)).toEqual(pieOf('#f44336', (color) => color))
    })
  })
})
