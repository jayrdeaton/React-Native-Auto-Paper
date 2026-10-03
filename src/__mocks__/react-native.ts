import React from 'react'

const noop = () => {}
const stub = ({ children }: { children?: React.ReactNode }) => children ?? null

const StyleSheet = {
  create: <T extends object>(styles: T): T => styles,
  flatten: (style: unknown) => style
}

const mockListener = { remove: noop }

const Appearance = {
  getColorScheme: jest.fn(() => 'light' as 'light' | 'dark' | null),
  addChangeListener: jest.fn(() => mockListener)
}

const StatusBar = stub

export { Appearance, StatusBar, StyleSheet }
export const TouchableOpacity = jest.fn(stub)
export const View = jest.fn(stub)

export const Platform = { OS: 'ios' }

export const Animated = {
  Value: jest.fn().mockImplementation((v: unknown) => ({ __value: v })),
  timing: jest.fn(() => ({
    start: jest.fn((cb?: (result: { finished: boolean }) => void) => cb && cb({ finished: true }))
  })),
  View: jest.fn(stub),
  multiply: jest.fn((a: unknown, b: unknown) => ({ __multiply: [a, b] })),
  // Renders the wrapped component itself, so its mock still records the call, marked __animated so
  // tests can tell an Animated wrapper apart from the plain component
  createAnimatedComponent: (component: React.ComponentType<Record<string, unknown>>) => (props: Record<string, unknown>) => React.createElement(component, { ...props, __animated: true })
}

export const BackHandler = {
  addEventListener: jest.fn(() => ({ remove: jest.fn() }))
}

export const Easing = {
  bezier: jest.fn(() => jest.fn()),
  out: jest.fn((fn: unknown) => fn),
  cubic: jest.fn()
}

export const Pressable = jest.fn(stub)

export const TextInput = jest.fn(() => null)
