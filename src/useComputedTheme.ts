import { useCallback, useEffect, useState } from 'react'
import { Appearance } from 'react-native'
import { MD3DarkTheme, MD3LightTheme, MD3Theme } from 'react-native-paper'

import { getBlendedColor } from './utils/getBlendedColor'
import { getTonalColor } from './utils/getTonalColor'
import { type ColorHarmony, getTriadicPalette } from './utils/getTriadicPalette'
import { isDarkColor } from './utils/isDarkColor'

export type ThemeAppearance = 'system' | 'light' | 'dark'

export function useComputedTheme(appearance: ThemeAppearance, color: string, harmony: ColorHarmony = 'split-complementary'): MD3Theme | null {
  const [theme, setTheme] = useState<MD3Theme | null>(null)

  const computeTheme = useCallback(() => {
    let resolved: string | null | undefined = appearance
    if (resolved === 'system') resolved = Appearance.getColorScheme()
    if (resolved === 'no-preference' || !resolved) resolved = 'light'
    const base = resolved === 'dark' ? MD3DarkTheme : MD3LightTheme

    const _theme: MD3Theme = {
      ...base,
      colors: {
        ...base.colors,
        elevation: { ...base.colors.elevation }
      }
    }

    const palette = getTriadicPalette(color, harmony)
    const surface = base.colors.surface

    _theme.colors.primary = palette.primary
    _theme.colors.onPrimary = getTonalColor(palette.primary, isDarkColor(palette.primary) ? 0.95 : 0.08)
    _theme.colors.primaryContainer = getBlendedColor(palette.primary, surface, 0.15)
    _theme.colors.onPrimaryContainer = getTonalColor(palette.primary, isDarkColor(_theme.colors.primaryContainer) ? 0.92 : 0.12)

    _theme.colors.secondary = palette.secondary
    _theme.colors.onSecondary = getTonalColor(palette.secondary, isDarkColor(palette.secondary) ? 0.95 : 0.08)
    _theme.colors.secondaryContainer = getBlendedColor(palette.secondary, surface, 0.15)
    _theme.colors.onSecondaryContainer = getTonalColor(palette.secondary, isDarkColor(_theme.colors.secondaryContainer) ? 0.92 : 0.12)

    _theme.colors.tertiary = palette.tertiary
    _theme.colors.onTertiary = getTonalColor(palette.tertiary, isDarkColor(palette.tertiary) ? 0.95 : 0.08)
    _theme.colors.tertiaryContainer = getBlendedColor(palette.tertiary, surface, 0.15)
    _theme.colors.onTertiaryContainer = getTonalColor(palette.tertiary, isDarkColor(_theme.colors.tertiaryContainer) ? 0.92 : 0.12)

    const blended = getBlendedColor(color, palette.secondary, 0.5)
    const tintSurface = (alpha: number) => getBlendedColor(blended, surface, alpha)

    _theme.colors.background = base.dark ? '#0F0F0F' : '#F0F0F0'
    _theme.colors.surface = surface
    _theme.colors.surfaceVariant = tintSurface(0.2)
    _theme.colors.outline = getBlendedColor(color, base.colors.outline, 0.45)

    const grey = base.dark ? '#424242' : '#c2c2c2'
    const blendedGrey = getBlendedColor(blended, grey, 0.05)
    _theme.colors.elevation = {
      ..._theme.colors.elevation,
      level1: _theme.colors.surface,
      level2: getBlendedColor(blendedGrey, _theme.colors.surface, 0.25),
      level3: getBlendedColor(blendedGrey, _theme.colors.surface, 0.4),
      level4: getBlendedColor(blendedGrey, _theme.colors.surface, 0.55),
      level5: getBlendedColor(blendedGrey, _theme.colors.surface, 0.7)
    }

    setTheme(_theme)
  }, [appearance, color, harmony])

  useEffect(() => {
    computeTheme()
  }, [computeTheme])

  useEffect(() => {
    const subscription = Appearance.addChangeListener(computeTheme)
    return subscription.remove
  }, [computeTheme])

  return theme
}
