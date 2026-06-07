# @rific/auto-paper

Adaptive theming for [`react-native-paper`](https://callstack.github.io/react-native-paper/). Give it one color and an appearance setting — it generates a triadic MD3 palette and handles light/dark/system mode automatically.

## Features

- Triadic color palette from a single seed color (primary → secondary → tertiary, 120° apart on the color wheel)
- System/light/dark appearance with live updates via `Appearance` API
- Tinted surface, surfaceVariant, outline, and elevation levels derived from the seed
- Optional Redux slice for wiring appearance and color into your store
- Wrapper components (`Appbar`, `BottomNavigation`, `Button`, `Chip`, `FAB`, `IconButton`, `TextInput`) with prop defaults via context
- All color utilities exported for standalone use

## Installation

```bash
npm install @rific/auto-paper
```

Peer dependencies:

```bash
npm install react-native react-native-paper
```

Optional — needed only if you use `BottomNavigation` on Android (syncs the system navigation bar color):

```bash
npm install expo-navigation-bar
```

## Usage

### Provider (simplest)

```tsx
import { Provider as AutoPaperProvider } from '@rific/auto-paper'

export default function App() {
  const [appearance, setAppearance] = useState<'system' | 'light' | 'dark'>('system')
  const [color, setColor] = useState('#6750a4')

  return (
    <AutoPaperProvider appearance={appearance} color={color}>
      {/* your app */}
    </AutoPaperProvider>
  )
}
```

`Provider` renders `null` on the first render while the theme computes, then wraps your app in `PaperProvider` with the computed theme, a matching `StatusBar`, and a background `View`. Use `onReady` to hook into that moment — e.g. to dismiss a splash screen:

```tsx
<AutoPaperProvider appearance={appearance} color={color} onReady={SplashScreen.hideAsync}>
  {/* your app */}
</AutoPaperProvider>
```

### With component defaults

Pass a `defaults` object to `Provider` to set prop defaults for any of the included wrapper components. Each component merges defaults under its own props, so per-instance props always win:

```tsx
import { Button, Chip, Provider as AutoPaperProvider } from '@rific/auto-paper'

<AutoPaperProvider
  appearance={appearance}
  color={color}
  defaults={{
    AppbarHeader: { elevated: true },
    BottomNavigation: { labeled: false },
    Button: { mode: 'contained' },
    Chip: { compact: true },
  }}
>
  <Button>Save</Button>       {/* mode="contained" from defaults */}
  <Button mode="text">Cancel</Button>  {/* overrides default */}
  <Chip>Tag</Chip>            {/* compact=true from defaults */}
</AutoPaperProvider>
```

Available wrapper components: `Appbar`, `BottomNavigation`, `Button`, `Chip`, `FAB`, `IconButton`, `TextInput`. Each is a thin wrapper around the matching `react-native-paper` component and accepts the same props.

### With Redux

The package exports an optional Redux slice. Use `createThemeReducer` to register it in your store with a custom initial color:

```ts
// store.ts
import { createThemeReducer, themeActions } from '@rific/auto-paper'

export const store = configureStore({
  reducer: {
    theme: createThemeReducer({ color: '#4caf50' }),
    // ...
  }
})
```

Then read from the store and pass into `Provider`:

```tsx
// App.tsx
import { useSelector } from 'react-redux'
import { Provider as AutoPaperProvider } from '@rific/auto-paper'

export default function App() {
  const { appearance, color } = useSelector((state: RootState) => state.theme)
  return (
    <AutoPaperProvider appearance={appearance} color={color} onReady={SplashScreen.hideAsync}>
      {/* your app */}
    </AutoPaperProvider>
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

### With `useComputedTheme`

Use the hook directly when you need to extend the theme before passing it to `PaperProvider` — for example, to merge in a navigation theme or add custom color keys:

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

## API

### `Provider`

| Prop | Type | Description |
|---|---|---|
| `appearance` | `'system' \| 'light' \| 'dark'` | Appearance mode |
| `color` | `string` | Seed color (hex, rgb, or CSS name) |
| `children` | `ReactNode` | |
| `defaults` | `PaperDefaults` | Prop defaults for wrapper components (see below) |
| `onReady` | `() => void` | Called once when the theme first resolves |
| `statusBarProps` | `StatusBarProps` | Spread over the auto-derived `StatusBar` defaults |
| `style` | `StyleProp<ViewStyle>` | Applied to the wrapper `View` |

### `useComputedTheme(appearance, color)`

Returns `MD3Theme | null`. `null` on the first render while the theme computes.

```ts
const theme = useComputedTheme('system', '#6750a4')
```

### `Appbar`

A thin wrapper around `react-native-paper`'s `Appbar` that automatically syncs `StatusBar` background color and bar style to the current theme surface color.

```tsx
import { Appbar } from '@rific/auto-paper'

<Appbar.Header>
  <Appbar.BackAction onPress={router.back} />
  <Appbar.Content title="Settings" />
  <Appbar.Action icon="magnify" onPress={onSearch} />
</Appbar.Header>
```

`Appbar.Content`, `Appbar.Action`, and `Appbar.BackAction` are re-exported directly from `react-native-paper`. Only `Appbar.Header` is wrapped — it applies `AppbarHeader` defaults from context and renders the synced `StatusBar`.

### `BottomNavigation`

A thin wrapper around `react-native-paper`'s `BottomNavigation` that automatically syncs the Android system navigation bar color and button style to the current theme surface color (requires `expo-navigation-bar`; silently no-ops when not installed).

```tsx
import { BottomNavigation } from '@rific/auto-paper'

<BottomNavigation
  navigationState={{ index, routes }}
  onIndexChange={setIndex}
  renderScene={BottomNavigation.SceneMap({ home: HomeScreen, settings: SettingsScreen })}
/>
```

`BottomNavigation.Bar` and `BottomNavigation.SceneMap` are also available and both sync the navigation bar.

### `PaperDefaults` / `usePaperDefaults`

`PaperDefaults` is the type for the `defaults` prop on `Provider`:

```ts
type PaperDefaults = {
  AppbarHeader?: Partial<AppbarHeaderProps>
  BottomNavigation?: Partial<BottomNavigationProps<BottomNavigationRoute>>
  Button?: Partial<ButtonProps>
  Chip?: Partial<ChipProps>
  FAB?: Partial<FABProps>
  IconButton?: Partial<IconButtonProps>
  TextInput?: Partial<TextInputProps>
}
```

Use `usePaperDefaults` if you need to read the defaults in a custom component:

```ts
import { usePaperDefaults } from '@rific/auto-paper'

const defaults = usePaperDefaults()
```

### `createThemeReducer(initialState?)`

Returns a Redux reducer with an optional initial state override. Useful for setting a custom default color without dispatching an action at startup.

```ts
createThemeReducer({ color: '#4caf50' })
```

### Redux exports

```ts
import { themeReducer, themeActions, selectThemeAppearance, selectThemeColor } from '@rific/auto-paper'
import type { ThemeState, ThemeAppearance } from '@rific/auto-paper'
```

| Action | Payload |
|---|---|
| `initialize` | `Partial<ThemeState>` |
| `setAppearance` | `ThemeAppearance` |
| `setColor` | `string` |

Selectors accept `ThemeState` directly — compose them with your root state selector:

```ts
const appearance = useSelector((state: RootState) => selectThemeAppearance(state.theme))
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

## License

MIT
