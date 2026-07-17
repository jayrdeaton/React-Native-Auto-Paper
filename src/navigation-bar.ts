export const navigationBar = (() => {
  try {
    return require('expo-navigation-bar') as typeof import('expo-navigation-bar')
  } catch {
    return null
  }
})()

/** Sets the Android navigation bar icon style (expo-navigation-bar >= 56, edge-to-edge API). */
export const setNavigationBarStyle = (dark: boolean) => {
  if (!navigationBar) return
  navigationBar.NavigationBar.setStyle(dark ? 'light' : 'dark')
}
