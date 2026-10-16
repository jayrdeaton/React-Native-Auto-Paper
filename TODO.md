# TODO

## React Native 0.88 strict types

Deferred 2026-10-16 to ship Expo SDK 58 apps the same day: `@infinitetoken/tsconfig` 0.6 and `@infinitetoken/jest-config` 0.5 resolve React Native 0.88's legacy (pre-strict) types, and React Native removes those after 0.88. Under the strict types this package's own source still fails `tsc` here (checked by type-checking with `customConditions: ["react-native"]` only):

- `src/components/Dialog.tsx:111` and `:119` (TS2322): the Animated `opacity` style objects and the style array don't fit the strict `ViewStyle` unions.
- `src/components/TextInput.tsx:9` (TS2322): the forwarded ref is typed `TextInputType`; strict types want `TextInputInstance`.

Fix these and release before the fleet moves past SDK 58 (see TSConfig's TODO.md for the whole plan).
