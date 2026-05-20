import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { ThemeAppearance } from '../useComputedTheme'

export type { ThemeAppearance }

export type ThemeState = {
  appearance: ThemeAppearance
  color: string
}

const defaultInitialState: ThemeState = {
  appearance: 'system',
  color: '#6750a4'
}

const reducers = {
  initialize: (state: ThemeState, action: PayloadAction<Partial<ThemeState>>) => ({ ...state, ...action.payload }),
  setAppearance: (state: ThemeState, action: PayloadAction<ThemeAppearance>) => ({ ...state, appearance: action.payload }),
  setColor: (state: ThemeState, action: PayloadAction<string>) => ({ ...state, color: action.payload })
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
export const selectThemeColor = (state: ThemeState) => state.color
