# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

# @rific/auto-paper

Standalone npm package that provides adaptive theming for `react-native-paper`. Give it one seed color and an appearance setting; it generates a triadic MD3 palette and handles light/dark/system mode automatically, with no `@react-navigation/native` dependency.

Part of the `@rific` package ecosystem. Published at https://www.npmjs.com/package/@rific/auto-paper.

## Commands

```bash
npm run build       # tsup, outputs CJS + ESM + types to dist/
npm run check       # TypeScript type check (tsc --noEmit)
npm test            # Jest (305 tests)
npm run test:watch  # Jest in watch mode
npm run build       # Full build via tsup
```

## Release

Tag-based, using npm trusted publishing (OIDC, no token required):

```bash
npm version patch   # or minor / major
git push --follow-tags
```

The `publish.yml` workflow fires on `v*` tags and runs `npm publish`.

## Architecture

```
src/
  index.ts                  - all public exports
  ThemeProvider.tsx         - Provider: PaperProvider + StatusBar + flex View wrapper
  ThemeSettingsContext.ts   - context holding current ThemeSettings + setter
  useThemeSettings.ts       - hook to read/update ThemeSettings from anywhere in the tree
  useComputedTheme.ts       - core hook: appearance resolution, triadic palette, elevation
  useTheme.ts               - useAutoPaperTheme(): typed wrapper around react-native-paper's own useTheme(), extended with AutoPaperTheme's extra color roles (success/warning etc)
  useSwatchGrid.ts          - SWATCH_GRID_COLUMNS/SWATCH_GRID_GAP constants for the picker components' fixed-column swatch grid layout
  useThemeBridgeProps.ts    - useThemeBridgeProps(): reshapes a consuming app's own Redux-sourced theme state/callbacks into the exact initialValue/onChange/onReady subset of ProviderProps, memoized (see Design Notes)
  BlurContext.tsx           - useBlur hook: resolves effective blur setting from context/override
  PaperDefaultsContext.tsx  - PaperDefaults type + usePaperDefaults hook for component prop defaults
  navigation-bar.ts         - optional expo-navigation-bar require + setNavigationBarStyle helper
  components/
    Appbar.tsx              - wraps Appbar.Header; syncs StatusBar to theme surface color
    AppearancePicker.tsx    - SegmentedButtons for system/light/dark appearance
    AutoAppearancePicker.tsx - AppearancePicker wired straight to useThemeSettings(); no value/onChange
    AutoPalettePicker.tsx   - PalettePicker wired straight to useThemeSettings(); no value/onChange/harmony/onHarmonyChange
    BlurView.tsx            - wraps expo-blur's BlurView with a solid-color fallback when absent
    BottomNavigation.tsx    - wraps BottomNavigation; syncs Android nav bar icon style
    Button.tsx              - thin wrapper applying PaperDefaults
    Chip.tsx                - adds `variant` prop for theme-derived container colors
    ColorPicker.tsx         - seed color swatch picker
    Dialog.tsx              - wraps Paper Dialog with blur-aware surface
    FAB.tsx                 - thin wrapper applying PaperDefaults
    HarmonyPicker.tsx       - picker for the six ColorHarmony modes
    IconButton.tsx          - adds `variant` prop for theme-derived container/icon colors
    Menu.tsx                - wraps Paper Menu with blur-aware surface
    PalettePicker.tsx       - like ColorPicker, but each swatch (and the trigger) renders a 3-wedge pie previewing the full triadic palette instead of a flat swatch
    TextInput.tsx           - thin wrapper applying PaperDefaults
  utils/
    colorNames.ts           - CSS named color to hex map
    getRgb.ts               - parses hex / rgb / rgba / named colors into { r, g, b, a? }
    getHex.ts                - converts any color format to hex string
    getBlendedColor.ts      - alpha-blend two colors
    getColorRoles.ts        - derives the MD3 color/onColor/container/onContainer role quadruple from a base color + surface
    getSwatchContrast.ts    - getContrastColor (checkmark/icon color) + getSwatchRing (outline styling, normal vs selected) for a color swatch
    getTonalColor.ts        - clamps a color's lightness to a target, preserving hue/saturation
    getTintTextColor.ts     - contrast-safe text color for content on a BlurView tint
    getTriadicPalette.ts    - generates primary/secondary/tertiary across 6 harmony modes
    getThirdColor.ts        - derives a third color maximally distinct in hue from two arbitrary inputs
    isDarkColor.ts          - WCAG relative luminance check
  redux/
    themeSlice.ts           - optional Redux slice: initialize / setAppearance / setColor / setBlur / setHarmony
```

