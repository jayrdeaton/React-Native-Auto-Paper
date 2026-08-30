import { render, screen } from '@testing-library/react'
import { Appearance, View } from 'react-native'
import { MD3DarkTheme, MD3LightTheme, useTheme } from 'react-native-paper'

import type { ExpoBlurModule } from '../components/BlurView'
import { BlurView } from '../components/BlurView'
import { Provider } from '../ThemeProvider'

// expo-blur is no longer auto-detected via require() - Metro doesn't rewrite a
// require()-in-try/catch call into its module graph inside an ESM (.mjs) build, so the
// module-level detection this package used to do silently broke as soon as consumers'
// bundlers resolved this package's ESM entry point. <Provider expoBlur={...}> now supplies it
// via context (see ThemeProvider.tsx's BlurModuleContext) instead.
const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>
const mockAppearance = Appearance as jest.Mocked<typeof Appearance>
// Cast rather than jest.MockedFunction<typeof View>: the mock's `stub` signature doesn't line up
// with RN's real View prop types, and these tests only care about the raw props each call received.
const mockView = View as unknown as jest.Mock

// Wrapped in jest.fn (identical rendered output) so the tint="dark"/"light" test below can inspect
// what BlurView actually passed it, the same "inspect mock.calls" style used everywhere else in
// this suite - existing tests here only ever assert on the rendered <div>, so this is a no-op for them.
const fakeExpoBlur: ExpoBlurModule = {
  BlurView: jest.fn(({ children }) => <div data-testid='expo-blur-view'>{children}</div>)
}
const mockExpoBlurView = fakeExpoBlur.BlurView as unknown as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
  mockAppearance.getColorScheme.mockReturnValue('light')
  mockAppearance.addChangeListener.mockReturnValue({ remove: jest.fn() })
})

