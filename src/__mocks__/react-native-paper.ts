import React from 'react'

const makeElevation = (dark: boolean) => ({
  level0: 'transparent',
  level1: dark ? '#28232e' : '#f7f2fa',
  level2: dark ? '#2e2835' : '#f3edf7',
  level3: dark ? '#342e3b' : '#eee8f4',
  level4: dark ? '#362f3d' : '#ece6f0',
  level5: dark ? '#3a3241' : '#e9e3f0'
})

const makeTheme = (dark: boolean) => ({
  dark,
  version: 3,
  isV3: true,
  roundness: 4,
  animation: { scale: 1 },
  fonts: {},
  colors: {
    primary: dark ? '#d0bcff' : '#6750a4',
    onPrimary: dark ? '#381e72' : '#ffffff',
    primaryContainer: dark ? '#4f378b' : '#eaddff',
    onPrimaryContainer: dark ? '#eaddff' : '#21005d',
    secondary: dark ? '#ccc2dc' : '#625b71',
    onSecondary: dark ? '#332d41' : '#ffffff',
    secondaryContainer: dark ? '#4a4458' : '#e8def8',
    onSecondaryContainer: dark ? '#e8def8' : '#1d192b',
    tertiary: dark ? '#efb8c8' : '#7d5260',
    onTertiary: dark ? '#492532' : '#ffffff',
    tertiaryContainer: dark ? '#633b48' : '#ffd8e4',
    onTertiaryContainer: dark ? '#ffd8e4' : '#31111d',
    error: dark ? '#f2b8b5' : '#b3261e',
    onError: dark ? '#601410' : '#ffffff',
    errorContainer: dark ? '#8c1d18' : '#f9dedc',
    onErrorContainer: dark ? '#f9dedc' : '#410e0b',
    background: dark ? '#1c1b1f' : '#fffbfe',
    onBackground: dark ? '#e6e1e5' : '#1c1b1f',
    surface: dark ? '#1c1b1f' : '#fffbfe',
    onSurface: dark ? '#e6e1e5' : '#1c1b1f',
    surfaceVariant: dark ? '#49454f' : '#e7e0ec',
    onSurfaceVariant: dark ? '#cac4d0' : '#49454f',
    outline: dark ? '#938f99' : '#79747e',
    outlineVariant: dark ? '#49454f' : '#cac4d0',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: dark ? '#e6e1e5' : '#313033',
    inverseOnSurface: dark ? '#313033' : '#f4eff4',
    inversePrimary: dark ? '#6750a4' : '#d0bcff',
    surfaceDisabled: dark ? '#e6e1e526' : '#1c1b1f1f',
    onSurfaceDisabled: dark ? '#e6e1e561' : '#1c1b1f61',
    backdrop: dark ? '#332d4166' : '#332d4166',
    elevation: makeElevation(dark)
  }
})

export const MD3LightTheme = makeTheme(false)
export const MD3DarkTheme = makeTheme(true)

export const Chip = jest.fn(({ children }: { children?: React.ReactNode }) => children ?? null)

export const IconButton = jest.fn(() => null)

export const Provider = ({ children }: { children?: React.ReactNode }) => children ?? null

export const useTheme = jest.fn(() => MD3LightTheme)
