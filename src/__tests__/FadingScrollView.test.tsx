import { act, render, screen } from '@testing-library/react'
import { type ReactElement, type ReactNode } from 'react'
import { Appearance, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent, Platform, ScrollView, View } from 'react-native'

import { FadingScrollView, type MaskedViewModule, SCROLL_FADE_HEIGHT } from '../components/FadingScrollView'
import { Provider } from '../ThemeProvider'

// A list's rows fade out above its pinned footer while there is more to scroll, by masking the content
// (a second blur as a frosted footer left a seam). These drive the ScrollView's own layout, content size
// and scroll events and read the mask that results.

const mockAppearance = Appearance as jest.Mocked<typeof Appearance>
// The shared react-native mock's Platform is a plain object, so tests set OS on it directly.
const mockPlatform = Platform as { OS: string }
const mockView = View as unknown as jest.Mock

// Stands in for @react-native-masked-view/masked-view's default export, as an app hands it to
// <Provider maskedView={...}>. It renders the content and keeps its props for the mask assertions.
const fakeMaskedView = jest.fn(({ children }: { children?: ReactNode }) => <div data-testid='masked-view'>{children}</div>)
const maskedView = fakeMaskedView as unknown as MaskedViewModule

function scrollProps() {
  return (ScrollView as unknown as jest.Mock).mock.lastCall![0]
}

function layout(height: number) {
  act(() => scrollProps().onLayout({ nativeEvent: { layout: { x: 0, y: 0, width: 300, height } } } as LayoutChangeEvent))
}

function contentSize(height: number) {
  act(() => scrollProps().onContentSizeChange(300, height))
}

function scrollTo(y: number) {
  act(() => scrollProps().onScroll({ nativeEvent: { contentOffset: { x: 0, y } } } as NativeSyntheticEvent<NativeScrollEvent>))
}

// The mask's bands: [top band, opaque fill, bottom band].
function lastBands() {
  const mask = fakeMaskedView.mock.lastCall![0] as unknown as { maskElement: ReactElement<{ children: ReactElement<{ style: unknown }>[] }> }
  const band = (i: number) => Object.assign({}, ...[mask.maskElement.props.children[i].props.style].flat(Infinity))
  return { top: band(0), bottom: band(2) }
}

function lastBand() {
  return lastBands().bottom
}

const GRADIENT = 'linear-gradient(#000, transparent)'
const TOP_GRADIENT = 'linear-gradient(transparent, #000)'

beforeEach(() => {
  jest.clearAllMocks()
  mockPlatform.OS = 'ios'
  mockAppearance.getColorScheme.mockReturnValue('light')
  mockAppearance.addChangeListener.mockReturnValue({ remove: jest.fn() })
})

describe('FadingScrollView', () => {
  it('fades the bottom edge only while there is more below, and not once scrolled to the end', () => {
    render(
      <Provider maskedView={maskedView}>
        <FadingScrollView>rows</FadingScrollView>
      </Provider>
    )

    layout(400)
    contentSize(400)
    expect(lastBand()).toMatchObject({ height: SCROLL_FADE_HEIGHT, backgroundColor: '#000' })

    contentSize(700)
    expect(lastBand()).toMatchObject({ height: SCROLL_FADE_HEIGHT, experimental_backgroundImage: GRADIENT })

    scrollTo(300)
    expect(lastBand()).toMatchObject({ backgroundColor: '#000' })
    scrollTo(120)
    expect(lastBand()).toMatchObject({ experimental_backgroundImage: GRADIENT })
  })

  it('fades the top edge only once scrolled down, so the first row is never dimmed at rest', () => {
    render(
      <Provider maskedView={maskedView}>
        <FadingScrollView>rows</FadingScrollView>
      </Provider>
    )

    layout(400)
    contentSize(700)
    expect(lastBands().top).toMatchObject({ height: SCROLL_FADE_HEIGHT, backgroundColor: '#000' })

    scrollTo(120)
    expect(lastBands()).toMatchObject({ top: { experimental_backgroundImage: TOP_GRADIENT }, bottom: { experimental_backgroundImage: GRADIENT } })

    scrollTo(300)
    expect(lastBands()).toMatchObject({ top: { experimental_backgroundImage: TOP_GRADIENT }, bottom: { backgroundColor: '#000' } })

    scrollTo(0)
    expect(lastBands().top).toMatchObject({ backgroundColor: '#000' })
  })

  it('passes the content, its own scroll handlers and every other prop through to the ScrollView', () => {
    const onScroll = jest.fn()
    render(
      <Provider maskedView={maskedView}>
        <FadingScrollView onScroll={onScroll} testID='scroller' showsVerticalScrollIndicator={false}>
          rows
        </FadingScrollView>
      </Provider>
    )

    expect(screen.getByText('rows')).toBeTruthy()
    expect(scrollProps()).toMatchObject({ testID: 'scroller', showsVerticalScrollIndicator: false, scrollEventThrottle: 16 })
    scrollTo(10)
    expect(onScroll).toHaveBeenCalledTimes(1)
  })

  it('scrolls plainly, with no fade, when no masked-view module was handed to the Provider', () => {
    render(
      <Provider>
        <FadingScrollView>rows</FadingScrollView>
      </Provider>
    )

    layout(400)
    contentSize(700)
    expect(screen.getByText('rows')).toBeTruthy()
    expect(fakeMaskedView).not.toHaveBeenCalled()
  })

  it("on web, where react-native-masked-view doesn't mask, puts a CSS mask on the outer box instead", () => {
    mockPlatform.OS = 'web'
    const contentSized = { flexGrow: 0 }
    render(
      <Provider maskedView={maskedView}>
        <FadingScrollView style={contentSized}>rows</FadingScrollView>
      </Provider>
    )

    layout(400)
    contentSize(700)
    expect(fakeMaskedView).not.toHaveBeenCalled()
    const masked = mockView.mock.calls.map(([props]) => Object.assign({}, ...[props.style].flat(Infinity))).filter((style) => 'maskImage' in style)
    expect(masked[masked.length - 1]).toMatchObject({ flexGrow: 0, maskImage: `linear-gradient(to bottom, #000 0, #000 calc(100% - ${SCROLL_FADE_HEIGHT}px), transparent 100%)` })

    scrollTo(120)
    const both = mockView.mock.calls.map(([props]) => Object.assign({}, ...[props.style].flat(Infinity))).filter((style) => 'maskImage' in style)
    expect(both[both.length - 1].maskImage).toBe(`linear-gradient(to bottom, transparent 0, #000 ${SCROLL_FADE_HEIGHT}px, #000 calc(100% - ${SCROLL_FADE_HEIGHT}px), transparent 100%)`)
  })
})
