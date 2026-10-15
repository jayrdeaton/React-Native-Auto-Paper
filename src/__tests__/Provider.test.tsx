import { render, screen } from '@testing-library/react'
import { useContext } from 'react'
import * as ReactNative from 'react-native'
import { Appearance } from 'react-native'

import { Appbar } from '../components/Appbar'
import { Provider } from '../ThemeProvider'
import { defaultThemeSettings, ThemeSettingsContext } from '../ThemeSettingsContext'

const mockAppearance = Appearance as jest.Mocked<typeof Appearance>

function ReadSettings() {
  const { settings } = useContext(ThemeSettingsContext)
  return (
    <>
      <span data-testid='appearance'>{settings.appearance}</span>
      <span data-testid='color'>{typeof settings.color === 'string' ? settings.color : JSON.stringify(settings.color)}</span>
      <span data-testid='harmony'>{settings.harmony}</span>
    </>
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  mockAppearance.getColorScheme.mockReturnValue('light')
  mockAppearance.addChangeListener.mockReturnValue({ remove: jest.fn() })
})

describe('Provider', () => {
  it('renders children after theme resolves', () => {
    render(
      <Provider>
        <span data-testid='child'>hello</span>
      </Provider>
    )
    expect(screen.getByTestId('child')).toBeTruthy()
  })

  it('uses defaultThemeSettings when no initialValue is provided', () => {
    render(
      <Provider>
        <ReadSettings />
      </Provider>
    )
    expect(screen.getByTestId('appearance').textContent).toBe(defaultThemeSettings.appearance)
    expect(screen.getByTestId('color').textContent).toBe(defaultThemeSettings.color)
    expect(screen.getByTestId('harmony').textContent).toBe(defaultThemeSettings.harmony)
  })

  it('applies initialValue.appearance', () => {
    render(
      <Provider initialValue={{ appearance: 'dark' }}>
        <ReadSettings />
      </Provider>
    )
    expect(screen.getByTestId('appearance').textContent).toBe('dark')
  })

  it('applies initialValue.color', () => {
    render(
      <Provider initialValue={{ color: '#ff0000' }}>
        <ReadSettings />
      </Provider>
    )
    expect(screen.getByTestId('color').textContent).toBe('#ff0000')
  })

  it('applies initialValue.harmony', () => {
    render(
      <Provider initialValue={{ harmony: 'triadic' }}>
        <ReadSettings />
      </Provider>
    )
    expect(screen.getByTestId('harmony').textContent).toBe('triadic')
  })

  it('merges partial initialValue with defaults', () => {
    render(
      <Provider initialValue={{ color: '#00ff00' }}>
        <ReadSettings />
      </Provider>
    )
    expect(screen.getByTestId('color').textContent).toBe('#00ff00')
    expect(screen.getByTestId('appearance').textContent).toBe(defaultThemeSettings.appearance)
    expect(screen.getByTestId('harmony').textContent).toBe(defaultThemeSettings.harmony)
  })

  it('calls onReady once when theme resolves', () => {
    const onReady = jest.fn()
    render(
      <Provider onReady={onReady}>
        <span />
      </Provider>
    )
    expect(onReady).toHaveBeenCalledTimes(1)
  })

  it('accepts an explicit { primary, secondary, tertiary } triad for initialValue.color', () => {
    const triad = { primary: '#ff0000', secondary: '#00ff00', tertiary: '#0000ff' }
    render(
      <Provider initialValue={{ color: triad }}>
        <ReadSettings />
      </Provider>
    )
    expect(screen.getByTestId('color').textContent).toBe(JSON.stringify(triad))
  })

  it('does not call onChange on initial render', () => {
    const onChange = jest.fn()
    render(
      <Provider onChange={onChange}>
        <ReadSettings />
      </Provider>
    )
    expect(onChange).not.toHaveBeenCalled()
  })

  describe('statusBar', () => {
    it('renders a StatusBar styled from the theme by default', () => {
      const mockStatusBar = jest.spyOn(ReactNative, 'StatusBar')
      render(
        <Provider initialValue={{ appearance: 'dark' }} statusBarProps={{ animated: true }}>
          {null}
        </Provider>
      )
      expect(mockStatusBar).toHaveBeenCalledTimes(1)
      expect(mockStatusBar.mock.calls[0][0]).toMatchObject({ barStyle: 'light-content', animated: true })
      mockStatusBar.mockRestore()
    })

    it('renders none, in Provider or Appbar.Header, when statusBar is false (an app that sets the status bar per screen)', () => {
      const mockStatusBar = jest.spyOn(ReactNative, 'StatusBar')
      render(
        <Provider statusBar={false} statusBarProps={{ animated: true }}>
          <Appbar.Header>content</Appbar.Header>
        </Provider>
      )
      expect(mockStatusBar).not.toHaveBeenCalled()
      mockStatusBar.mockRestore()
    })

    it('still renders Appbar.Header its own StatusBar under a default Provider', () => {
      const mockStatusBar = jest.spyOn(ReactNative, 'StatusBar')
      render(
        <Provider>
          <Appbar.Header>content</Appbar.Header>
        </Provider>
      )
      expect(mockStatusBar).toHaveBeenCalledTimes(2)
      mockStatusBar.mockRestore()
    })
  })
})
