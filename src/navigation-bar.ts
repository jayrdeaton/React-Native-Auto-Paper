// Minimal local shape of expo-navigation-bar covering only the members used below —
// avoids forcing TypeScript to resolve the optional peer's real types for consumers
// who never installed it.
interface ExpoNavigationBarModule {
  NavigationBar: {
    setStyle: (style: 'light' | 'dark') => void
  }
}

export const navigationBar = (() => {
  try {
    return require('expo-navigation-bar') as ExpoNavigationBarModule
  } catch {
    return null
  }
})()

/** Sets the Android navigation bar icon style (expo-navigation-bar >= 56, edge-to-edge API). */
export const setNavigationBarStyle = (dark: boolean) => {
  if (!navigationBar) return
  navigationBar.NavigationBar.setStyle(dark ? 'light' : 'dark')
}
