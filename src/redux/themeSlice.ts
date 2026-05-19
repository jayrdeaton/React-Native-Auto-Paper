import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { ThemeAppearance } from '../useComputedTheme'

export type { ThemeAppearance }

export type ThemeState = {
  appearance: ThemeAppearance
  color: string
}

const initialState: ThemeState = {
  appearance: 'system',
  color: '#6750a4'
}

const slice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    initialize: (state, action: PayloadAction<Partial<ThemeState>>) => ({ ...state, ...action.payload }),
    setAppearance: (state, action: PayloadAction<ThemeAppearance>) => ({ ...state, appearance: action.payload }),
    setColor: (state, action: PayloadAction<string>) => ({ ...state, color: action.payload })
  }
})

export const themeActions = slice.actions
export const themeReducer = slice.reducer

export const selectThemeAppearance = (state: ThemeState) => state.appearance
export const selectThemeColor = (state: ThemeState) => state.color
