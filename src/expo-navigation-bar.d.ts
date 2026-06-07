declare module 'expo-navigation-bar' {
  export function setBackgroundColorAsync(color: string): Promise<void>
  export function setButtonStyleAsync(style: 'light' | 'dark'): Promise<void>
}
