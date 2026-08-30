import { act, render, screen } from '@testing-library/react'
import { Animated, Appearance, BackHandler, Pressable, View } from 'react-native'
import { Dialog as PaperDialog, MD3LightTheme, Portal, useTheme } from 'react-native-paper'

// react-native-safe-area-context is a real installed dependency (not aliased via
// moduleNameMapper). Its own official jest mock (react-native-safe-area-context/jest/mock)
// calls jest.requireActual() on the real package, which transitively imports
// react-native/Libraries/Utilities/codegenNativeComponent.js - an ESM file this repo's ts-jest
// transform (scoped to .ts/.tsx, with node_modules untransformed) can't load, so it throws
// "Must use import to load ES Module" here. A minimal local mock of the one export Dialog.tsx
// actually uses sidesteps that chain entirely.
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 })
}))

import type { ReanimatedModule } from '../components/Dialog'
import { Dialog } from '../components/Dialog'
import { Provider } from '../ThemeProvider'

const mockAppearance = Appearance as jest.Mocked<typeof Appearance>
const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>
const mockPortal = Portal as unknown as jest.Mock
const mockPaperDialogContent = PaperDialog.Content as jest.MockedFunction<typeof PaperDialog.Content>
const mockPaperDialogActions = PaperDialog.Actions as jest.MockedFunction<typeof PaperDialog.Actions>
const mockAnimatedView = Animated.View as unknown as jest.Mock
const mockAnimatedTiming = Animated.timing as unknown as jest.Mock
const mockBackHandlerAddEventListener = BackHandler.addEventListener as unknown as jest.Mock
const mockPressable = Pressable as unknown as jest.Mock
const mockView = View as unknown as jest.Mock

// A minimal reanimated.View stand-in: a real jest.fn() (not the plain arrow BlurView.test.tsx
// uses for expo-blur) so tests can inspect the props Dialog forwards to it, namely `style`.
const makeFakeReanimatedView = () => jest.fn(({ children, testID }: { children?: React.ReactNode; style?: unknown; testID?: string }) => <div data-testid={testID}>{children}</div>)

beforeEach(() => {
  jest.clearAllMocks()
  mockAppearance.getColorScheme.mockReturnValue('light')
  mockAppearance.addChangeListener.mockReturnValue({ remove: jest.fn() })
  mockUseTheme.mockReturnValue(MD3LightTheme as any)
})

