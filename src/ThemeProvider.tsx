import { type ReactNode, useEffect, useRef } from 'react'
import { StatusBar, type StatusBarProps, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'

import { type PaperDefaults, PaperDefaultsContext } from './PaperDefaultsContext'
import { type ThemeAppearance, useComputedTheme } from './useComputedTheme'

export type ProviderProps = {
  appearance: ThemeAppearance
  color: string
  children: ReactNode
  defaults?: PaperDefaults
  onReady?: () => void
  statusBarProps?: StatusBarProps
  style?: StyleProp<ViewStyle>
}

export function Provider({ appearance, color, children, defaults, onReady, statusBarProps, style }: ProviderProps) {
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
      <PaperDefaultsContext.Provider value={defaults ?? {}}>
        <View style={[styles.flex, { backgroundColor: theme.colors.background }, style]}>{children}</View>
      </PaperDefaultsContext.Provider>
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 }
})