## Public API

- `Provider` (exported as `ThemeProvider`/`AutoPaperProvider` in docs): wraps `PaperProvider`, accepts `initialValue`, `defaults`, `onChange`, `onNavBarChange`, `onReady`, `statusBarProps`, `style`
- `useReanimatedModule()`: resolves the injected `reanimated` module (or `undefined`); `Dialog`'s `animatedStyle` prop only animates on the UI thread when this is present, otherwise it's ignored
- `useComputedTheme(appearance, color, harmony?)`: `color` is a seed string (expanded via `harmony`) or an explicit `{ primary, secondary, tertiary }` triad (harmony ignored); returns `MD3Theme | null`
- `useAutoPaperTheme()`: typed wrapper around react-native-paper's own `useTheme()`, extended with `AutoPaperTheme`'s extra color roles
- `useThemeSettings()`: read/update the current `ThemeSettings` from inside `Provider`
- `useThemeBridgeProps({ initialValue, onChange, onReady })` / `ThemeBridgeProps` type: reshapes an app's own already-resolved Redux state/dispatch results into the exact `Pick<ProviderProps, 'initialValue' | 'onChange' | 'onReady'>` shape, memoized on those three fields, ready to spread onto `Provider` (`<Provider {...bridgeProps}>`) — see Design Notes for what this hook does and does not replace
- `usePaperDefaults()`: read component prop defaults from context
- `useBlur(override?)`: resolve the effective blur setting
- Wrapper components: `Appbar`, `AppearancePicker`, `AutoAppearancePicker`, `AutoPalettePicker`, `BlurView`, `BottomNavigation`, `Button`, `Chip`, `ColorPicker`, `Dialog`, `FAB`, `HarmonyPicker`, `IconButton`, `Menu`, `PalettePicker`, `TextInput`
- `themeReducer` / `themeActions` / `createThemeReducer` / selectors / `ThemeState`: optional Redux integration
- `getColorRoles(base, surface, containerAlpha?)` / `ColorRoles` type: MD3 color/onColor/container/onContainer role quadruple
- Color utils: `getTriadicPalette`, `getThirdColor`, `getBlendedColor`, `getTonalColor`, `getTintTextColor`, `getContrastColor`, `isDarkColor`, `getRgb`, `getHex`

## Design Notes

**2026-10-03 — `Provider` renders its own nested `Portal.Host` (released in 0.12.2).** Found by the Expo-Starter review: the auto-paper demo's Dialog said "Blur On" but rendered a solid surface. `PaperProvider` wraps its subtree in a `PortalHost`, and that host's `PortalManager` renders every `<Portal>`'s content as a sibling of the host's own children, so portal content only sees contexts provided *above* the host; Paper's `Portal` re-provides only its own theme and settings. `ThemeProviderBody` provides `PaperDefaultsContext`, `NavBarContext`, `BlurModuleContext` and `ReanimatedModuleContext` *inside* `PaperProvider`, so everything portaled under `Provider` lost all four. `Dialog` (which portals its own surface) and Paper's `Menu` (which portals its children) never saw the injected `expoBlur` and always rendered `BlurView`'s solid fallback, and `usePaperDefaults()` returned `{}` inside any portal.

