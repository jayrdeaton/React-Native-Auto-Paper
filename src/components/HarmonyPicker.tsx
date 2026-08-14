import { SegmentedButtons } from 'react-native-paper'

import type { ColorHarmony } from '../utils/getTriadicPalette'

const HARMONIES: { label: string; value: ColorHarmony; icon: string }[] = [
  { label: 'Triadic', value: 'triadic', icon: 'triangle-outline' },
  { label: 'Split', value: 'split-complementary', icon: 'arrow-split-vertical' },
  { label: 'Analogous', value: 'analogous', icon: 'ray-end-arrow' },
  { label: 'Square', value: 'square', icon: 'square-outline' },
  { label: 'Complement', value: 'complementary', icon: 'circle-half-full' },
  { label: 'Dbl Split', value: 'double-split', icon: 'arrow-expand-horizontal' }
]

// Paper's own SegmentedButtonItem hardcodes `minWidth: 76` per segment (sized for a labeled text
// button), which 6 of never fit inside PalettePicker's own dialog card (capped at 400, and
// narrower still once its padding and safe-area margins are subtracted) — they just overflow past
// its `overflow: hidden` edge instead of shrinking. A fixed smaller guess (say 44) only moves the
// breakpoint rather than removing it — 6x44 still exceeds the card's content width on an ordinary
// ~360-375px phone. Zeroing the floor instead lets each segment's own `flex: 1` divide whatever
// width IS available with nothing left to enforce a minimum, so 6 of them mathematically can never
// exceed their container at any screen size — same "shrink to fit, never overflow" contract
// useSwatchGrid.ts's own SWATCH_GRID_COLUMNS already uses for the swatches below this row. Left
// untouched in labeled mode, where the wider floor is still doing its job of fitting the text.
const COMPACT_MIN_WIDTH = 0

type Props = {
  value: ColorHarmony
  onChange: (harmony: ColorHarmony) => void
  // Hides text labels, leaving just the icon per segment — mirrors AppearancePicker's own
  // showLabels, useful here since there are 6 segments to fit instead of 3.
  // accessibilityLabel is always set regardless, so screen readers still announce the full
  // harmony name either way.
  showLabels?: boolean
  // Per-segment fill, e.g. theme.colors.secondary/onSecondary for the checked segment and
  // secondaryContainer/onSecondaryContainer for the rest — matches Paper's own checked/
  // unchecked + container color vocabulary. Omit to fall back to Paper's default segmented-
  // button styling.
  checkedColor?: string
  uncheckedColor?: string
  checkedContainerColor?: string
  uncheckedContainerColor?: string
}

export const HarmonyPicker = ({ value, onChange, showLabels = true, checkedColor, uncheckedColor, checkedContainerColor, uncheckedContainerColor }: Props) => (
  <SegmentedButtons
    value={value}
    onValueChange={(v) => onChange(v as ColorHarmony)}
    buttons={HARMONIES.map((h) => {
      const checked = h.value === value
      const containerColor = checked ? checkedContainerColor : uncheckedContainerColor
      return {
        value: h.value,
        icon: h.icon,
        label: showLabels ? h.label : undefined,
        accessibilityLabel: h.label,
        checkedColor,
        uncheckedColor,
        style: [showLabels ? undefined : { minWidth: COMPACT_MIN_WIDTH }, containerColor ? { backgroundColor: containerColor } : undefined]
      }
    })}
  />
)
