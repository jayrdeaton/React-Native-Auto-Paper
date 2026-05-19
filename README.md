# @rific/auto-paper

Adaptive theming for [`react-native-paper`](https://callstack.github.io/react-native-paper/). Give it one color and an appearance setting — it generates a triadic MD3 palette and handles light/dark/system mode automatically.

## Features

- Triadic color palette from a single seed color (primary → secondary → tertiary, 120° apart on the color wheel)
- System/light/dark appearance with live updates via `Appearance` API
- Tinted surface, surfaceVariant, outline, and elevation levels derived from the seed
- Optional Redux slice (`themeReducer`, `themeActions`, `selectThemeAppearance`, `selectThemeColor`) for wiring into your store
- All color utilities exported for standalone use

## Installation

```bash
npm install @rific/auto-paper
```

Peer dependencies:

```bash
npm install react-native react-native-paper
```

## Usage

### ThemeProvider (simplest)

```tsx
import { ThemeProvider } from '@rific/auto-paper'

export default function App() {
  const [appearance, setAppearance] = useState<'system' | 'light' | 'dark'>('system')
  const [color, setColor] = useState('#6750a4')

  return (
    <ThemeProvider appearance={appearance} color={color}>
      {/* your app */}
    </ThemeProvider>
  )
}
```

`ThemeProvider` renders `null` on the first render while the theme computes. If you use `expo-splash-screen`, gate `SplashScreen.hideAsync()` on the theme being ready in your own component.

### With React Navigation

Use the `useComputedTheme` hook directly to integrate with Navigation's `ThemeProvider`:

```tsx
import { useComputedTheme } from '@rific/auto-paper'
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native'
import { Provider as PaperProvider } from 'react-native-paper'

export default function App() {
  const theme = useComputedTheme('system', '#6750a4')
  if (!theme) return null

  const navTheme = {
    ...(theme.dark ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.dark ? DarkTheme : DefaultTheme).colors,
      background: theme.colors.background,
      card: theme.colors.background
    }
  }

  return (
    <NavThemeProvider value={navTheme}>
      <PaperProvider theme={theme}>
        {/* your app */}
      </PaperProvider>
    </NavThemeProvider>
  )
}
```

### With Redux

The package exports an optional Redux slice. Add it to your store and dispatch actions to update appearance or color from settings screens:

```ts
// store.ts
import { themeReducer } from '@rific/auto-paper'

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    // ...
  }
})
```

```tsx
// App.tsx
import { useSelector } from 'react-redux'
import { ThemeProvider, selectThemeAppearance, selectThemeColor } from '@rific/auto-paper'

export default function App() {
  const appearance = useSelector((state: RootState) => selectThemeAppearance(state.theme))
  const color = useSelector((state: RootState) => selectThemeColor(state.theme))
  return (
    <ThemeProvider appearance={appearance} color={color}>
      {/* your app */}
    </ThemeProvider>
  )
}
```

```tsx
// SettingsScreen.tsx
import { themeActions } from '@rific/auto-paper'
import { useDispatch } from 'react-redux'

dispatch(themeActions.setColor('#e91e63'))
dispatch(themeActions.setAppearance('dark'))
```

The slice's initial color is `#6750a4` (MD3 default purple). Override it at startup:

```ts
store.dispatch(themeActions.initialize({ color: myStoredColor }))
```

## API

### `ThemeProvider`

| Prop | Type | Default | Description |
|---|---|---|---|
| `appearance` | `'system' \| 'light' \| 'dark'` | — | Appearance mode |
| `color` | `string` | — | Seed color (hex, rgb, or CSS name) |
| `children` | `ReactNode` | — | |

### `useComputedTheme(appearance, color)`

Returns `MD3Theme | null`. `null` on the first render while the theme computes.

```ts
const theme = useComputedTheme('system', '#6750a4')
```

### Color utilities

```ts
import { getTriadicPalette, getBlendedColor, isDarkColor, getRgb, getHex } from '@rific/auto-paper'

getTriadicPalette('#ff0000')
// → { primary: '#ff0000', secondary: '#00ff00', tertiary: '#0000ff' }

getBlendedColor('#ff0000', '#0000ff', 0.5)  // → '#800080'
isDarkColor('#6750a4')                       // → true
getRgb('coral')                              // → { r: 255, g: 127, b: 80 }
getHex('rgb(255, 0, 0)')                     // → '#ff0000'
```

### Redux slice

```ts
import { themeReducer, themeActions, selectThemeAppearance, selectThemeColor, ThemeState, ThemeAppearance } from '@rific/auto-paper'
```

| Action | Payload |
|---|---|
| `initialize` | `Partial<ThemeState>` |
| `setAppearance` | `ThemeAppearance` |
| `setColor` | `string` |

| Selector | Returns |
|---|---|
| `selectThemeAppearance` | `ThemeAppearance` |
| `selectThemeColor` | `string` |

Selectors accept `ThemeState` directly — compose them with your root state selector:

```ts
const appearance = useSelector((state: RootState) => selectThemeAppearance(state.theme))
```

## License

MIT
