import { useThemeSettings } from '../useThemeSettings'
import { type AppearanceIcons, AppearancePicker } from './AppearancePicker'

type Props = {
  showLabels?: boolean
  icons?: AppearanceIcons
}

// AppearancePicker wired straight to the Provider's own ThemeSettings, for the common case where
// the appearance being edited IS the whole app's own theme. Takes neither `value` nor `onChange`
// — reads/writes useThemeSettings() itself, so there's nothing for a consumer to wire up. Reach
// for the plain AppearancePicker instead when it needs to be controlled by something other than
// the global theme (a local preview before committing, one-off UI unrelated to Provider).
export const AutoAppearancePicker = (props: Props) => {
  const { settings, set } = useThemeSettings()
  return <AppearancePicker {...props} value={settings.appearance} onChange={(appearance) => set({ appearance })} />
}