- **Fix: a `<Portal.Host>` nested inside all four contexts, wrapping the styled children `View`.** Every `Portal` resolves the *nearest* host through `PortalContext`, so this host now catches all of them and their content mounts inside every auto-paper context. Paper's outer host stays permanently empty (only `StatusBar`, which renders null, sits between the two). It wraps the styled `View` rather than sitting inside it, so a consumer's `style` (padding, margin, transform, `overflow: 'hidden'`) can never inset or clip a Dialog backdrop or Menu layer. Checked against Paper 5.15.3's source: the portal layer keeps the same origin and size as before (so `Menu`/`Tooltip`'s `measureInWindow`-based positioning is unchanged), stacking order is unchanged, and the host never remounts after the theme first resolves.
- **Contexts an app provides *inside* `Provider` are still invisible to portal content** (Expo-Starter's `ToastProvider`, for one). That's inherent to Paper's portal design, not something this package can fix from above; the README tells apps to render another `<Portal.Host>` below such providers if they need them inside dialogs.
- **Android: `BlurView` now falls back to its solid look unless expo-blur would really blur (same day, at the author's direction).** Getting `expoBlur` into portaled surfaces exposed what every `BlurView` already did on Android: expo-blur there only blurs with both a `blurTarget` and a non-`'none'` `blurMethod` (`'dimezisBlurView'`, or `'dimezisBlurViewSdk31Plus'` on API 31+; `blurMethod` defaults to `'none'`, see `ExpoBlurView.kt`'s `safeMethod`). Without them it paints its tint at roughly 0.35–0.39 alpha, plus `BlurView`'s own surface overlay at `blurTint` (default 0.2): about 50% opacity with the screen showing through unblurred. Nothing in this package or the fleet passes a `blurTarget`, so scroll-view chrome, `blur: true` drawers, and now Dialog/Menu all looked like that. `BlurView` now checks exactly expo-blur's own condition (`blursOnAndroid` in `BlurView.tsx`) and renders the same solid surface `blur={false}` gives otherwise; iOS and web are untouched (they need no target). It checks the `blurTarget` ref object, not `.current`, matching expo-blur's own JS: the target view usually commits after `BlurView` renders. Covered by `BlurView.test.tsx`'s "on Android" block, which fails against the pre-change code. Dialog and Menu don't forward `blurTarget`/`blurMethod`, so on Android they're always solid now. Released in 0.12.2 after verification on web (Expo-Starter, yalc-linked) and in unit tests; not yet checked on an Android or iOS device.
- `src/__tests__/Portal.test.tsx` (5 tests) uses a local portal mock faithful to Paper's real mechanics, and fails against the pre-fix code. Mutation-checked: moving the host outside any of the four contexts, inside the styled `View`, or rendering it only when a module is injected each fail at least one test.

**2026-09-18 — `useThemeBridgeProps`, extracted from the fleet's five duplicate `Theme.tsx` files.** New `src/useThemeBridgeProps.ts` + `ThemeBridgeProps` type, exported from `index.ts`. Landed on `main` alongside the version bump to 0.11.1 in `package.json`, but not yet tagged/published as of this writing — no `v0.11.1` tag exists yet (see Release above for the tag-based flow this still has to go through).

- **Lives here, not in `@rific/core`.** `@rific/core`'s `createSettingsContext`/`createSettingsSlice`/`createModuleConfig` are the fleet's genuinely generic, feature-agnostic factories with zero knowledge of any concrete settings shape. `initialValue`/`onChange`/`onReady` are `ProviderProps`' own field names (`ThemeProvider.tsx`) and are meaningless outside this package, so the bridge hook belongs next to `Provider` — exactly where `@rific/feedback-press` keeps its own analogous `useFeedbackBridgeProps` next to `FeedbackPressProvider`, not inside `@rific/core`. This package is the one "home" for it, not a new shared package of its own.
- **Deliberately not the `createReduxThemeBridge(themeActions, useAppSelector)` factory an earlier brief proposed.** Grepped before writing a line of code: neither this package, `@rific/core`, nor `@rific/feedback-press` imports `react-redux` or `@reduxjs/toolkit` anywhere in `src/` — each package's `@reduxjs/toolkit` entry is an unused `devDependency`/`optionalDependency`, not evidence of a real coupling — and no consuming app even has a typed `useAppSelector`/`useAppDispatch`; all five call raw `useSelector`/`useDispatch` inline. Taking a `useAppSelector`-style hook reference would have newly committed this package to react-redux's hook API for no real gain. `useThemeBridgeProps` instead takes already-resolved plain values/callbacks, same as `useFeedbackBridgeProps` — this package stays opinion-free about any app's `RootState` shape, or about state management being Redux at all.
- **Honest scope: this replaces the final JSX prop list, nothing upstream of it.** In every consuming app's own `Theme.tsx`, the hook collapses `<Provider initialValue={settings} onChange={onChange} onReady={onReady}>` into `<Provider {...bridgeProps}>`. It does **not** remove or absorb the `useSelector(state => state.theme, shallowEqual)`, `useDispatch()`, or either `useCallback` line above that JSX — those stay hand-written per app, because `RootState`'s type and the app's own splash-gate identity (e.g. `markSplashReady('theme')`) are both app-local and this package has no way to generalize either. Read "extraction" at face value here: it's the same modest, real-but-bounded win `useFeedbackBridgeProps` already delivered fleet-wide — one canonical prop shape to copy from a doc comment instead of five apps re-deriving it by hand — not a reduction in how much Redux wiring each app owns.
- **`onReady` is threaded through completely unchanged** — never recomputed, wrapped, or given new timing semantics by this hook. It still fires exactly once, the first time `Provider` itself reports its computed theme is ready. A wrong `onReady` (e.g. one that marks a splash gate ready before `Provider` actually is) is a bug in the *consuming app's* own callback, not something this hook can catch — see BoxHockey's and LightCycles' own history of hand-fixing exactly that "marked ready too early" bug in their `Theme.tsx` files before this hook existed. This hook doesn't make that bug class structurally impossible; it just gives every app the same three-field object to get right once instead of five chances to get it wrong.
- Ships with its own `src/__tests__/useThemeBridgeProps.test.ts`, mirroring `useFeedbackBridgeProps.test.ts`'s shape: passthrough under each field's unchanged `ProviderProps` name, a safe no-op when every field is omitted, and memoization (referentially stable output across re-renders with unchanged inputs, a new object once an input changes).
- Per-app adoption (Snake, AirHockey, BoxHockey, Pong, LightCycles) is out of scope of this package's own repo. Each app swaps its `Theme.tsx`'s trailing `<AutoPaperProvider initialValue={...} onChange={...} onReady={...}>` for `<AutoPaperProvider {...bridgeProps}>` on its own schedule, appending any app-specific extra props after the spread (e.g. Snake's `expoBlur`/dynamically-loaded `fontFamily`, LightCycles' `reanimated`/statically-imported `fontFamily`) — those extra props were never part of this hook's contract and aren't touched by it.

## Peer Dependencies

- `react-native` (required)
- `react-native-paper` (required)
- `expo-blur` (optional, frosted-glass `BlurView`; without it, `BlurView` renders its solid fallback, as it also does on Android unless given a `blurTarget` plus a `blurMethod`)
- `expo-navigation-bar` (optional, >= 56.0.0, auto-syncs the Android nav bar icon style when `BottomNavigation` is mounted)

Both optional peers are loaded via a `try { require(...) } catch { return null }` guard (see `src/navigation-bar.ts` and `src/components/BlurView.tsx`), with a local mirrored type shape for each instead of importing the peer's real types, so consumers who never installed the optional peer aren't forced to resolve it, at runtime or in the type checker.

## Testing

- Framework: Jest + ts-jest, jsdom environment
- Mocks in `src/__mocks__/` for `react-native`, `react-native-paper`
- Tests in `src/__tests__/`: utils tested individually, components/hooks tested with `@testing-library/react`
- 305 tests across 37 suites
- `src/__tests__/Portal.test.tsx` overrides the shared react-native-paper mock locally with one that reproduces Paper's real portal mechanics (content renders at the nearest `PortalHost`, outside any contexts in between; `PaperProvider` wraps its subtree in a host). The shared mock's `Portal`/`Portal.Host` are plain passthroughs, which would hide portal bugs entirely: test anything portal-related there, not against the shared mock.

## Code Style

Enforced by ESLint + Prettier, run `npm run lint` before finishing any task.

**Prettier config:**
- Single quotes, JSX single quotes
- No semicolons
- No trailing commas
- Print width: 1000 (effectively disabled)

**ESLint rules (warnings):**
- `simple-import-sort`: imports and exports must be sorted
- `react-native/sort-styles`: StyleSheet keys must be sorted alphabetically
- `react-native/no-inline-styles`: no inline style objects
- `react-native/no-unused-styles`: no unused StyleSheet entries
- `no-console`: no console statements
