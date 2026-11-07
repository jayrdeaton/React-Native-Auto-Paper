import { useCallback } from 'react'
import { useTheme } from 'react-native-paper'

import { usePaletteTone } from '../ThemeProvider'
import { useThemeSettings } from '../useThemeSettings'
import { resolveSeedColor } from '../utils/resolveSeedColor'
import type { SeedColor } from './ColorPicker'
import { PalettePicker, type PaletteWeights } from './PalettePicker'

type Props = {
  weights?: PaletteWeights
  colors?: SeedColor[]
  blur?: boolean
}

// PalettePicker wired straight to the Provider's own ThemeSettings - both color AND harmony -
// for the common case where the palette being edited IS the whole app's own theme. Takes none of
// `value`/`onChange`/`harmony`/`onHarmonyChange` - reads/writes useThemeSettings() itself
// (resolveSeedColor narrows ThemeSettings.color's `string | TriadicPalette` down to the plain
// string PalettePicker's own `value` wants). Reach for the plain PalettePicker instead when it
// needs to be controlled by something other than the global theme. It also previews the swatches
// through the Provider's `paletteTone`, if there is one, in the current appearance, so they match
// the theme they'd produce.
export const AutoPalettePicker = (props: Props) => {
  const { settings, set } = useThemeSettings()
  const tone = usePaletteTone()
  const { dark } = useTheme()
  const toned = useCallback((color: string) => tone!(color, dark), [tone, dark])
  return <PalettePicker {...props} value={resolveSeedColor(settings.color)} onChange={(color) => set({ color })} harmony={settings.harmony} onHarmonyChange={(harmony) => set({ harmony })} previewColor={tone ? toned : undefined} />
}