describe('Dialog', () => {
  describe('mounted lifecycle', () => {
    it('renders nothing when visible has always been false', () => {
      const { container } = render(
        <Dialog visible={false} onDismiss={jest.fn()}>
          content
        </Dialog>
      )
      expect(container.textContent).toBe('')
      expect(mockPortal).not.toHaveBeenCalled()
    })

    it('renders children through the mocked Portal passthrough when visible', () => {
      render(
        <Dialog visible onDismiss={jest.fn()}>
          content
        </Dialog>
      )
      expect(mockPortal).toHaveBeenCalled()
      expect(screen.getByText('content')).toBeTruthy()
    })

    it('mounts and renders content when visible transitions from false to true (re-opening a closed dialog)', () => {
      const { rerender } = render(
        <Dialog visible={false} onDismiss={jest.fn()}>
          content
        </Dialog>
      )
      expect(screen.queryByText('content')).toBeNull()

      rerender(
        <Dialog visible onDismiss={jest.fn()}>
          content
        </Dialog>
      )
      expect(screen.getByText('content')).toBeTruthy()
    })

    it('keeps content mounted through the fade-out until the animation callback reports finished, then unmounts', () => {
      const { rerender } = render(
        <Dialog visible onDismiss={jest.fn()}>
          content
        </Dialog>
      )
      expect(screen.getByText('content')).toBeTruthy()

      // Override just the next Animated.timing() call (the fade-out one the upcoming rerender
      // triggers) so its start() doesn't auto-resolve like the shared mock's default does -
      // that lets this test observe the "still mounted mid-fade" state as a distinct step.
      const startSpy = jest.fn()
      mockAnimatedTiming.mockReturnValueOnce({ start: startSpy })

      rerender(
        <Dialog visible={false} onDismiss={jest.fn()}>
          content
        </Dialog>
      )

      expect(startSpy).toHaveBeenCalledTimes(1)
      expect(screen.getByText('content')).toBeTruthy()

      const onComplete = startSpy.mock.calls[0][0]
      act(() => {
        onComplete({ finished: true })
      })

      expect(screen.queryByText('content')).toBeNull()
    })

    it('does not unmount when the fade-out animation reports finished: false (e.g. interrupted)', () => {
      const { rerender } = render(
        <Dialog visible onDismiss={jest.fn()}>
          content
        </Dialog>
      )

      const startSpy = jest.fn()
      mockAnimatedTiming.mockReturnValueOnce({ start: startSpy })

      rerender(
        <Dialog visible={false} onDismiss={jest.fn()}>
          content
        </Dialog>
      )

      const onComplete = startSpy.mock.calls[0][0]
      act(() => {
        onComplete({ finished: false })
      })

      expect(screen.getByText('content')).toBeTruthy()
    })
  })

  describe('hardware back button', () => {
    it('registers a hardwareBackPress listener while visible, and removes it once visible becomes false', () => {
      const { rerender } = render(
        <Dialog visible onDismiss={jest.fn()}>
          content
        </Dialog>
      )
      expect(mockBackHandlerAddEventListener).toHaveBeenCalledWith('hardwareBackPress', expect.any(Function))
      const { remove } = mockBackHandlerAddEventListener.mock.results[0].value

      rerender(
        <Dialog visible={false} onDismiss={jest.fn()}>
          content
        </Dialog>
      )
      expect(remove).toHaveBeenCalledTimes(1)
    })

    it('never registers a listener when visible has always been false', () => {
      render(
        <Dialog visible={false} onDismiss={jest.fn()}>
          content
        </Dialog>
      )
      expect(mockBackHandlerAddEventListener).not.toHaveBeenCalled()
    })

    it('calls onDismiss and returns true when dismissable is true (default)', () => {
      const onDismiss = jest.fn()
      render(
        <Dialog visible onDismiss={onDismiss}>
          content
        </Dialog>
      )
      const handler = mockBackHandlerAddEventListener.mock.calls[0][1]
      expect(handler()).toBe(true)
      expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    it('calls onDismiss when dismissableBackButton is true, even with dismissable false', () => {
      const onDismiss = jest.fn()
      render(
        <Dialog visible dismissable={false} dismissableBackButton onDismiss={onDismiss}>
          content
        </Dialog>
      )
      const handler = mockBackHandlerAddEventListener.mock.calls[0][1]
      expect(handler()).toBe(true)
      expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    it('does not call onDismiss when both dismissable and dismissableBackButton are false, but still returns true', () => {
      const onDismiss = jest.fn()
      render(
        <Dialog visible dismissable={false} onDismiss={onDismiss}>
          content
        </Dialog>
      )
      const handler = mockBackHandlerAddEventListener.mock.calls[0][1]
      expect(handler()).toBe(true)
      expect(onDismiss).not.toHaveBeenCalled()
    })
  })

  describe('backdrop press', () => {
    it('disables the backdrop and clears onPress when dismissable={false}', () => {
      const onDismiss = jest.fn()
      render(
        <Dialog visible dismissable={false} onDismiss={onDismiss}>
          content
        </Dialog>
      )
      const backdropCall = mockPressable.mock.calls.find(([props]) => props.testID === 'dialog-backdrop')
      expect(backdropCall?.[0].disabled).toBe(true)
      expect(backdropCall?.[0].onPress).toBeUndefined()
    })

    it('enables the backdrop with onPress=onDismiss when dismissable is true (default)', () => {
      const onDismiss = jest.fn()
      render(
        <Dialog visible onDismiss={onDismiss}>
          content
        </Dialog>
      )
      const backdropCall = mockPressable.mock.calls.find(([props]) => props.testID === 'dialog-backdrop')
      expect(backdropCall?.[0].disabled).toBe(false)
      expect(backdropCall?.[0].onPress).toBe(onDismiss)
    })
  })

  describe('first-child top spacing', () => {
    it('merges { marginTop: 24 } into a Dialog.Content first child under the (isV3) mock theme', () => {
      render(
        <Dialog visible onDismiss={jest.fn()}>
          <Dialog.Content>content</Dialog.Content>
        </Dialog>
      )
      expect(mockPaperDialogContent.mock.calls[0][0].style).toEqual([{ marginTop: 24 }, undefined])
    })

    it('leaves a non-element first child unmerged, and does not touch a later Dialog.Content sibling', () => {
      render(
        <Dialog visible onDismiss={jest.fn()}>
          {'not an element'}
          <Dialog.Content>content</Dialog.Content>
        </Dialog>
      )
      expect(mockPaperDialogContent.mock.calls[0][0].style).toBeUndefined()
    })

    it('does not merge marginTop into a non-Content first child under the isV3 mock theme', () => {
      render(
        <Dialog visible onDismiss={jest.fn()}>
          <Dialog.Actions>content</Dialog.Actions>
        </Dialog>
      )
      expect(mockPaperDialogActions.mock.calls[0][0].style).toBeUndefined()
    })

    it('merges { paddingTop: 24 } instead, gated to Dialog.Content, when the theme reports isV3: false', () => {
      mockUseTheme.mockReturnValueOnce({ ...MD3LightTheme, isV3: false } as any)
      render(
        <Dialog visible onDismiss={jest.fn()}>
          <Dialog.Content>content</Dialog.Content>
        </Dialog>
      )
      expect(mockPaperDialogContent.mock.calls[0][0].style).toEqual([{ paddingTop: 24 }, undefined])
    })

    it('does not merge any style when isV3 is false and the first child is not Dialog.Content', () => {
      mockUseTheme.mockReturnValueOnce({ ...MD3LightTheme, isV3: false } as any)
      render(
        <Dialog visible onDismiss={jest.fn()}>
          <Dialog.Actions>content</Dialog.Actions>
        </Dialog>
      )
      expect(mockPaperDialogActions.mock.calls[0][0].style).toBeUndefined()
    })
  })

  describe('reanimated wrapper', () => {
    it('renders the card inside reanimated.View, forwarding animatedStyle, when both reanimated and animatedStyle are provided', () => {
      const fakeReanimatedView = makeFakeReanimatedView()
      const fakeReanimated: ReanimatedModule = { View: fakeReanimatedView }
      const animatedStyle = { opacity: 1 }

      render(
        <Provider reanimated={fakeReanimated}>
          <Dialog visible animatedStyle={animatedStyle} onDismiss={jest.fn()}>
            content
          </Dialog>
        </Provider>
      )

      expect(screen.getByTestId('dialog-animated-wrapper')).toBeTruthy()
      expect(screen.getByText('content')).toBeTruthy()
      expect(fakeReanimatedView.mock.calls[0][0].style).toBe(animatedStyle)
    })

    it('falls back to the plain wrapper when reanimated is provided but animatedStyle is not', () => {
      const fakeReanimatedView = makeFakeReanimatedView()
      const fakeReanimated: ReanimatedModule = { View: fakeReanimatedView }

      render(
        <Provider reanimated={fakeReanimated}>
          <Dialog visible onDismiss={jest.fn()}>
            content
          </Dialog>
        </Provider>
      )

      expect(screen.queryByTestId('dialog-animated-wrapper')).toBeNull()
      expect(fakeReanimatedView).not.toHaveBeenCalled()
      expect(screen.getByText('content')).toBeTruthy()
    })

    it('falls back to the plain wrapper when animatedStyle is provided but no reanimated module is injected', () => {
      const animatedStyle = { opacity: 1 }
      render(
        <Dialog visible animatedStyle={animatedStyle} onDismiss={jest.fn()}>
          content
        </Dialog>
      )

      expect(screen.queryByTestId('dialog-animated-wrapper')).toBeNull()
      expect(screen.getByText('content')).toBeTruthy()
    })
  })

  describe('testID threading', () => {
    it('threads a custom testID through to testID, -backdrop, -wrapper, -surface, and -animated-wrapper', () => {
      const fakeReanimatedView = makeFakeReanimatedView()
      const fakeReanimated: ReanimatedModule = { View: fakeReanimatedView }
      const animatedStyle = { opacity: 1 }

      render(
        <Provider reanimated={fakeReanimated}>
          <Dialog visible animatedStyle={animatedStyle} onDismiss={jest.fn()} testID='myDialog'>
            content
          </Dialog>
        </Provider>
      )

      expect(mockAnimatedView.mock.calls.some(([props]) => props.testID === 'myDialog')).toBe(true)
      expect(mockPressable.mock.calls.some(([props]) => props.testID === 'myDialog-backdrop')).toBe(true)
      expect(mockView.mock.calls.some(([props]) => props.testID === 'myDialog-wrapper')).toBe(true)
      expect(mockView.mock.calls.some(([props]) => props.testID === 'myDialog-surface')).toBe(true)
      expect(screen.getByTestId('myDialog-animated-wrapper')).toBeTruthy()
    })
  })
})
