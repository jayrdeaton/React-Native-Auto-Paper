import { SegmentedButtons } from 'react-native-paper'

import type { ThemeAppearance } from '../useComputedTheme'

const APPEARANCES: { label: string; value: ThemeAppearance; icon: string }[] = [
  { label: 'System', value: 'system', icon: 'brightness-auto' },
  { label: 'Light', value: 'light', icon: 'white-balance-sunny' },
  { label: 'Dark', value: 'dark', icon: 'weather-night' }
]

type Props = {
  value: ThemeAppearance
  onChange: (appearance: ThemeAppearance) => void
}

export const AppearancePicker = ({ value, onChange }: Props) => <SegmentedButtons value={value} onValueChange={(v) => onChange(v as ThemeAppearance)} buttons={APPEARANCES.map((a) => ({ value: a.value, label: a.label, icon: a.icon }))} />
