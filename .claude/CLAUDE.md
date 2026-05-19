# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

# @rific/auto-paper

Standalone npm package that provides adaptive theming for `react-native-paper`. Give it one seed color and an appearance setting; it generates a triadic MD3 palette and handles light/dark/system mode automatically — with no `@react-navigation/native` dependency.

Part of the `@rific` package ecosystem. Published at https://www.npmjs.com/package/@rific/auto-paper.

## Commands

```bash
npm run build       # tsup — outputs CJS + ESM + types to dist/
npm run check       # TypeScript type check (tsc --noEmit)
npm test            # Jest (52 tests)
npm run test:watch  # Jest in watch mode
npm run build       # Full build via tsup
```

## Release

Tag-based, using npm trusted publishing (OIDC — no token required):

```bash
npm version patch   # or minor / major
git push --follow-tags
```

The `publish.yml` workflow fires on `v*` tags and runs `npm publish`.

## Architecture

```
src/
  index.ts                  — all public exports
  ThemeProvider.tsx         — PaperProvider + StatusBar + flex View wrapper
  useComputedTheme.ts       — core hook: appearance resolution, triadic palette, elevation, splash gate
  utils/
    colorNames.ts           — CSS named color → hex map
    getRgb.ts               — parses hex / rgb / rgba / named colors → { r, g, b, a? }
    getHex.ts               — converts any color format to hex string
    getBlendedColor.ts      — alpha-blend two colors
    getTriadicPalette.ts    — generates primary/secondary/tertiary via 120° HSL rotation
    isDarkColor.ts          — WCAG relative luminance check
  redux/
    themeSlice.ts           — optional Redux slice: initialize / setAppearance / setColor
```

## Public API

- `ThemeProvider` — wraps `PaperProvider`, accepts `appearance`, `color`, `splashScreen` props
- `useComputedTheme(appearance, color, options?)` — returns `MD3Theme | null`
- `configureSplashScreen(options?)` — call at app entry; wraps `preventAutoHideAsync` + `setOptions`
- `themeReducer` / `themeActions` / `ThemeState` — optional Redux integration
- Color utils: `getTriadicPalette`, `getBlendedColor`, `isDarkColor`, `getRgb`, `getHex`

## Peer Dependencies

- `react-native` (required)
- `react-native-paper` (required)
- `expo-splash-screen` (optional — only needed when `splashScreen: true`)

## Testing

- Framework: Jest + ts-jest, jsdom environment
- Mocks in `src/__mocks__/` for `react-native`, `react-native-paper`, `expo-splash-screen`
- Tests in `src/__tests__/` — utils tested individually, hook tested with `@testing-library/react`

## Code Style

Enforced by ESLint + Prettier — run `npm run lint` before finishing any task.

**Prettier config:**
- Single quotes, JSX single quotes
- No semicolons
- No trailing commas
- Print width: 1000 (effectively disabled)

**ESLint rules (warnings):**
- `simple-import-sort` — imports and exports must be sorted
- `react-native/sort-styles` — StyleSheet keys must be sorted alphabetically
- `react-native/no-inline-styles` — no inline style objects
- `react-native/no-unused-styles` — no unused StyleSheet entries
- `no-console` — no console statements
