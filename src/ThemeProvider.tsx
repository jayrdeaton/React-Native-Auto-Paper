import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { StatusBar, type StatusBarProps, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'

import { type PaperDefaults, PaperDefaultsContext } from './PaperDefaultsContext'
import { defaultThemeSettings, type ThemeSettings, ThemeSettingsContext } from './ThemeSettingsContext'
import { useComputedTheme } from './useComputedTheme'

type NavBarContextType = { onNavBarChange?: (color: string, dark: boolean) => void }
const NavBarContext = createContext<NavBarContextType>({})
export const useNavBarContext = () => useContext(NavBarContext)

export type ProviderProps = {
  initialValue?: Partial<ThemeSettings>
  onChange?: (settings: ThemeSettings) => void
  children: ReactNode
  defaults?: PaperDefaults
  onNavBarChange?: (color: string, dark: boolean) => void
  onReady?: () => void
  statusBarProps?: StatusBarProps
  style?: StyleProp<ViewStyle>
}

export function Provider({ initialValue, onChange, children, defaults, onNavBarChange, onReady, statusBarProps, style }: ProviderProps) {
  const [settings, setSettings] = useState<ThemeSettings>(() => ({ ...defaultThemeSettings, ...initialValue }))

  const set = useCallback((patch: Partial<ThemeSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const prevSettings = useRef(settings)
  useEffect(() => {
    if (prevSettings.current !== settings) {
      prevSettings.current = settings
      onChangeRef.current?.(settings)
    }
  }, [settings])

  const theme = useComputedTheme(settings.appearance, settings.color, settings.harmony)
  const called = useRef(false)

  useEffect(() => {
    if (theme && !called.current) {
      called.current = true
      onReady?.()
    }
  }, [theme, onReady])

  if (!theme) return null

  return (
    <ThemeSettingsContext.Provider value={{ settings, set }}>
      <PaperProvider theme={theme}>
        <StatusBar backgroundColor={theme.colors.background} barStyle={theme.dark ? 'light-content' : 'dark-content'} {...statusBarProps} />
        <PaperDefaultsContext.Provider value={defaults ?? {}}>
          <NavBarContext.Provider value={{ onNavBarChange }}>
            <View style={[styles.flex, { backgroundColor: theme.colors.background }, style]}>{children}</View>
          </NavBarContext.Provider>
        </PaperDefaultsContext.Provider>
      </PaperProvider>
    </ThemeSettingsContext.Provider>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 }
})
