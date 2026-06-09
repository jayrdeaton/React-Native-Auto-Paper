import { BlurView as ExpoBlurView, type BlurViewProps as ExpoBlurViewProps } from 'expo-blur'
import { type ReactNode, useContext } from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { useTheme } from 'react-native-paper'

import { ThemeSettingsContext } from '../ThemeSettingsContext'

const ELEVATION_OPACITY: Record<number, number> = { 0: 0, 1: 0.05, 2: 0.08, 3: 0.11, 4: 0.12, 5: 0.14 }

export type BlurViewProps = ExpoBlurViewProps & {
  blur?: boolean
  children?: ReactNode
  elevation?: 0 | 1 | 2 | 3 | 4 | 5
  style?: StyleProp<ViewStyle>
}

export const BlurView = ({ blur = true, children, elevation, style, ...props }: BlurViewProps) => {
  const { dark, colors } = useTheme()
  const { settings } = useContext(ThemeSettingsContext)
  const tintOpacity = elevation !== undefined ? ELEVATION_OPACITY[elevation] : 0
  const tint = tintOpacity > 0
    ? <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary, opacity: tintOpacity }]} />
    : null
  if (blur)
    return (
      <ExpoBlurView {...props} tint={dark ? 'dark' : 'light'} style={style}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface, opacity: settings.blurTint }]} />
        {tint}
        {children}
      </ExpoBlurView>
    )
  return <View style={[{ backgroundColor: colors.surface }, style]}>{tint}{children}</View>
}
