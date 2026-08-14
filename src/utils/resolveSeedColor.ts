import type { TriadicPalette } from './getTriadicPalette'

// ThemeSettings.color is `string | TriadicPalette` — a plain seed hex normally, or an explicit
// triad when a consumer bypassed harmony math entirely (see the README's own "Explicit triad"
// section). Anything that needs a single representative color from it — a picker's own `value`,
// a card's accent — narrows via this: `.primary` is that triad's own seed, so it's the
// representative color on the rare path where this branch is actually hit.
export const resolveSeedColor = (color: string | TriadicPalette): string => (typeof color === 'string' ? color : color.primary)
