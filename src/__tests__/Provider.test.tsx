import { render, screen } from '@testing-library/react'
import { useContext } from 'react'
import { Appearance } from 'react-native'

import { Provider } from '../ThemeProvider'
import { defaultThemeSettings, ThemeSettingsContext } from '../ThemeSettingsContext'

const mockAppearance = Appearance as jest.Mocked<typeof Appearance>

function ReadSettings() {
  const { settings } = useContext(ThemeSettingsContext)
  return (
    <>
      <span data-testid="appearance">{settings.appearance}</span>
      <span data-testid="color">{settings.color}</span>
      <span data-testid="harmony">{settings.harmony}</span>
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
    render(<Provider><span data-testid="child">hello</span></Provider>)
    expect(screen.getByTestId('child')).toBeTruthy()
  })

  it('uses defaultThemeSettings when no initialValue is provided', () => {
    render(<Provider><ReadSettings /></Provider>)
    expect(screen.getByTestId('appearance').textContent).toBe(defaultThemeSettings.appearance)
    expect(screen.getByTestId('color').textContent).toBe(defaultThemeSettings.color)
    expect(screen.getByTestId('harmony').textContent).toBe(defaultThemeSettings.harmony)
  })

  it('applies initialValue.appearance', () => {
    render(<Provider initialValue={{ appearance: 'dark' }}><ReadSettings /></Provider>)
    expect(screen.getByTestId('appearance').textContent).toBe('dark')
  })

  it('applies initialValue.color', () => {
    render(<Provider initialValue={{ color: '#ff0000' }}><ReadSettings /></Provider>)
    expect(screen.getByTestId('color').textContent).toBe('#ff0000')
  })

  it('applies initialValue.harmony', () => {
    render(<Provider initialValue={{ harmony: 'triadic' }}><ReadSettings /></Provider>)
    expect(screen.getByTestId('harmony').textContent).toBe('triadic')
  })

  it('merges partial initialValue with defaults', () => {
    render(<Provider initialValue={{ color: '#00ff00' }}><ReadSettings /></Provider>)
    expect(screen.getByTestId('color').textContent).toBe('#00ff00')
    expect(screen.getByTestId('appearance').textContent).toBe(defaultThemeSettings.appearance)
    expect(screen.getByTestId('harmony').textContent).toBe(defaultThemeSettings.harmony)
  })

  it('calls onReady once when theme resolves', () => {
    const onReady = jest.fn()
    render(<Provider onReady={onReady}><span /></Provider>)
    expect(onReady).toHaveBeenCalledTimes(1)
  })

  it('does not call onChange on initial render', () => {
    const onChange = jest.fn()
    render(<Provider onChange={onChange}><ReadSettings /></Provider>)
    expect(onChange).not.toHaveBeenCalled()
  })
})
