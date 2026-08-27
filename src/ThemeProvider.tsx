import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { StatusBar, type StatusBarProps, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'
import { configureFonts, Provider as PaperProvider } from 'react-native-paper'

import type { ExpoBlurModule } from './components/BlurView'
import type { ReanimatedModule } from './components/Dialog'
import type { ExpoNavigationBarModule } from './navigation-bar'
import { type PaperDefaults, PaperDefaultsContext } from './PaperDefaultsContext'
import { defaultThemeSettings, type ThemeSettings, ThemeSettingsContext } from './ThemeSettingsContext'
import { useComputedTheme } from './useComputedTheme'

// expo-navigation-bar/expo-blur are no longer auto-detected via require() - Metro doesn't
// rewrite a require()-in-try/catch call into its module graph inside an ESM (.mjs) build, so
// the module-level detection this package used to do silently broke as soon as consumers'
// bundlers resolved this package's ESM entry point. <Provider navigationBar={...} expoBlur={...}>
// receives the already-imported modules directly instead.
type NavBarContextType = { navigationBar?: ExpoNavigationBarModule; onNavBarChange?: (color: string, dark: boolean) => void }
const NavBarContext = createContext<NavBarContextType>({})
export const useNavBarContext = () => useContext(NavBarContext)

const BlurModuleContext = createContext<ExpoBlurModule | undefined>(undefined)
export const useBlurModule = () => useContext(BlurModuleContext)

const ReanimatedModuleContext = createContext<ReanimatedModule | undefined>(undefined)
export const useReanimatedModule = () => useContext(ReanimatedModuleContext)

export type ProviderProps = {
  children: ReactNode
  defaults?: PaperDefaults
  /** Injects expo-blur for `<BlurView>`. Pass `import * as ExpoBlur from 'expo-blur'`; omit to always render BlurView's solid fallback. */
  expoBlur?: ExpoBlurModule
  /** Applied to every Paper typography variant (bodyLarge, headlineMedium, labelSmall, ...) via
   * `configureFonts`'s flat-config mode — each variant keeps its own MD3 fontSize/lineHeight/weight,
   * only fontFamily changes. The one-line way to reskin an app's whole text to a custom typeface,
   * instead of passing `fontFamily` to every individual Text/TextInput/Button across the app. Omit
   * to keep each platform's system font (MD3's own default). */
  fontFamily?: string
  initialValue?: Partial<ThemeSettings>
  /** Injects expo-navigation-bar so the Android nav bar icon style auto-syncs with the theme. Pass `import * as ExpoNavigationBar from 'expo-navigation-bar'`; omit (and don't pass onNavBarChange) to skip nav bar syncing entirely. */
  navigationBar?: ExpoNavigationBarModule
  onChange?: (settings: ThemeSettings) => void
  onNavBarChange?: (color: string, dark: boolean) => void
  onReady?: () => void
  /** Injects react-native-reanimated so `<Dialog animatedStyle={...}>` (e.g. from `useAnimatedStyle()`) can animate its card on the UI thread. Pass `import Reanimated from 'react-native-reanimated'`; omit to keep Dialog's `animatedStyle` prop a no-op. */
  reanimated?: ReanimatedModule
  statusBarProps?: StatusBarProps
  style?: StyleProp<ViewStyle>
}

export function Provider({ children, defaults, expoBlur, fontFamily, initialValue, navigationBar, onChange, onNavBarChange, onReady, reanimated, statusBarProps, style }: ProviderProps) {
  const [settings, setSettings] = useState<ThemeSettings>(() => ({ ...defaultThemeSettings, ...initialValue }))

  const set = useCallback((patch: Partial<ThemeSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  })
  const prevSettings = useRef(settings)
  useEffect(() => {
    if (prevSettings.current !== settings) {
      prevSettings.current = settings
      onChangeRef.current?.(settings)
    }
  }, [settings])

  const computedTheme = useComputedTheme(settings.appearance, settings.color, settings.harmony)
  // Layered on top of useComputedTheme's own output rather than folded into it — that hook only
  // ever recomputes for a color/appearance/harmony change, and fontFamily is a completely
  // independent axis; merging it there would mean either re-running the whole color computation on
  // every fontFamily change (wasteful) or threading fontFamily through as a fourth computeTheme
  // dependency for a value it never actually uses.
  const theme = useMemo(() => {
    if (!computedTheme) return null
    if (!fontFamily) return computedTheme
    return { ...computedTheme, fonts: configureFonts({ config: { fontFamily } }) }
  }, [computedTheme, fontFamily])
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
          <NavBarContext.Provider value={{ navigationBar, onNavBarChange }}>
            <BlurModuleContext.Provider value={expoBlur}>
              <ReanimatedModuleContext.Provider value={reanimated}>
                <View style={[styles.flex, { backgroundColor: theme.colors.background }, style]}>{children}</View>
              </ReanimatedModuleContext.Provider>
            </BlurModuleContext.Provider>
          </NavBarContext.Provider>
        </PaperDefaultsContext.Provider>
      </PaperProvider>
    </ThemeSettingsContext.Provider>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 }
})
