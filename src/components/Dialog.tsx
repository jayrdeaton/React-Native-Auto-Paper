import React, { type ComponentType, type ReactNode, useEffect, useState } from 'react'
import { Animated, BackHandler, Easing, Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'
import { Dialog as PaperDialog, type DialogActionsProps, type DialogContentProps, type DialogProps as PaperDialogProps, type DialogScrollAreaProps, type DialogTitleProps, Portal, useTheme } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useBlur } from '../BlurContext'
import { useReanimatedModule } from '../ThemeProvider'
import { BlurView } from './BlurView'

// Minimal local mirror of react-native-reanimated's Animated.View — same reasoning as BlurView's
// ExpoBlurModule: Metro doesn't rewrite a require()-in-try/catch call into its module graph inside
// an ESM build, so the already-imported peer module is injected via <Provider reanimated={...}>
// (see ThemeProvider.tsx) instead of required directly. Only `View` is needed here. `style: any`,
// not a real style type — reanimated's actual AnimatedView only accepts its own branded
// AnimatedStyle shape, which this package never imports (no reanimated dependency at all), so `any`
// is the only type that both sides (this interface and the real component passed in) can agree on.
export interface ReanimatedModule {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  View: ComponentType<{ children?: ReactNode; style?: any; testID?: string }>
}

export type DialogProps = Omit<PaperDialogProps, 'style'> & {
  blur?: boolean
  style?: StyleProp<ViewStyle>
  // Applied to the card's outer wrapper instead of the card itself, and only takes effect once a
  // reanimated module has been injected via <Provider reanimated={...}> — otherwise ignored. `style`
  // above is a plain object read once per render, so a fast-changing value (e.g. tracking the
  // keyboard height every frame) driven through it needs a full JS re-render per update to paint at
  // all; wiring the same value through `animatedStyle` (e.g. the result of Reanimated's
  // useAnimatedStyle()) instead paints on the UI thread with no JS round-trip, which is the whole
  // difference between a smooth follow and a laggy snap.
  animatedStyle?: unknown
}

// Matches react-native-paper's Modal: DEFAULT_DURATION * theme.animation.scale, eased the same way,
// so toggling blur never changes how the dialog animates in/out.
const ANIMATION_DURATION = 220

// Minimum breathing room between the card and the screen edge, clamped up from safe-area insets.
const DIALOG_MARGIN = 32

function DialogComponent({ animatedStyle, blur: blurProp, dismissable = true, dismissableBackButton = dismissable, visible, onDismiss, children, style, testID = 'dialog' }: DialogProps) {
  const blur = useBlur(blurProp)
  const reanimated = useReanimatedModule()
  const theme = useTheme()
  const { colors, isV3, roundness } = theme
  const { scale } = theme.animation
  const { bottom, left, right, top } = useSafeAreaInsets()
  const [opacity] = useState(() => new Animated.Value(visible ? 1 : 0))
  const [mounted, setMounted] = useState(visible)

  if (visible && !mounted) {
    setMounted(true)
  }

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, { duration: scale * ANIMATION_DURATION, easing: Easing.out(Easing.cubic), toValue: 1, useNativeDriver: true }).start()
    } else {
      Animated.timing(opacity, { duration: scale * ANIMATION_DURATION, easing: Easing.out(Easing.cubic), toValue: 0, useNativeDriver: true }).start(({ finished }) => {
        if (finished) setMounted(false)
      })
    }
  }, [visible, opacity, scale])

  useEffect(() => {
    if (!visible) return undefined
    const onHardwareBackPress = () => {
      if (dismissable || dismissableBackButton) onDismiss?.()
      return true
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress)
    return () => subscription.remove()
  }, [dismissable, dismissableBackButton, onDismiss, visible])

  if (!mounted) return null

  // Mirrors react-native-paper's own Dialog: the first child gets extra top spacing so the
  // header sits the same distance from the edge whether the surface is blurred or solid.
  const content = React.Children.toArray(children)
    .filter((child) => child != null && typeof child !== 'boolean')
    .map((child, i) => {
      if (isV3) {
        if (i === 0 && React.isValidElement<DialogContentProps>(child)) {
          return React.cloneElement(child, { style: [{ marginTop: 24 }, child.props.style] })
        }
      }
      if (i === 0 && React.isValidElement<DialogContentProps>(child) && child.type === PaperDialog.Content) {
        return React.cloneElement(child, { style: [{ paddingTop: 24 }, child.props.style] })
      }
      return child
    })

  const borderRadius = (isV3 ? 7 : 1) * roundness

  return (
    <Portal>
      <Animated.View accessibilityLiveRegion='polite' accessibilityViewIsModal pointerEvents={visible ? 'box-none' : 'none'} style={[StyleSheet.absoluteFill, { opacity }]} testID={testID}>
        <Pressable accessibilityLabel='Close modal' accessibilityRole='button' disabled={!dismissable} onPress={dismissable ? onDismiss : undefined} style={[StyleSheet.absoluteFill, { backgroundColor: colors.backdrop }]} testID={`${testID}-backdrop`} />
        <View pointerEvents='box-none' style={[styles.wrapper, { marginBottom: bottom, marginTop: top, paddingHorizontal: Math.max(left, right, DIALOG_MARGIN) }]} testID={`${testID}-wrapper`}>
          {reanimated && animatedStyle ? (
            <reanimated.View style={animatedStyle} testID={`${testID}-animated-wrapper`}>
              <BlurView blur={blur} style={[styles.card, { borderRadius }, style]} testID={`${testID}-surface`}>
                {content}
              </BlurView>
            </reanimated.View>
          ) : (
            <BlurView blur={blur} style={[styles.card, { borderRadius }, style]} testID={`${testID}-surface`}>
              {content}
            </BlurView>
          )}
        </View>
      </Animated.View>
    </Portal>
  )
}

DialogComponent.Title = PaperDialog.Title as React.FC<DialogTitleProps>
DialogComponent.Content = PaperDialog.Content as React.FC<DialogContentProps>
DialogComponent.Actions = PaperDialog.Actions as React.FC<DialogActionsProps>
DialogComponent.ScrollArea = PaperDialog.ScrollArea as React.FC<DialogScrollAreaProps>

export const Dialog = DialogComponent

const styles = StyleSheet.create({
  // Width cap keeps dialogs card-sized on wide viewports (web/tablet); no effect on phones.
  card: { alignSelf: 'center', maxWidth: 400, overflow: 'hidden', width: '100%' },
  wrapper: { flex: 1, justifyContent: 'center', paddingVertical: DIALOG_MARGIN }
})
