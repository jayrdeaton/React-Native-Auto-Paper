import { createSettingsSlice } from '@rific/core'

import { ThemeAppearance } from '../useComputedTheme'
import type { ColorHarmony, TriadicPalette } from '../utils/getTriadicPalette'

export type { ThemeAppearance }

export type ThemeState = {
  appearance: ThemeAppearance
  blur: boolean
  color: string | TriadicPalette
  harmony: ColorHarmony
}

const defaultInitialState: ThemeState = {
  appearance: 'system',
  blur: true,
  color: '#6750a4',
  harmony: 'split-complementary'
}

const themeSlice = createSettingsSlice('theme', {
  initialState: defaultInitialState,
  initializeMode: 'merge' as const,
  selectors: ['appearance', 'blur', 'color', 'harmony'] as const
})

export const themeActions = themeSlice.actions
export const themeReducer = themeSlice.reducer
export const createThemeReducer = themeSlice.createReducer

// This package's existing public selector names carry a `Theme` infix the factory's generic
// select${Field} naming doesn't produce - remapped explicitly rather than teaching the factory a
// one-off naming convention only this package wants.
export const selectThemeAppearance = themeSlice.selectors.selectAppearance
export const selectThemeBlur = themeSlice.selectors.selectBlur
export const selectThemeColor = themeSlice.selectors.selectColor
export const selectThemeHarmony = themeSlice.selectors.selectHarmony
