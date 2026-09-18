import { useMemo } from 'react'

import type { ProviderProps } from './ThemeProvider'

/**
 * The subset of ProviderProps a consuming app's own Redux-backed "Theme" component is responsible
 * for supplying. Every field here has an identically-named counterpart on ProviderProps itself
 * (see ThemeProvider.tsx) - deliberately not renamed, so wiring this up needs no new vocabulary
 * beyond the provider's own.
 */
export type ThemeBridgeProps = Pick<ProviderProps, 'initialValue' | 'onChange' | 'onReady'>

/**
 * Reshapes an app's own Redux-sourced theme state and callbacks into the exact prop object
 * `<Provider>` expects, so a consuming app's own "Theme" component - every game in the fleet
 * defines one, reading `state.theme` from its own store via `useSelector(..., shallowEqual)` and
 * dispatching `themeActions.initialize` on change - can hand its own `useSelector`/`dispatch`
 * results straight to this hook instead of re-deriving the same three-prop shape by hand in every
 * app:
 *
 * ```tsx
 * export function Theme({ children }: Props) {
 *   const settings = useSelector((state: RootState) => state.theme, shallowEqual)
 *   const dispatch = useDispatch()
 *   const onChange = useCallback((next: ThemeSettings) => dispatch(themeActions.initialize(next)), [dispatch])
 *   const onReady = useCallback(() => markSplashReady('theme'), [])
 *   const bridgeProps = useThemeBridgeProps({ initialValue: settings, onChange, onReady })
 *   return <Provider {...bridgeProps}>{children}</Provider>
 * }
 * ```
 *
 * Deliberately takes plain values and callbacks rather than a `dispatch` function or any
 * Redux-specific type: this package has no opinion on any app's own RootState shape, or even that
 * state management is Redux at all - the app does its own `useSelector`/`dispatch` wiring and
 * passes just the results in.
 *
 * `onReady` is threaded through completely unchanged, never recomputed or wrapped here - it fires
 * exactly once, the first time `<Provider>` itself reports its computed theme is ready, which is
 * the timing a consuming app's own splash-gate mark depends on. A wrong `onReady` callback (e.g.
 * one that marks the gate ready before `<Provider>` actually is) is a bug in the app's own
 * callback, not something this hook can catch or fix - see BoxHockey's and LightCycles' own history
 * of hand-fixing exactly that "marked ready before Provider was actually ready" bug in their own
 * Theme.tsx before this hook existed.
 */
export function useThemeBridgeProps(props: ThemeBridgeProps): ThemeBridgeProps {
  const { initialValue, onChange, onReady } = props
  return useMemo(() => ({ initialValue, onChange, onReady }), [initialValue, onChange, onReady])
}