describe('BlurView', () => {
  it('renders the plain solid fallback when no expo-blur module is injected', () => {
    mockUseTheme.mockReturnValue({ colors: { surface: '#fff' }, dark: false } as ReturnType<typeof useTheme>)
    render(<BlurView>content</BlurView>)
    expect(screen.queryByTestId('expo-blur-view')).toBeNull()
    expect(screen.getByText('content')).toBeTruthy()
  })

  it('renders through the injected expo-blur BlurView when provided via <Provider expoBlur={...}>', () => {
    render(
      <Provider expoBlur={fakeExpoBlur}>
        <BlurView>content</BlurView>
      </Provider>
    )
    expect(screen.getByTestId('expo-blur-view')).toBeTruthy()
  })

  it('falls back to the plain View when blur={false}, even with expo-blur injected', () => {
    render(
      <Provider expoBlur={fakeExpoBlur}>
        <BlurView blur={false}>content</BlurView>
      </Provider>
    )
    expect(screen.queryByTestId('expo-blur-view')).toBeNull()
  })

  // The plain-View fallback branch (no expo-blur injected) is used for all of the variant/elevation/tint
  // cases below: BlurView always renders the tint overlay as the *second* View call (the container is
  // the first), so mockView.mock.calls[1][0].style is the tint's [StyleSheet.absoluteFill, {backgroundColor,
  // opacity}] pair whenever one is rendered, and mockView is called only once when it isn't.

  it.each([
    ['primary', 'primary'],
    ['secondary', 'secondary'],
    ['tertiary', 'tertiary'],
    ['error', 'error']
  ] as const)('resolves variant="%s" tint to colors.%s at the light variant opacity (0.12)', (variant, colorKey) => {
    mockUseTheme.mockReturnValue(MD3LightTheme as any)
    render(<BlurView variant={variant}>content</BlurView>)
    expect(mockView.mock.calls[1][0].style).toEqual([undefined, { backgroundColor: MD3LightTheme.colors[colorKey], opacity: 0.12 }])
  })

  it('resolves variant tint to the dark variant opacity (0.18) when the theme is dark', () => {
    mockUseTheme.mockReturnValue(MD3DarkTheme as any)
    render(<BlurView variant='primary'>content</BlurView>)
    expect(mockView.mock.calls[1][0].style).toEqual([undefined, { backgroundColor: MD3DarkTheme.colors.primary, opacity: 0.18 }])
  })

  it('uses colors.surface as the container background for the default variant', () => {
    mockUseTheme.mockReturnValue(MD3LightTheme as any)
    render(<BlurView>content</BlurView>)
    expect(mockView).toHaveBeenCalledTimes(1)
    expect(mockView.mock.calls[0][0].style).toEqual([{ backgroundColor: MD3LightTheme.colors.surface }, undefined])
  })

  it('uses colors.surfaceVariant as the container background for variant="surfaceVariant"', () => {
    mockUseTheme.mockReturnValue(MD3LightTheme as any)
    render(<BlurView variant='surfaceVariant'>content</BlurView>)
    expect(mockView).toHaveBeenCalledTimes(1)
    expect(mockView.mock.calls[0][0].style).toEqual([{ backgroundColor: MD3LightTheme.colors.surfaceVariant }, undefined])
  })

  it('renders no tint overlay when elevation=0, since ELEVATION_OPACITY[0] is 0', () => {
    mockUseTheme.mockReturnValue(MD3LightTheme as any)
    render(<BlurView elevation={0}>content</BlurView>)
    expect(mockView).toHaveBeenCalledTimes(1)
  })

  it.each([
    [1, 0.05],
    [2, 0.08],
    [3, 0.11],
    [4, 0.12],
    [5, 0.14]
  ] as const)('resolves elevation=%d tint to colors.primary at ELEVATION_OPACITY %s', (elevation, opacity) => {
    mockUseTheme.mockReturnValue(MD3LightTheme as any)
    render(<BlurView elevation={elevation}>content</BlurView>)
    expect(mockView.mock.calls[1][0].style).toEqual([undefined, { backgroundColor: MD3LightTheme.colors.primary, opacity }])
  })

  it('lets variant take precedence over elevation for both tint color and opacity', () => {
    mockUseTheme.mockReturnValue(MD3LightTheme as any)
    // variant='secondary' would resolve to colors.secondary/0.12; elevation=3 alone would resolve to
    // colors.primary/0.11 - asserting colors.secondary/0.12 here proves variant wins on both axes.
    render(
      <BlurView elevation={3} variant='secondary'>
        content
      </BlurView>
    )
    expect(mockView.mock.calls[1][0].style).toEqual([undefined, { backgroundColor: MD3LightTheme.colors.secondary, opacity: 0.12 }])
  })

  it('lets an explicit tintColor+tintOpacity override variant and elevation entirely', () => {
    mockUseTheme.mockReturnValue(MD3LightTheme as any)
    render(
      <BlurView elevation={3} tintColor='#123456' tintOpacity={0.5} variant='secondary'>
        content
      </BlurView>
    )
    expect(mockView.mock.calls[1][0].style).toEqual([undefined, { backgroundColor: '#123456', opacity: 0.5 }])
  })

  it('falls back an explicit tintColor with no tintOpacity to 0.16 opacity in light mode', () => {
    mockUseTheme.mockReturnValue(MD3LightTheme as any)
    render(<BlurView tintColor='#123456'>content</BlurView>)
    expect(mockView.mock.calls[1][0].style).toEqual([undefined, { backgroundColor: '#123456', opacity: 0.16 }])
  })

  it('falls back an explicit tintColor with no tintOpacity to 0.24 opacity in dark mode', () => {
    mockUseTheme.mockReturnValue(MD3DarkTheme as any)
    render(<BlurView tintColor='#123456'>content</BlurView>)
    expect(mockView.mock.calls[1][0].style).toEqual([undefined, { backgroundColor: '#123456', opacity: 0.24 }])
  })

  it('passes tint="dark" to the injected expo-blur BlurView when the theme is dark', () => {
    mockUseTheme.mockReturnValue(MD3DarkTheme as any)
    render(
      <Provider expoBlur={fakeExpoBlur}>
        <BlurView>content</BlurView>
      </Provider>
    )
    expect(mockExpoBlurView.mock.calls[0][0].tint).toBe('dark')
  })
})
