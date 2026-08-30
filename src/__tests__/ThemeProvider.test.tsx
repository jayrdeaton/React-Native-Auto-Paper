import { act, render, screen } from '@testing-library/react'
import { Appearance } from 'react-native'
import { configureFonts } from 'react-native-paper'

import { Provider } from '../ThemeProvider'
import { defaultThemeSettings, type ThemeSettings } from '../ThemeSettingsContext'
import { useThemeSettings } from '../useThemeSettings'

// The shared react-native-paper mock (src/__mocks__/react-native-paper.ts) doesn't export
// configureFonts at all, and it's off-limits to edit for this suite - so it's mocked locally
// here, spreading the shared mock's real exports through jest.requireActual (which itself
// resolves to the shared mock file via jest.config.cjs's moduleNameMapper) and only overriding
// configureFonts with a spy.
jest.mock('react-native-paper', () => ({
  ...jest.requireActual('react-native-paper'),
  configureFonts: jest.fn(() => ({ mockedFontConfig: true }))
}))

const mockAppearance = Appearance as jest.Mocked<typeof Appearance>
const mockConfigureFonts = configureFonts as jest.MockedFunction<typeof configureFonts>

let capturedSet: ((patch: Partial<ThemeSettings>) => void) | null = null

function SettingsConsumer() {
  const { settings, set } = useThemeSettings()
  capturedSet = set
  return <span data-testid='color'>{typeof settings.color === 'string' ? settings.color : ''}</span>
}

beforeEach(() => {
  jest.clearAllMocks()
  mockAppearance.getColorScheme.mockReturnValue('light')
  mockAppearance.addChangeListener.mockReturnValue({ remove: jest.fn() })
  capturedSet = null
})

describe('Provider', () => {
  describe('set()', () => {
    it('merges a patch into settings, updating consumers', () => {
      render(
        <Provider>
          <SettingsConsumer />
        </Provider>
      )
      expect(screen.getByTestId('color').textContent).toBe(defaultThemeSettings.color)

      act(() => {
        capturedSet?.({ color: '#00ff00' })
      })

      expect(screen.getByTestId('color').textContent).toBe('#00ff00')
    })

    it('merges the patch on top of the previous settings rather than replacing them', () => {
      render(
        <Provider>
          <SettingsConsumer />
        </Provider>
      )

      act(() => {
        capturedSet?.({ color: '#00ff00' })
      })
      act(() => {
        capturedSet?.({ harmony: 'triadic' })
      })

      expect(screen.getByTestId('color').textContent).toBe('#00ff00')
    })
  })

  describe('onChange', () => {
    it('is not called on initial mount', () => {
      const onChange = jest.fn()
      render(
        <Provider onChange={onChange}>
          <SettingsConsumer />
        </Provider>
      )
      expect(onChange).not.toHaveBeenCalled()
    })

    it('is called exactly once after a set() call changes settings', () => {
      const onChange = jest.fn()
      render(
        <Provider onChange={onChange}>
          <SettingsConsumer />
        </Provider>
      )

      act(() => {
        capturedSet?.({ color: '#123456' })
      })

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ color: '#123456' }))
    })
  })

  describe('fontFamily', () => {
    it('does not call configureFonts when fontFamily is not provided', () => {
      render(
        <Provider>
          <span />
        </Provider>
      )
      expect(mockConfigureFonts).not.toHaveBeenCalled()
    })

    it('calls configureFonts with the given fontFamily, merging the result into theme.fonts', () => {
      render(
        <Provider fontFamily='CustomFont'>
          <span />
        </Provider>
      )
      expect(mockConfigureFonts).toHaveBeenCalledTimes(1)
      expect(mockConfigureFonts).toHaveBeenCalledWith({ config: { fontFamily: 'CustomFont' } })
    })
  })
})
