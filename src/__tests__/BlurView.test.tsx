import { render, screen } from '@testing-library/react'
import { Appearance } from 'react-native'
import { useTheme } from 'react-native-paper'

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

const fakeExpoBlur: ExpoBlurModule = {
  BlurView: ({ children }) => <div data-testid="expo-blur-view">{children}</div>
}

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
})
