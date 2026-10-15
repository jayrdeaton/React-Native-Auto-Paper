import { type ComponentType, type ReactElement, type ReactNode, useCallback, useRef, useState } from 'react'
import { type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent, Platform, ScrollView, type ScrollViewProps, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'

import { useMaskedViewModule } from '../ThemeProvider'

// Minimal local shape of @react-native-masked-view/masked-view's default export, the same way
// ExpoBlurModule stands in for expo-blur: the optional peer's real types are never imported, so a
// consumer that never installed it doesn't need them. <Provider maskedView={MaskedView}> hands it in.
export type MaskedViewModule = ComponentType<{ children?: ReactNode; maskElement: ReactElement; style?: StyleProp<ViewStyle> }>

// How far in from each edge a FadingScrollView's content fades out while there is more past that edge.
export const SCROLL_FADE_HEIGHT = 24

export type FadingScrollViewProps = Omit<ScrollViewProps, 'style'> & {
  // Placed on the outer box (the flex item), so a caller's flexGrow/flexShrink/alignSelf work as they
  // did on a plain ScrollView.
  style?: StyleProp<ViewStyle>
  fadeHeight?: number
}

// A vertical ScrollView whose content fades to transparent along an edge while there is more to scroll
// past it: at the bottom, the cue that rows continue below a pinned footer, like a dialog's Done
// button; at the top, the same once rows have scrolled up past the edge (Jay, 2026-10-15: one treatment
// at both ends instead of a hard cut at the top). It masks
// the content itself rather than painting anything over it, so whatever is behind (a blurred
// Dialog/BlurView surface, a plain one, light or dark) shows through unchanged: no band, no seam. (A
// second BlurView as a frosted footer was tried in @tastic/hud first and left a seam on iOS and web: a
// blur nested in a blurred card can't frost the card's own content.) Once the end is reached the fade
// goes away, and the top fade only shows once scrolled down, so neither the last row nor the first
// (a dialog's header, say) is ever dimmed at rest.
//
// iOS/Android: a MaskedView (from <Provider maskedView={...}>) whose top and bottom bands are React
// Native's native linear gradient (experimental_backgroundImage). Without one passed in, content just scrolls
// with no fade. Web: react-native-masked-view's web build renders only the mask element (it doesn't
// mask), so the outer box gets a CSS mask-image instead, which react-native-web passes through; no
// module needed there.
export function FadingScrollView({ style, fadeHeight = SCROLL_FADE_HEIGHT, onScroll, onLayout, onContentSizeChange, scrollEventThrottle = 16, children, ...rest }: FadingScrollViewProps) {
  const MaskedView = useMaskedViewModule()
  // Sizes live in a ref and only the yes/no answers are state, so scrolling re-renders nothing until a
  // fade has to appear or go.
  const sizes = useRef({ viewport: 0, content: 0, offset: 0 })
  const [edges, setEdges] = useState(NO_EDGES)
  const update = useCallback(() => {
    const { viewport, content, offset } = sizes.current
    const above = offset > 1
    const below = content - viewport - offset > 1
    setEdges((prev) => (prev.above === above && prev.below === below ? prev : { above, below }))
  }, [])

  const scroll = (
    <ScrollView
      {...rest}
      style={styles.fill}
      scrollEventThrottle={scrollEventThrottle}
      onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
        sizes.current.offset = e.nativeEvent.contentOffset.y
        update()
        onScroll?.(e)
      }}
      onLayout={(e: LayoutChangeEvent) => {
        sizes.current.viewport = e.nativeEvent.layout.height
        update()
        onLayout?.(e)
      }}
      onContentSizeChange={(width: number, height: number) => {
        sizes.current.content = height
        update()
        onContentSizeChange?.(width, height)
      }}
    >
      {children}
    </ScrollView>
  )

  if (Platform.OS === 'web') return <View style={[styles.box, style, (edges.above || edges.below) && webFadeStyle(fadeHeight, edges)]}>{scroll}</View>
  if (!MaskedView) return <View style={[styles.box, style]}>{scroll}</View>

  return (
    <MaskedView
      style={[styles.box, style]}
      maskElement={
        <View style={styles.fill}>
          <View style={[{ height: fadeHeight }, edges.above ? FADE_IN_BAND : styles.opaque]} />
          <View style={styles.fillOpaque} />
          <View style={[{ height: fadeHeight }, edges.below ? FADE_OUT_BAND : styles.opaque]} />
        </View>
      }
    >
      {scroll}
    </MaskedView>
  )
}

// React Native's native linear gradient (0.77+, the New Architecture; the fleet's apps are on 0.86). Cast
// because the peer floor is still 0.76, whose types don't have it, and an app resolves this source file
// against its own React Native types. A mask's alpha is what shows: opaque keeps the content, transparent
// hides it.
const FADE_IN_BAND = { experimental_backgroundImage: 'linear-gradient(transparent, #000)' } as unknown as ViewStyle
const FADE_OUT_BAND = { experimental_backgroundImage: 'linear-gradient(#000, transparent)' } as unknown as ViewStyle

const NO_EDGES = { above: false, below: false }

// mask-image isn't in React Native's style types, but react-native-web passes it to the DOM as is.
function webFadeStyle(fadeHeight: number, edges: { above: boolean; below: boolean }): ViewStyle {
  const top = edges.above ? `transparent 0, #000 ${fadeHeight}px` : '#000 0'
  const bottom = edges.below ? `#000 calc(100% - ${fadeHeight}px), transparent 100%` : '#000 100%'
  const mask = `linear-gradient(to bottom, ${top}, ${bottom})`
  return { maskImage: mask, WebkitMaskImage: mask } as unknown as ViewStyle
}

const styles = StyleSheet.create({
  // A plain ScrollView's own flex defaults, so it sizes the same in its parent.
  box: {
    flexGrow: 1,
    flexShrink: 1
  },
  fill: {
    flexGrow: 1,
    flexShrink: 1
  },
  fillOpaque: {
    backgroundColor: '#000',
    flexGrow: 1
  },
  opaque: {
    backgroundColor: '#000'
  }
})
