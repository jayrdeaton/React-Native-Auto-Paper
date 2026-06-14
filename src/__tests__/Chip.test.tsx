import { render } from '@testing-library/react'
import { Chip as PaperChip, MD3LightTheme, useTheme } from 'react-native-paper'

import { Chip } from '../components/Chip'

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>
const mockPaperChip = PaperChip as jest.MockedFunction<typeof PaperChip>

beforeEach(() => {
  jest.clearAllMocks()
  mockUseTheme.mockReturnValue(MD3LightTheme as any)
})

describe('Chip', () => {
  it('renders without variant', () => {
    render(<Chip>Tag</Chip>)
    const call = mockPaperChip.mock.calls[0][0]
    expect(call.style).toEqual([undefined, undefined])
    expect(call.selectedColor).toBeUndefined()
  })

  it('applies primaryContainer background for variant="primary"', () => {
    render(<Chip variant="primary">Tag</Chip>)
    const call = mockPaperChip.mock.calls[0][0]
    expect(call.style).toEqual([{ backgroundColor: MD3LightTheme.colors.primaryContainer }, undefined])
  })

  it('applies secondaryContainer background for variant="secondary"', () => {
    render(<Chip variant="secondary">Tag</Chip>)
    const call = mockPaperChip.mock.calls[0][0]
    expect(call.style).toEqual([{ backgroundColor: MD3LightTheme.colors.secondaryContainer }, undefined])
  })

  it('applies tertiaryContainer background for variant="tertiary"', () => {
    render(<Chip variant="tertiary">Tag</Chip>)
    const call = mockPaperChip.mock.calls[0][0]
    expect(call.style).toEqual([{ backgroundColor: MD3LightTheme.colors.tertiaryContainer }, undefined])
  })

  it('applies surface background for variant="surface"', () => {
    render(<Chip variant="surface">Tag</Chip>)
    const call = mockPaperChip.mock.calls[0][0]
    expect(call.style).toEqual([{ backgroundColor: MD3LightTheme.colors.surface }, undefined])
  })

  it('applies onPrimaryContainer selectedColor for variant="primary"', () => {
    render(<Chip variant="primary">Tag</Chip>)
    const call = mockPaperChip.mock.calls[0][0]
    expect(call.selectedColor).toBe(MD3LightTheme.colors.onPrimaryContainer)
  })

  it('applies onSecondaryContainer selectedColor for variant="secondary"', () => {
    render(<Chip variant="secondary">Tag</Chip>)
    const call = mockPaperChip.mock.calls[0][0]
    expect(call.selectedColor).toBe(MD3LightTheme.colors.onSecondaryContainer)
  })

  it('applies onTertiaryContainer selectedColor for variant="tertiary"', () => {
    render(<Chip variant="tertiary">Tag</Chip>)
    const call = mockPaperChip.mock.calls[0][0]
    expect(call.selectedColor).toBe(MD3LightTheme.colors.onTertiaryContainer)
  })

  it('applies onSurface selectedColor for variant="surface"', () => {
    render(<Chip variant="surface">Tag</Chip>)
    const call = mockPaperChip.mock.calls[0][0]
    expect(call.selectedColor).toBe(MD3LightTheme.colors.onSurface)
  })

  it('explicit selectedColor overrides variant selectedColor', () => {
    render(<Chip variant="primary" selectedColor="#custom">Tag</Chip>)
    const call = mockPaperChip.mock.calls[0][0]
    expect(call.selectedColor).toBe('#custom')
  })

  it('merges variant style with explicit style prop', () => {
    render(<Chip variant="primary" style={{ borderRadius: 4 }}>Tag</Chip>)
    const call = mockPaperChip.mock.calls[0][0]
    expect(call.style).toEqual([{ backgroundColor: MD3LightTheme.colors.primaryContainer }, { borderRadius: 4 }])
  })
})
