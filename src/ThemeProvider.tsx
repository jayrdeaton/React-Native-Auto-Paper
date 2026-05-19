import { type ReactNode } from 'react'
import { StatusBar, StyleSheet, View } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'

import { type ThemeAppearance, useComputedTheme } from './useComputedTheme'

export type ThemeProviderProps = {
  appearance: ThemeAppearance
  color: string
  children: ReactNode
}

export function ThemeProvider({ appearance, color, children }: ThemeProviderProps) {
  const theme = useComputedTheme(appearance, color)

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
