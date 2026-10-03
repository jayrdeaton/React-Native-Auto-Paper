import { render } from '@testing-library/react'
import { Animated, Platform } from 'react-native'
import { Menu as PaperMenu, useTheme } from 'react-native-paper'

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
const mockAnimatedTiming = Animated.timing as unknown as jest.Mock
const mockUseTheme = useTheme as unknown as jest.Mock
// The shared react-native mock's Platform is a plain object, so the web tests set OS on it directly.
const mockPlatform = Platform as { OS: string }

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
    expect(received).toEqual([{ backgroundColor: 'transparent', paddingVertical: 0 }, false, contentStyle])
  })

  it('still passes the fixed style through when no contentStyle prop is given', () => {
    render(
      <Menu anchor={null} visible onDismiss={jest.fn()}>
        content
      </Menu>
    )

    const { contentStyle: received } = mockPaperMenu.mock.calls[0][0]
    expect(received).toEqual([{ backgroundColor: 'transparent', paddingVertical: 0 }, false, undefined])
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

  it("leaves the fade to Paper's Surface on native: BlurView isn't animated, gets no style, and nothing is timed here", () => {
    render(
      <Menu anchor={null} visible onDismiss={jest.fn()}>
        content
      </Menu>
    )

    const props = mockBlurView.mock.calls[0][0] as unknown as Record<string, unknown>
    expect(props.__animated).toBeUndefined()
    expect(props.style).toBeUndefined()
    expect(mockAnimatedTiming).not.toHaveBeenCalled()
  })

  // Paper fades the Surface, an ancestor of BlurView. On web that cuts the CSS backdrop-filter off from
  // the page, and Chromium doesn't restore it once the Surface is back at 1, so the fade (and the shadow
  // that faded with the Surface) moves onto BlurView itself there.
  describe('on web', () => {
    beforeEach(() => {
      mockPlatform.OS = 'web'
    })
    afterEach(() => {
      mockPlatform.OS = 'ios'
    })

    const blurProps = (call = 0) => mockBlurView.mock.calls[call][0] as unknown as { __animated?: boolean; blur: boolean; children: unknown; style: [{ borderRadius: number; opacity: { __value: number } }, Record<string, unknown> | null] }

    it('pins the Surface at opacity 1 and hides its shadow, between the fixed style and any passed-through contentStyle', () => {
      const contentStyle = { marginTop: 8 }
      render(
        <Menu anchor={null} contentStyle={contentStyle} visible onDismiss={jest.fn()}>
          content
        </Menu>
      )

      const { contentStyle: received } = mockPaperMenu.mock.calls[0][0]
      expect(received).toEqual([{ backgroundColor: 'transparent', paddingVertical: 0 }, { opacity: 1, shadowOpacity: 0 }, contentStyle])
    })

    it("fades an Animated BlurView itself in from 0, with Paper Menu's duration, keeping its children and blur", () => {
      renderWithSettings(
        false,
        <Menu anchor={null} visible onDismiss={jest.fn()}>
          content
        </Menu>
      )

      const { __animated, blur, children, style } = blurProps()
      const { opacity } = style[0]
      expect(__animated).toBe(true)
      expect(children).toBe('content')
      expect(blur).toBe(false)
      expect(opacity.__value).toBe(0)
      expect(mockAnimatedTiming).toHaveBeenCalledTimes(1)
      expect(mockAnimatedTiming).toHaveBeenCalledWith(opacity, expect.objectContaining({ duration: 250, toValue: 1, useNativeDriver: false }))
    })

    it("draws the Surface's MD3 shadow and corner radius on BlurView instead, for Paper's default elevation (2)", () => {
      render(
        <Menu anchor={null} visible onDismiss={jest.fn()}>
          content
        </Menu>
      )

      expect(blurProps().style[0].borderRadius).toBe(4)
      expect(blurProps().style[1]).toEqual({ shadowColor: '#000000', shadowOffset: { height: 2, width: 0 }, shadowOpacity: 0.3, shadowRadius: 6 })
    })

    it('follows an elevation prop, and draws no shadow in flat mode', () => {
      render(
        <>
          <Menu anchor={null} elevation={4} visible onDismiss={jest.fn()}>
            raised
          </Menu>
          <Menu anchor={null} mode='flat' visible onDismiss={jest.fn()}>
            flat
          </Menu>
        </>
      )

      expect(blurProps(0).style[1]).toEqual(expect.objectContaining({ shadowOffset: { height: 6, width: 0 }, shadowRadius: 10 }))
      expect(blurProps(1).style[1]).toBeNull()
    })

    it('fades BlurView back out when visible turns false, since Paper keeps the content mounted through its own fade-out', () => {
      const { rerender } = render(
        <Menu anchor={null} visible onDismiss={jest.fn()}>
          content
        </Menu>
      )
      const { opacity } = blurProps().style[0]

      rerender(
        <Menu anchor={null} visible={false} onDismiss={jest.fn()}>
          content
        </Menu>
      )

      expect(mockAnimatedTiming).toHaveBeenCalledTimes(2)
      expect(mockAnimatedTiming).toHaveBeenLastCalledWith(opacity, expect.objectContaining({ duration: 250, toValue: 0 }))
    })

    it("treats a close as final: re-opening before Paper unmounts the content doesn't fade it back in", () => {
      const { rerender } = render(
        <Menu anchor={null} visible onDismiss={jest.fn()}>
          content
        </Menu>
      )
      rerender(
        <Menu anchor={null} visible={false} onDismiss={jest.fn()}>
          content
        </Menu>
      )
      rerender(
        <Menu anchor={null} visible onDismiss={jest.fn()}>
          content
        </Menu>
      )

      expect(mockAnimatedTiming).toHaveBeenCalledTimes(2)
      expect(mockAnimatedTiming).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ toValue: 0 }))
    })

    it("times the fade from a theme prop, like Paper's own Menu does", () => {
      const theme = { animation: { scale: 2 } }
      render(
        <Menu anchor={null} theme={theme} visible onDismiss={jest.fn()}>
          content
        </Menu>
      )

      expect(mockUseTheme).toHaveBeenCalledWith(theme)
    })
  })
})
