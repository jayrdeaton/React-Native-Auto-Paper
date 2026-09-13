import { createSettingsContext, type SettingsContextValue } from '@rific/core'

import type { ThemeAppearance } from './useComputedTheme'
import type { ColorHarmony, TriadicPalette } from './utils/getTriadicPalette'

export type ThemeSettings = {
  appearance: ThemeAppearance
  blur: boolean
  blurTint: number
  color: string | TriadicPalette
  harmony: ColorHarmony
}

export const defaultThemeSettings: ThemeSettings = {
  appearance: 'system',
  blur: true,
  blurTint: 0.2,
  color: '#6750a4',
  harmony: 'split-complementary'
}

export type ThemeSettingsContextType = SettingsContextValue<ThemeSettings>

// Single createSettingsContext() call, shared by ThemeProvider.tsx and useThemeSettings.ts (each
// just re-exports the relevant piece under its original name) so there's exactly one Context
// instance backing all three files, same as before this migration.
const themeSettingsContext = createSettingsContext<ThemeSettings>(defaultThemeSettings)

export const ThemeSettingsContext = themeSettingsContext.Context
export const themeSettingsProvider = themeSettingsContext.Provider
export const useThemeSettingsInternal = themeSettingsContext.useSettings
