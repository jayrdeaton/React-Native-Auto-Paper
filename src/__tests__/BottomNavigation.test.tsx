import { render } from '@testing-library/react'
import { Appearance, Platform } from 'react-native'
import { BottomNavigation as PaperBottomNavigation, MD3LightTheme, useTheme } from 'react-native-paper'

import { BottomNavigation } from '../components/BottomNavigation'
import { Provider } from '../ThemeProvider'

const mockAppearance = Appearance as jest.Mocked<typeof Appearance>
const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>
const mockPaperBottomNavigationBar = PaperBottomNavigation.Bar as jest.MockedFunction<typeof PaperBottomNavigation.Bar>

const navigationState = { index: 0, routes: [{ key: 'home', title: 'Home' }] }
const renderScene = jest.fn(() => null)
const onIndexChange = jest.fn()
const onTabPress = jest.fn()

const makeNavigationBar = () => ({ NavigationBar: { setStyle: jest.fn() } })

beforeEach(() => {
  jest.clearAllMocks()
  mockUseTheme.mockReturnValue(MD3LightTheme as ReturnType<typeof useTheme>)
  mockAppearance.getColorScheme.mockReturnValue('light')
  mockAppearance.addChangeListener.mockReturnValue({ remove: jest.fn() })
})

afterEach(() => {
  Platform.OS = 'ios'
})

describe('BottomNavigation', () => {
  describe('useNavigationBarSync via the main component', () => {
    it('calls onNavBarChange with theme.colors.surface and theme.dark, and does not call navigationBar.NavigationBar.setStyle', () => {
      Platform.OS = 'android'
      const onNavBarChange = jest.fn()
      const navigationBar = makeNavigationBar()
      render(
        <Provider navigationBar={navigationBar} onNavBarChange={onNavBarChange}>
          <BottomNavigation navigationState={navigationState} onIndexChange={onIndexChange} renderScene={renderScene} />
        </Provider>
      )
      expect(onNavBarChange).toHaveBeenCalledWith(MD3LightTheme.colors.surface, MD3LightTheme.dark)
      expect(navigationBar.NavigationBar.setStyle).not.toHaveBeenCalled()
    })

    it('calls navigationBar.NavigationBar.setStyle when no onNavBarChange is provided', () => {
      Platform.OS = 'android'
      const navigationBar = makeNavigationBar()
      render(
        <Provider navigationBar={navigationBar}>
          <BottomNavigation navigationState={navigationState} onIndexChange={onIndexChange} renderScene={renderScene} />
        </Provider>
      )
      expect(navigationBar.NavigationBar.setStyle).toHaveBeenCalledWith(MD3LightTheme.dark ? 'light' : 'dark')
    })

    it('calls neither onNavBarChange nor navigationBar.NavigationBar.setStyle on non-android platforms', () => {
      Platform.OS = 'ios'
      const onNavBarChange = jest.fn()
      const navigationBar = makeNavigationBar()
      render(
        <Provider navigationBar={navigationBar} onNavBarChange={onNavBarChange}>
          <BottomNavigation navigationState={navigationState} onIndexChange={onIndexChange} renderScene={renderScene} />
        </Provider>
      )
      expect(onNavBarChange).not.toHaveBeenCalled()
      expect(navigationBar.NavigationBar.setStyle).not.toHaveBeenCalled()
    })
  })

  describe('useNavigationBarSync via .Bar', () => {
    it('calls onNavBarChange with theme.colors.surface and theme.dark, and does not call navigationBar.NavigationBar.setStyle', () => {
      Platform.OS = 'android'
      const onNavBarChange = jest.fn()
      const navigationBar = makeNavigationBar()
      render(
        <Provider navigationBar={navigationBar} onNavBarChange={onNavBarChange}>
          <BottomNavigation.Bar navigationState={navigationState} onTabPress={onTabPress} />
        </Provider>
      )
      expect(onNavBarChange).toHaveBeenCalledWith(MD3LightTheme.colors.surface, MD3LightTheme.dark)
      expect(navigationBar.NavigationBar.setStyle).not.toHaveBeenCalled()
    })

    it('calls navigationBar.NavigationBar.setStyle when no onNavBarChange is provided', () => {
      Platform.OS = 'android'
      const navigationBar = makeNavigationBar()
      render(
        <Provider navigationBar={navigationBar}>
          <BottomNavigation.Bar navigationState={navigationState} onTabPress={onTabPress} />
        </Provider>
      )
      expect(navigationBar.NavigationBar.setStyle).toHaveBeenCalledWith(MD3LightTheme.dark ? 'light' : 'dark')
    })

    it('calls neither onNavBarChange nor navigationBar.NavigationBar.setStyle on non-android platforms', () => {
      Platform.OS = 'ios'
      const onNavBarChange = jest.fn()
      const navigationBar = makeNavigationBar()
      render(
        <Provider navigationBar={navigationBar} onNavBarChange={onNavBarChange}>
          <BottomNavigation.Bar navigationState={navigationState} onTabPress={onTabPress} />
        </Provider>
      )
      expect(onNavBarChange).not.toHaveBeenCalled()
      expect(navigationBar.NavigationBar.setStyle).not.toHaveBeenCalled()
    })

    it('renders PaperBottomNavigation.Bar', () => {
      render(<BottomNavigation.Bar navigationState={navigationState} onTabPress={onTabPress} />)
      expect(mockPaperBottomNavigationBar).toHaveBeenCalled()
    })
  })

  describe('SceneMap', () => {
    it('is the same reference as the mocked PaperBottomNavigation.SceneMap', () => {
      expect(BottomNavigation.SceneMap).toBe(PaperBottomNavigation.SceneMap)
    })
  })
})
