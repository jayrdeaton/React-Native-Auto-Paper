import { createContext } from 'react'

import type { ThemeAppearance } from './useComputedTheme'
import type { ColorHarmony } from './utils/getTriadicPalette'

export type ThemeSettings = {
  appearance: ThemeAppearance
  blur: boolean
  blurTint: number
  color: string
  harmony: ColorHarmony
}

export const defaultThemeSettings: ThemeSettings = {
  appearance: 'system',
  blur: true,
  blurTint: 0.5,
  color: '#6750a4',
  harmony: 'split-complementary'
}

export type ThemeSettingsContextType = {
  settings: ThemeSettings
  set: (patch: Partial<ThemeSettings>) => void
}

export const ThemeSettingsContext = createContext<ThemeSettingsContextType>({
  settings: defaultThemeSettings,
  set: () => {}
})
