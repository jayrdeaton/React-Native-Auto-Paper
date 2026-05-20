import { type ReactNode, useEffect, useRef } from 'react'
import { StatusBar, type StatusBarProps, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'

import { type ThemeAppearance, useComputedTheme } from './useComputedTheme'

export type ProviderProps = {
  appearance: ThemeAppearance
  color: string
  children: ReactNode
  onReady?: () => void
  statusBarProps?: StatusBarProps
  style?: StyleProp<ViewStyle>
}

export function Provider({ appearance, color, children, onReady, statusBarProps, style }: ProviderProps) {
  const theme = useComputedTheme(appearance, color)
  const called = useRef(false)

  useEffect(() => {
    if (theme && !called.current) {
      called.current = true
      onReady?.()
    }
  }, [theme, onReady])

  if (!theme) return null

  return (
    <PaperProvider theme={theme}>
      <StatusBar backgroundColor={theme.colors.background} barStyle={theme.dark ? 'light-content' : 'dark-content'} {...statusBarProps} />
      <View style={[styles.flex, { backgroundColor: theme.colors.background }, style]}>{children}</View>
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 }
})
