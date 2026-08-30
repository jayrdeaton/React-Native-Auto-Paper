import { render } from '@testing-library/react'
import { Menu as PaperMenu } from 'react-native-paper'

import { Menu } from '../components/Menu'
import { defaultThemeSettings, ThemeSettingsContext } from '../ThemeSettingsContext'

// This suite is about Menu's own logic (contentStyle assembly, blur resolution) — not BlurView's
// own rendering — so BlurView is stubbed out locally, same "mock what this suite doesn't own"
// pattern as ColorPicker.test.tsx's Dialog mock.
jest.mock('../components/BlurView', () => ({
  BlurView: jest.fn(({ children }: { children?: React.ReactNode }) => children ?? null)
}))

import { BlurView } from '../components/BlurView'

const mockPaperMenu = PaperMenu as jest.MockedFunction<typeof PaperMenu>
const mockBlurView = BlurView as jest.MockedFunction<typeof BlurView>

beforeEach(() => jest.clearAllMocks())

const renderWithSettings = (blur: boolean, ui: React.ReactElement) => render(<ThemeSettingsContext.Provider value={{ settings: { ...defaultThemeSettings, blur }, set: jest.fn() }}>{ui}</ThemeSettingsContext.Provider>)

describe('Menu', () => {
  it('puts the fixed transparent/no-vertical-padding style ahead of any passed-through contentStyle', () => {
    const contentStyle = { marginTop: 8 }
    render(
      <Menu anchor={null} contentStyle={contentStyle} visible onDismiss={jest.fn()}>
        content
      </Menu>
    )

    const { contentStyle: received } = mockPaperMenu.mock.calls[0][0]
    expect(received).toEqual([{ backgroundColor: 'transparent', paddingVertical: 0 }, contentStyle])
  })

  it('still passes the fixed style through when no contentStyle prop is given', () => {
    render(
      <Menu anchor={null} visible onDismiss={jest.fn()}>
        content
      </Menu>
    )

    const { contentStyle: received } = mockPaperMenu.mock.calls[0][0]
    expect(received).toEqual([{ backgroundColor: 'transparent', paddingVertical: 0 }, undefined])
  })

  it('wraps its children in BlurView', () => {
    render(
      <Menu anchor={null} visible onDismiss={jest.fn()}>
        content
      </Menu>
    )

    expect(mockBlurView).toHaveBeenCalledTimes(1)
    expect(mockBlurView.mock.calls[0][0].children).toBe('content')
  })

  it('resolves blur from ThemeSettings when no blur prop is passed', () => {
    renderWithSettings(
      false,
      <Menu anchor={null} visible onDismiss={jest.fn()}>
        content
      </Menu>
    )

    expect(mockBlurView.mock.calls[0][0].blur).toBe(false)
  })

  it('lets an explicit blur prop override ThemeSettings', () => {
    renderWithSettings(
      false,
      <Menu anchor={null} blur visible onDismiss={jest.fn()}>
        content
      </Menu>
    )

    expect(mockBlurView.mock.calls[0][0].blur).toBe(true)
  })

  it('exposes Menu.Item as the same reference as the mocked PaperMenu.Item', () => {
    expect(Menu.Item).toBe(PaperMenu.Item)
  })
})
