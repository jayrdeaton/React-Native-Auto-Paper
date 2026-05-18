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
export const View = stub
