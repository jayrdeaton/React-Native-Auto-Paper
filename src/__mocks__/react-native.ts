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
  View: jest.fn(stub)
}

export const BackHandler = {
  addEventListener: jest.fn(() => ({ remove: jest.fn() }))
}

export const Easing = {
  out: jest.fn((fn: unknown) => fn),
  cubic: jest.fn()
}

export const Pressable = jest.fn(stub)

export const TextInput = jest.fn(() => null)
