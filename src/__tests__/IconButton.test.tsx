import { render } from '@testing-library/react'
import { IconButton as PaperIconButton, MD3LightTheme, useTheme } from 'react-native-paper'

import { IconButton } from '../components/IconButton'

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>
const mockPaperIconButton = PaperIconButton as jest.MockedFunction<typeof PaperIconButton>

beforeEach(() => {
  jest.clearAllMocks()
  mockUseTheme.mockReturnValue(MD3LightTheme as any)
})

describe('IconButton', () => {
  it('renders without variant', () => {
    render(<IconButton icon="star" />)
    const call = mockPaperIconButton.mock.calls[0][0]
    expect(call.containerColor).toBeUndefined()
    expect(call.iconColor).toBeUndefined()
  })

  it('applies primaryContainer and onPrimaryContainer for variant="primary"', () => {
    render(<IconButton icon="star" variant="primary" />)
    const call = mockPaperIconButton.mock.calls[0][0]
    expect(call.containerColor).toBe(MD3LightTheme.colors.primaryContainer)
    expect(call.iconColor).toBe(MD3LightTheme.colors.onPrimaryContainer)
  })

  it('applies secondaryContainer and onSecondaryContainer for variant="secondary"', () => {
    render(<IconButton icon="star" variant="secondary" />)
    const call = mockPaperIconButton.mock.calls[0][0]
    expect(call.containerColor).toBe(MD3LightTheme.colors.secondaryContainer)
    expect(call.iconColor).toBe(MD3LightTheme.colors.onSecondaryContainer)
  })

  it('applies tertiaryContainer and onTertiaryContainer for variant="tertiary"', () => {
    render(<IconButton icon="star" variant="tertiary" />)
    const call = mockPaperIconButton.mock.calls[0][0]
    expect(call.containerColor).toBe(MD3LightTheme.colors.tertiaryContainer)
    expect(call.iconColor).toBe(MD3LightTheme.colors.onTertiaryContainer)
  })

  it('applies surface and onSurface for variant="surface"', () => {
    render(<IconButton icon="star" variant="surface" />)
    const call = mockPaperIconButton.mock.calls[0][0]
    expect(call.containerColor).toBe(MD3LightTheme.colors.surface)
    expect(call.iconColor).toBe(MD3LightTheme.colors.onSurface)
  })

  it('explicit containerColor overrides variant containerColor', () => {
    render(<IconButton icon="star" variant="primary" containerColor="#custom" />)
    const call = mockPaperIconButton.mock.calls[0][0]
    expect(call.containerColor).toBe('#custom')
  })

  it('explicit iconColor overrides variant iconColor', () => {
    render(<IconButton icon="star" variant="primary" iconColor="#custom" />)
    const call = mockPaperIconButton.mock.calls[0][0]
    expect(call.iconColor).toBe('#custom')
  })
})
