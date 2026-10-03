import React, { type ReactNode, useEffect, useState } from 'react'
import { Animated, Easing, Platform, StyleSheet } from 'react-native'
import { type MD2Theme, type MD3Theme, Menu as PaperMenu, type MenuItemProps, type MenuProps as PaperMenuProps, useTheme } from 'react-native-paper'

import { useBlur } from '../BlurContext'
import { BlurView } from './BlurView'

export type MenuProps = PaperMenuProps & {
  blur?: boolean
}

// Mirror react-native-paper's Menu: its fade (ANIMATION_DURATION * theme.animation.scale, eased with
// EASING), its default elevation, and the MD3 shadow its Surface draws at each elevation level.
const ANIMATION_DURATION = 250
const EASING = Easing.bezier(0.4, 0, 0.2, 1)
const DEFAULT_ELEVATION = 2
const SHADOW_HEIGHT = [0, 1, 2, 4, 6, 8]
const SHADOW_RADIUS = [0, 3, 6, 8, 10, 12]

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

type FadingBlurViewProps = {
  blur: boolean
  children: ReactNode
  elevation: number
  theme: PaperMenuProps['theme']
  visible: boolean
}

// Paper fades the menu's Surface in and out. On web, an ancestor below opacity 1 cuts BlurView's CSS
// backdrop-filter off from the page behind it, and Chromium doesn't restore the blur once the Surface
// reaches 1, so the open menu stays see-through until something else repaints it. So on web the Surface
// is pinned at opacity 1 with its shadow hidden, and BlurView itself (the backdrop-filter element) runs
// Paper's fades and draws that shadow, so the two still fade together.
const FadingBlurView = ({ blur, children, elevation, theme: themeOverrides, visible }: FadingBlurViewProps) => {
  const { animation, roundness } = useTheme<MD2Theme | MD3Theme>(themeOverrides)
  const [opacity] = useState(() => new Animated.Value(0))
  // Once Paper starts hiding the menu it unmounts this content when that fade-out ends, even if visible
  // turns back on first, so a close is final here too rather than fading back in only to vanish.
  const [closing, setClosing] = useState(false)
  if (!visible && !closing) setClosing(true)

  useEffect(() => {
    Animated.timing(opacity, { duration: animation.scale * ANIMATION_DURATION, easing: EASING, toValue: closing ? 0 : 1, useNativeDriver: false }).start()
  }, [animation.scale, closing, opacity])

  const shadow = elevation > 0 ? { shadowColor: '#000000', shadowOffset: { height: SHADOW_HEIGHT[elevation], width: 0 }, shadowOpacity: 0.3, shadowRadius: SHADOW_RADIUS[elevation] } : null
  return (
    <AnimatedBlurView blur={blur} style={[{ borderRadius: roundness, opacity }, shadow]}>
      {children}
    </AnimatedBlurView>
  )
}

const MenuComponent = ({ blur: blurProp, children, ...props }: MenuProps) => {
  const blur = useBlur(blurProp)
  const web = Platform.OS === 'web'
  return (
    <PaperMenu {...props} contentStyle={[styles.content, web && styles.webSurface, props.contentStyle]}>
      {web ? (
        <FadingBlurView blur={blur} elevation={props.mode === 'flat' ? 0 : (props.elevation ?? DEFAULT_ELEVATION)} theme={props.theme} visible={props.visible}>
          {children}
        </FadingBlurView>
      ) : (
        <BlurView blur={blur}>{children}</BlurView>
      )}
    </PaperMenu>
  )
}

export const Menu = Object.assign(MenuComponent, {
  Item: PaperMenu.Item as React.FC<MenuItemProps>
})

const styles = StyleSheet.create({
  content: { backgroundColor: 'transparent', paddingVertical: 0 },
  webSurface: { opacity: 1, shadowOpacity: 0 }
})
