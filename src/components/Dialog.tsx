import React, { useEffect, useRef, useState } from 'react'
import { Animated, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { Dialog as PaperDialog, type DialogActionsProps, type DialogContentProps, type DialogProps as PaperDialogProps, type DialogScrollAreaProps, type DialogTitleProps, Portal, useTheme } from 'react-native-paper'

import { useBlur } from '../BlurContext'
import { BlurView } from './BlurView'

export type DialogProps = PaperDialogProps & {
  blur?: boolean
}

function DialogComponent({ blur: blurProp, visible, onDismiss, children, style, ...rest }: DialogProps) {
  const blur = useBlur(blurProp)
  const { roundness, colors } = useTheme()
  const opacity = useRef(new Animated.Value(0)).current
  const [mounted, setMounted] = useState(visible)

  useEffect(() => {
    if (visible) {
      setMounted(true)
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start()
    } else {
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => setMounted(false))
    }
  }, [visible])

  if (!blur) {
    return (
      <PaperDialog visible={visible} onDismiss={onDismiss} style={[styles.sized, style]} {...rest}>
        {children}
      </PaperDialog>
    )
  }

  if (!mounted) return null

  return (
    <Portal>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents={visible ? 'box-none' : 'none'}>
        <TouchableWithoutFeedback onPress={onDismiss}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.backdrop }]} />
        </TouchableWithoutFeedback>
        <View style={styles.wrapper} pointerEvents='box-none'>
          <BlurView style={[styles.card, { borderRadius: roundness * 7 }]}>{children}</BlurView>
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
  sized: { alignSelf: 'center', maxWidth: 400, width: '100%' },
  wrapper: { flex: 1, justifyContent: 'center', paddingHorizontal: 26 }
})
