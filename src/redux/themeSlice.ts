import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { ThemeAppearance } from '../useComputedTheme'
import type { ColorHarmony } from '../utils/getTriadicPalette'

export type { ThemeAppearance }

export type ThemeState = {
  appearance: ThemeAppearance
  blur: boolean
  color: string
  harmony: ColorHarmony
}

const defaultInitialState: ThemeState = {
  appearance: 'system',
  blur: true,
  color: '#6750a4',
  harmony: 'split-complementary'
}

const reducers = {
  initialize: (state: ThemeState, action: PayloadAction<Partial<ThemeState>>) => ({ ...state, ...action.payload }),
  setAppearance: (state: ThemeState, action: PayloadAction<ThemeAppearance>) => ({ ...state, appearance: action.payload }),
  setBlur: (state: ThemeState, action: PayloadAction<boolean>) => ({ ...state, blur: action.payload }),
  setColor: (state: ThemeState, action: PayloadAction<string>) => ({ ...state, color: action.payload }),
  setHarmony: (state: ThemeState, action: PayloadAction<ColorHarmony>) => ({ ...state, harmony: action.payload })
}

export function createThemeReducer(initialState?: Partial<ThemeState>) {
  return createSlice({
    name: 'theme',
    initialState: { ...defaultInitialState, ...initialState },
    reducers
  }).reducer
}

const defaultSlice = createSlice({
  name: 'theme',
  initialState: defaultInitialState,
  reducers
})

export const themeActions = defaultSlice.actions
export const themeReducer = defaultSlice.reducer

export const selectThemeAppearance = (state: ThemeState) => state.appearance
export const selectThemeBlur = (state: ThemeState) => state.blur
export const selectThemeColor = (state: ThemeState) => state.color
export const selectThemeHarmony = (state: ThemeState) => state.harmony
