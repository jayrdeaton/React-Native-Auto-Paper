import { act, render } from '@testing-library/react'
import { TouchableOpacity } from 'react-native'
import { Icon, MD3LightTheme, TouchableRipple, useTheme } from 'react-native-paper'

import { ColorPicker, defaultColors } from '../components/ColorPicker'
import { getContrastColor, getSwatchRing } from '../utils/getSwatchContrast'

// The real Dialog pulls in Animated/BackHandler/Portal/safe-area-context, none of which this
// suite needs: ColorPicker's own logic (what it hands to getSwatchRing/getContrastColor) is
// independent of how Dialog animates or positions itself, so a minimal stand-in that just gates
// `children` on `visible` is enough to exercise the swatch list.
jest.mock('../components/Dialog', () => {
  const DialogMock = ({ visible, children }: { visible?: boolean; children?: React.ReactNode }) => (visible ? (children ?? null) : null)
  DialogMock.Content = ({ children }: { children?: React.ReactNode }) => children ?? null
  return { Dialog: DialogMock }
})

const mockTouchableRipple = TouchableRipple as jest.MockedFunction<typeof TouchableRipple>
const mockTouchableOpacity = TouchableOpacity as jest.MockedFunction<typeof TouchableOpacity>
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

describe('ColorPicker', () => {
  it('rings the trigger with the resting (unselected) ring against the theme outline', () => {
    render(<ColorPicker value='#ffffff' onChange={jest.fn()} />)

    const { style } = mockTouchableRipple.mock.calls[0][0] as { style: object[] }
    expect(style).toEqual(expect.arrayContaining([expect.objectContaining(getSwatchRing('#ffffff', false, OUTLINE))]))
  })

  it("picks the trigger icon's color for contrast against the seed color's own fill", () => {
    render(<ColorPicker value='#ffffff' onChange={jest.fn()} />)

    expect(mockIcon.mock.calls[0][0].color).toBe(getContrastColor('#ffffff'))
    expect(mockIcon.mock.calls[0][0].color).not.toBe('white')
  })

  it('rings every swatch, thickest and contrast-colored on the selected one, resting-colored on the rest', () => {
    const selected = defaultColors[2].value
    render(<ColorPicker value={selected} onChange={jest.fn()} />)
    openDialog()

    const swatchStyles = mockTouchableOpacity.mock.calls.map(([props]) => (props as { style: object[] }).style)
    expect(swatchStyles).toHaveLength(defaultColors.length)

    swatchStyles.forEach((style, i) => {
      const hex = defaultColors[i].value
      expect(style).toEqual(expect.arrayContaining([expect.objectContaining(getSwatchRing(hex, hex === selected, OUTLINE))]))
    })
  })

  it('shows the check mark only on the selected swatch, colored for contrast against its own fill', () => {
    const selected = defaultColors[5].value
    render(<ColorPicker value={selected} onChange={jest.fn()} />)
    openDialog()

    const checkCalls = mockIcon.mock.calls.filter(([props]) => props.source === 'check')
    expect(checkCalls).toHaveLength(1)
    expect(checkCalls[0][0].color).toBe(getContrastColor(selected))
  })

  it('draws a 48pt trigger with a 20pt icon by default, with no extra touch area', () => {
    render(<ColorPicker value='#ffffff' onChange={jest.fn()} />)

    const { hitSlop, style } = mockTouchableRipple.mock.calls[0][0] as { hitSlop?: number; style: object[] }
    expect(style).toEqual(expect.arrayContaining([expect.objectContaining({ borderRadius: 24, height: 48, width: 48 })]))
    expect(mockIcon.mock.calls[0][0].size).toBe(20)
    expect(hitSlop).toBeUndefined()
  })

  it('draws a smaller trigger at `size`, still taking taps out to 44pt', () => {
    render(<ColorPicker value='#ffffff' onChange={jest.fn()} size={40} />)

    const { hitSlop, style } = mockTouchableRipple.mock.calls[0][0] as { hitSlop?: number; style: object[] }
    expect(style).toEqual(expect.arrayContaining([expect.objectContaining({ borderRadius: 20, height: 40, width: 40 })]))
    expect(mockIcon.mock.calls[0][0].size).toBe(17)
    expect(hitSlop).toBe(2)
  })

  it('names the trigger for screen readers, "Color" unless told otherwise', () => {
    render(<ColorPicker value='#ffffff' onChange={jest.fn()} />)
    render(<ColorPicker accessibilityLabel='Accent Color' value='#ffffff' onChange={jest.fn()} />)

    const [first, second] = mockTouchableRipple.mock.calls.map(([props]) => props as { accessibilityLabel?: string; accessibilityRole?: string })
    expect(first).toMatchObject({ accessibilityLabel: 'Color', accessibilityRole: 'button' })
    expect(second.accessibilityLabel).toBe('Accent Color')
  })

  it('names each swatch by its label and marks the selected one', () => {
    const selected = defaultColors[3]
    render(<ColorPicker value={selected.value} onChange={jest.fn()} />)
    openDialog()

    const swatches = mockTouchableOpacity.mock.calls.map(([props]) => props as { accessibilityLabel?: string; accessibilityState?: { selected?: boolean } })
    expect(swatches.map(({ accessibilityLabel }) => accessibilityLabel)).toEqual(defaultColors.map(({ label }) => label))
    expect(swatches.filter(({ accessibilityState }) => accessibilityState?.selected).map(({ accessibilityLabel }) => accessibilityLabel)).toEqual([selected.label])
  })

  it('never leaves a swatch edgeless: every ring has a positive borderWidth', () => {
    render(<ColorPicker value={defaultColors[0].value} onChange={jest.fn()} />)
    openDialog()

    for (const [props] of mockTouchableOpacity.mock.calls) {
      const ring = (props as { style: object[] }).style.find((s): s is { borderWidth: number } => typeof (s as { borderWidth?: number }).borderWidth === 'number')
      expect(ring?.borderWidth).toBeGreaterThan(0)
    }
  })
})
