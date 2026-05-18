import * as SplashScreen from 'expo-splash-screen'
import { type ReactNode } from 'react'
import { StatusBar, StyleSheet, View } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'

import { type ThemeAppearance, useComputedTheme } from './useComputedTheme'

export type ThemeProviderProps = {
  appearance: ThemeAppearance
  color: string
  splashScreen?: boolean
  children: ReactNode
}

export function configureSplashScreen(options?: { duration?: number; fade?: boolean }): void {
  SplashScreen.preventAutoHideAsync()
  if (options) {
    SplashScreen.setOptions({
      duration: options.duration ?? 500,
      fade: options.fade ?? true
    })
  }
}

export function ThemeProvider({ appearance, color, splashScreen = true, children }: ThemeProviderProps) {
  const theme = useComputedTheme(appearance, color, { splashScreen })

  if (!theme) return null

  return (
    <PaperProvider theme={theme}>
      <StatusBar backgroundColor={theme.colors.background} barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      <View style={styles.flex}>{children}</View>
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 }
})
