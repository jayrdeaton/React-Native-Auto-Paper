# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

# @rific/auto-paper

Standalone npm package that provides adaptive theming for `react-native-paper`. Give it one seed color and an appearance setting; it generates a triadic MD3 palette and handles light/dark/system mode automatically, with no `@react-navigation/native` dependency.

Part of the `@rific` package ecosystem. Published at https://www.npmjs.com/package/@rific/auto-paper.

## Commands

```bash
npm run build       # tsup, outputs CJS + ESM + types to dist/
npm run check       # TypeScript type check (tsc --noEmit)
npm test            # Jest (330 tests)
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
    BlurView.tsx            - one View that holds the children whether or not it blurs: an absoluteFill expo-blur layer on native, its own backdrop-filter style on web, a solid surface otherwise
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
- `useThemeBridgeProps({ initialValue, onChange, onReady })` / `ThemeBridgeProps` type: reshapes an app's own already-resolved Redux state/dispatch results into the exact `Pick<ProviderProps, 'initialValue' | 'onChange' | 'onReady'>` shape, memoized on those three fields, ready to spread onto `Provider` (`<Provider {...bridgeProps}>`) - see Design Notes for what this hook does and does not replace
- `usePaperDefaults()`: read component prop defaults from context
- `useBlur(override?)`: resolve the effective blur setting
- Wrapper components: `Appbar`, `AppearancePicker`, `AutoAppearancePicker`, `AutoPalettePicker`, `BlurView`, `BottomNavigation`, `Button`, `Chip`, `ColorPicker`, `Dialog`, `FAB`, `HarmonyPicker`, `IconButton`, `Menu`, `PalettePicker`, `TextInput`
- `themeReducer` / `themeActions` / `createThemeReducer` / selectors / `ThemeState`: optional Redux integration
- `getColorRoles(base, surface, containerAlpha?)` / `ColorRoles` type: MD3 color/onColor/container/onContainer role quadruple
- Color utils: `getTriadicPalette`, `getThirdColor`, `getBlendedColor`, `getTonalColor`, `getTintTextColor`, `getContrastColor`, `isDarkColor`, `getRgb`, `getHex`

## Design Notes

**2026-10-15 - `BlurView` no longer remounts its children when `blur` flips (released in 0.12.4).** It used to return `<expoBlur.BlurView>` when blurring and a plain `<View>` otherwise: different element types, so every flip unmounted and remounted the whole subtree. `Dialog` and `Menu` follow the live `settings.blur`, so this went user-visible with @tastic/hud 0.17.0, whose settings sheet (an auto-paper `Dialog`) has its own Blur row: tapping it remounted the sheet, resetting its scroll offset (in Snake held sideways the row jumped out of view), cutting off the ripple, dropping keyboard focus on web and resetting any local state in the app's own section.

- **Fix: one outer `View` always holds the blurTint surface layer, the tint and the children.** On iOS and Android, when blur applies, expo-blur's `BlurView` renders as a childless absoluteFill layer ahead of them, the same structure as expo-blur's own native wrapper (an outer View plus an absoluteFill native blur view). `intensity`, `blurMethod`, `blurTarget`, `blurReductionFactor` and `experimentalBlurMethod` go to that layer only; a `tint` prop is still ignored for the theme's dark/light, as before. No `overflow: 'hidden'` is added: clipping is unchanged (callers that want rounded blur set it, as `Dialog`'s card does, exactly as expo-blur already required), and adding it would kill iOS shadows.
- **Web can't use the nested layer.** `Dialog` and `Menu` fade `BlurView`'s own opacity there, and a faded ancestor of a `backdrop-filter` element breaks the blur (see the 2026-10-03 note below). So on web the outer `View` is itself the backdrop-filter element, with `getWebBlurStyle` copying expo-blur's web `getBlurStyle` (and `getBackgroundColor`'s 'dark'/'light' tints), applied after `style` as expo-blur orders them. expo-blur's web component is no longer rendered at all, though `expoBlur` still has to be injected for blur to apply. That copy matches expo-blur 56.0.4 and 57.0.3; a later change to expo-blur's web look won't carry over on its own.
- **The `ref` now lands on the outer host View** (React 19 passes it as a prop through `...props`). react-native-web 0.21's Animated always re-renders rather than calling `setNativeProps`, so the web fades don't care; on native nothing in this package animates `BlurView`.
- **Verified on web in Hangman** (an APFS clone with this build yalc-added from a private store, so neither Hangman's checkout nor `~/.yalc` was touched), viewport shrunk so the sheet scrolls: four click toggles and two keyboard Enter toggles of the Blur row each kept the same DOM nodes for the card, scroll container and button, kept `scrollTop`, kept focus on the button, and switched the card between `saturate(1.8) blur(10px)` over `rgba(249,249,249,0.39)` (`rgba(25,25,25,0.39)` in dark) and the solid surface. Every frame of a close and a reopen (`requestAnimationFrame` shimmed onto a 16ms timer, since the hidden pane throttles it) had the fade opacity on the backdrop-filter card itself with every ancestor at 1.
- **Verified on the iOS 27 simulator** with a Debug build of the same Hangman clone (Xcode 27 builds of SDK 57 apps abort at launch on iOS 27 without Solitaire's `withSceneDelegate` plugin, which the clone borrowed; Hangman itself still lacks it). A scratch harness opened Settings at launch, flipped `settings.blur` six times through `useThemeSettings().set` (what hud's Blur row does on tap) and logged a probe's mount/unmount from inside the sheet: one mount and no unmounts across two runs, with screenshots showing the card frosted (corners clipped by `Dialog`'s `overflow: 'hidden'`) and then solid. With the pre-fix `BlurView` swapped in, the same harness logged an unmount and a remount on every toggle. Not checked on Android, where `Dialog` and `Menu` never blur (no `blurTarget`).
- Tests: `BlurView.test.tsx`'s "when blur flips" block (a child logging mount/unmount, flipped via the prop and via `Provider` settings, on iOS, Android and web; all six fail against the old component), plus its "native blur layer" and "on web" blocks; `Dialog.test.tsx`'s "blur toggle while open" block. `Portal.test.tsx`'s two expo-blur checks now look for the blur layer beside the content instead of around it.

**2026-10-03 - On web, `Menu` and `Dialog` no longer fade an ancestor of their blur (released in 0.12.3).** Found in Utility (whose own `Menu` wraps Paper's the same way): a menu opened see-through and unblurred, and stayed that way until hovering it. expo-blur's web `BlurView` is a `<div>` with CSS `backdrop-filter`. Any ancestor below opacity 1 becomes its backdrop root, so while Paper's Menu fades its Surface (and while `Dialog` faded the `Animated.View` wrapping its card), the blur only sees that ancestor's own empty content: correct per spec, and see-through for the whole fade. Chromium also doesn't recompute the backdrop root when the ancestor's opacity returns to exactly 1, so the surface *stays* see-through until something forces a repaint.

- **`Dialog` was broken outright on 0.12.2's web build** (Expo-Starter's demo: a "Blur On" card with the page sharp behind it, indefinitely). **`Menu` was mostly masked:** Paper `focus()`es the first focusable item when its open animation ends, and that repaint happens to restore the blur. A menu with nothing focusable stays see-through (Utility's sort menu), and every menu is unblurred during its 250ms fades.
- **Fix, web only (native renders exactly the tree it did before).** Opacity on the `backdrop-filter` element itself fades the blurred result correctly, with no stale state, so the fade moves there:
  - `Dialog` moves its existing opacity value off the outer layer onto the backdrop and the card (an animated `BlurView`). A numeric `style.opacity` on the card is multiplied into the fade, not overridden.
  - `Menu` pins Paper's Surface at `opacity: 1` with `shadowOpacity: 0` through `contentStyle`, and wraps its children in `FadingBlurView`. That runs Paper Menu's fades on `BlurView` (250ms × `animation.scale`, `bezier(0.4, 0, 0.2, 1)`, timed from the `theme` prop like Paper's) and draws the Surface's MD3 shadow (Paper's per-elevation table, `elevation` prop, none in `flat` mode) and corner radius on `BlurView`, so content and shadow still fade together. A close is final: once Paper starts hiding, it always unmounts the content when that fade-out ends or is interrupted (`hide()`'s callback ignores `finished`), even if `visible` turns back on first, so fading back in would only end in a pop.
  - Because everything visible starts at opacity 0, this also covers Paper's stale pre-measurement frame on re-opens (`hide()` resets neither the scale nor `left`/`top`), which Paper's own Surface opacity used to hide. The one leftover is `animation.scale` 0, where the fade completes at mount and a re-open can paint one frame at the previous position.
- **Verified in Expo-Starter (yalc-linked), web.** Sampled every frame: the ancestor stays at 1, and the blur fades 0 → 1 and is live from the first frame after opening.
- **Web resolves `dist/`, not `src/`.** Metro's web build doesn't use the `"react-native"` export condition, so a yalc-linked web test needs a fresh `npm run build` (which `yalc publish` runs via `prepublishOnly`).
- Unrelated, pre-existing, not fixed: Paper 5.15.3's Menu gets stuck closed if `visible` goes back to true before its close animation ends. `prevRendered` is still true, so `show()` is skipped, then the close unmounts the content while `visible` stays true, and Paper only listens for Escape while shown. This lives entirely in Paper's `visible`/`rendered`/`prevRendered` logic.
- Tests: `Menu.test.tsx` (native vs web `contentStyle`, the fade in/out, shadow per elevation/mode, the final close, the `theme` prop) and `Dialog.test.tsx`'s "fade placement" block. They fail against both the pre-change components and a first pass that didn't move the shadow, close, or theme handling. The shared react-native mock's `Animated.createAnimatedComponent` now marks what it wraps with `__animated` (so dropping a wrapper fails the web tests instead of silently killing the fade on web), plus `Animated.multiply` and `Easing.bezier`.

**2026-10-03 - `Provider` renders its own nested `Portal.Host` (released in 0.12.2).** Found by the Expo-Starter review: the auto-paper demo's Dialog said "Blur On" but rendered a solid surface. `PaperProvider` wraps its subtree in a `PortalHost`, and that host's `PortalManager` renders every `<Portal>`'s content as a sibling of the host's own children, so portal content only sees contexts provided *above* the host; Paper's `Portal` re-provides only its own theme and settings. `ThemeProviderBody` provides `PaperDefaultsContext`, `NavBarContext`, `BlurModuleContext` and `ReanimatedModuleContext` *inside* `PaperProvider`, so everything portaled under `Provider` lost all four. `Dialog` (which portals its own surface) and Paper's `Menu` (which portals its children) never saw the injected `expoBlur` and always rendered `BlurView`'s solid fallback, and `usePaperDefaults()` returned `{}` inside any portal.

- **Fix: a `<Portal.Host>` nested inside all four contexts, wrapping the styled children `View`.** Every `Portal` resolves the *nearest* host through `PortalContext`, so this host now catches all of them and their content mounts inside every auto-paper context. Paper's outer host stays permanently empty (only `StatusBar`, which renders null, sits between the two). It wraps the styled `View` rather than sitting inside it, so a consumer's `style` (padding, margin, transform, `overflow: 'hidden'`) can never inset or clip a Dialog backdrop or Menu layer. Checked against Paper 5.15.3's source: the portal layer keeps the same origin and size as before (so `Menu`/`Tooltip`'s `measureInWindow`-based positioning is unchanged), stacking order is unchanged, and the host never remounts after the theme first resolves.
- **Contexts an app provides *inside* `Provider` are still invisible to portal content** (Expo-Starter's `ToastProvider`, for one). That's inherent to Paper's portal design, not something this package can fix from above; the README tells apps to render another `<Portal.Host>` below such providers if they need them inside dialogs.
- **Android: `BlurView` now falls back to its solid look unless expo-blur would really blur (same day, at the author's direction).** Getting `expoBlur` into portaled surfaces exposed what every `BlurView` already did on Android: expo-blur there only blurs with both a `blurTarget` and a non-`'none'` `blurMethod` (`'dimezisBlurView'`, or `'dimezisBlurViewSdk31Plus'` on API 31+; `blurMethod` defaults to `'none'`, see `ExpoBlurView.kt`'s `safeMethod`). Without them it paints its tint at roughly 0.35-0.39 alpha, plus `BlurView`'s own surface overlay at `blurTint` (default 0.2): about 50% opacity with the screen showing through unblurred. Nothing in this package or the fleet passes a `blurTarget`, so scroll-view chrome, `blur: true` drawers, and now Dialog/Menu all looked like that. `BlurView` now checks exactly expo-blur's own condition (`blursOnAndroid` in `BlurView.tsx`) and renders the same solid surface `blur={false}` gives otherwise; iOS and web are untouched (they need no target). It checks the `blurTarget` ref object, not `.current`, matching expo-blur's own JS: the target view usually commits after `BlurView` renders. Covered by `BlurView.test.tsx`'s "on Android" block, which fails against the pre-change code. Dialog and Menu don't forward `blurTarget`/`blurMethod`, so on Android they're always solid now. Released in 0.12.2 after verification on web (Expo-Starter, yalc-linked) and in unit tests; not yet checked on an Android or iOS device.
- `src/__tests__/Portal.test.tsx` (5 tests) uses a local portal mock faithful to Paper's real mechanics, and fails against the pre-fix code. Mutation-checked: moving the host outside any of the four contexts, inside the styled `View`, or rendering it only when a module is injected each fail at least one test.

**2026-09-18 - `useThemeBridgeProps`, extracted from the fleet's five duplicate `Theme.tsx` files.** New `src/useThemeBridgeProps.ts` + `ThemeBridgeProps` type, exported from `index.ts`. Landed on `main` alongside the version bump to 0.11.1 in `package.json`, but not yet tagged/published as of this writing - no `v0.11.1` tag exists yet (see Release above for the tag-based flow this still has to go through).

- **Lives here, not in `@rific/core`.** `@rific/core`'s `createSettingsContext`/`createSettingsSlice`/`createModuleConfig` are the fleet's genuinely generic, feature-agnostic factories with zero knowledge of any concrete settings shape. `initialValue`/`onChange`/`onReady` are `ProviderProps`' own field names (`ThemeProvider.tsx`) and are meaningless outside this package, so the bridge hook belongs next to `Provider` - exactly where `@rific/feedback-press` keeps its own analogous `useFeedbackBridgeProps` next to `FeedbackPressProvider`, not inside `@rific/core`. This package is the one "home" for it, not a new shared package of its own.
- **Deliberately not the `createReduxThemeBridge(themeActions, useAppSelector)` factory an earlier brief proposed.** Grepped before writing a line of code: neither this package, `@rific/core`, nor `@rific/feedback-press` imports `react-redux` or `@reduxjs/toolkit` anywhere in `src/` - each package's `@reduxjs/toolkit` entry is an unused `devDependency`/`optionalDependency`, not evidence of a real coupling - and no consuming app even has a typed `useAppSelector`/`useAppDispatch`; all five call raw `useSelector`/`useDispatch` inline. Taking a `useAppSelector`-style hook reference would have newly committed this package to react-redux's hook API for no real gain. `useThemeBridgeProps` instead takes already-resolved plain values/callbacks, same as `useFeedbackBridgeProps` - this package stays opinion-free about any app's `RootState` shape, or about state management being Redux at all.
- **Honest scope: this replaces the final JSX prop list, nothing upstream of it.** In every consuming app's own `Theme.tsx`, the hook collapses `<Provider initialValue={settings} onChange={onChange} onReady={onReady}>` into `<Provider {...bridgeProps}>`. It does **not** remove or absorb the `useSelector(state => state.theme, shallowEqual)`, `useDispatch()`, or either `useCallback` line above that JSX - those stay hand-written per app, because `RootState`'s type and the app's own splash-gate identity (e.g. `markSplashReady('theme')`) are both app-local and this package has no way to generalize either. Read "extraction" at face value here: it's the same modest, real-but-bounded win `useFeedbackBridgeProps` already delivered fleet-wide - one canonical prop shape to copy from a doc comment instead of five apps re-deriving it by hand - not a reduction in how much Redux wiring each app owns.
- **`onReady` is threaded through completely unchanged** - never recomputed, wrapped, or given new timing semantics by this hook. It still fires exactly once, the first time `Provider` itself reports its computed theme is ready. A wrong `onReady` (e.g. one that marks a splash gate ready before `Provider` actually is) is a bug in the *consuming app's* own callback, not something this hook can catch - see BoxHockey's and LightCycles' own history of hand-fixing exactly that "marked ready too early" bug in their `Theme.tsx` files before this hook existed. This hook doesn't make that bug class structurally impossible; it just gives every app the same three-field object to get right once instead of five chances to get it wrong.
- Ships with its own `src/__tests__/useThemeBridgeProps.test.ts`, mirroring `useFeedbackBridgeProps.test.ts`'s shape: passthrough under each field's unchanged `ProviderProps` name, a safe no-op when every field is omitted, and memoization (referentially stable output across re-renders with unchanged inputs, a new object once an input changes).
- Per-app adoption (Snake, AirHockey, BoxHockey, Pong, LightCycles) is out of scope of this package's own repo. Each app swaps its `Theme.tsx`'s trailing `<AutoPaperProvider initialValue={...} onChange={...} onReady={...}>` for `<AutoPaperProvider {...bridgeProps}>` on its own schedule, appending any app-specific extra props after the spread (e.g. Snake's `expoBlur`/dynamically-loaded `fontFamily`, LightCycles' `reanimated`/statically-imported `fontFamily`) - those extra props were never part of this hook's contract and aren't touched by it.

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
- 330 tests across 37 suites
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
