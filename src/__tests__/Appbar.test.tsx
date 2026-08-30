import { render } from '@testing-library/react'
import * as ReactNative from 'react-native'
import { Appbar as PaperAppbar, MD3DarkTheme, MD3LightTheme, useTheme } from 'react-native-paper'

import { Appbar } from '../components/Appbar'
import { PaperDefaultsContext } from '../PaperDefaultsContext'

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>
const mockPaperAppbarHeader = PaperAppbar.Header as jest.MockedFunction<typeof PaperAppbar.Header>

beforeEach(() => {
  jest.clearAllMocks()
  mockUseTheme.mockReturnValue(MD3LightTheme as ReturnType<typeof useTheme>)
})

describe('Appbar', () => {
  describe('Header', () => {
    it('renders a StatusBar with theme.colors.surface and dark-content when theme.dark is false', () => {
      const mockStatusBar = jest.spyOn(ReactNative, 'StatusBar')
      render(<Appbar.Header>content</Appbar.Header>)
      const call = mockStatusBar.mock.calls[0][0]
      expect(call.backgroundColor).toBe(MD3LightTheme.colors.surface)
      expect(call.barStyle).toBe('dark-content')
      mockStatusBar.mockRestore()
    })

    it('renders a StatusBar with theme.colors.surface and light-content when theme.dark is true', () => {
      mockUseTheme.mockReturnValue(MD3DarkTheme as ReturnType<typeof useTheme>)
      const mockStatusBar = jest.spyOn(ReactNative, 'StatusBar')
      render(<Appbar.Header>content</Appbar.Header>)
      const call = mockStatusBar.mock.calls[0][0]
      expect(call.backgroundColor).toBe(MD3DarkTheme.colors.surface)
      expect(call.barStyle).toBe('light-content')
      mockStatusBar.mockRestore()
    })

    it('merges defaults.AppbarHeader under explicit props', () => {
      render(
        <PaperDefaultsContext.Provider value={{ AppbarHeader: { dark: true, mode: 'medium' } }}>
          <Appbar.Header>content</Appbar.Header>
        </PaperDefaultsContext.Provider>
      )
      const call = mockPaperAppbarHeader.mock.calls[0][0]
      expect(call.dark).toBe(true)
      expect(call.mode).toBe('medium')
    })

    it('lets an explicit prop win over the same key in defaults.AppbarHeader', () => {
      render(
        <PaperDefaultsContext.Provider value={{ AppbarHeader: { elevated: true } }}>
          <Appbar.Header elevated={false}>content</Appbar.Header>
        </PaperDefaultsContext.Provider>
      )
      const call = mockPaperAppbarHeader.mock.calls[0][0]
      expect(call.elevated).toBe(false)
    })

    it('passes style through to PaperAppbar.Header', () => {
      const style = { backgroundColor: 'red' }
      render(<Appbar.Header style={style}>content</Appbar.Header>)
      const call = mockPaperAppbarHeader.mock.calls[0][0]
      expect(call.style).toBe(style)
    })
  })

  describe('Content, Action, BackAction', () => {
    it('re-exports the same PaperAppbar.Content/Action/BackAction references', () => {
      expect(Appbar.Content).toBe(PaperAppbar.Content)
      expect(Appbar.Action).toBe(PaperAppbar.Action)
      expect(Appbar.BackAction).toBe(PaperAppbar.BackAction)
    })
  })
})
