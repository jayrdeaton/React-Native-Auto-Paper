import React, { useEffect } from 'react'
import { Platform } from 'react-native'
import { BottomNavigation as PaperBottomNavigation, type BottomNavigationProps, type BottomNavigationRoute, useTheme } from 'react-native-paper'

import { usePaperDefaults } from '../PaperDefaultsContext'

function useNavigationBarSync() {
  const theme = useTheme()
  useEffect(() => {
    if (Platform.OS !== 'android') return
    import('expo-navigation-bar')
      .then(({ setBackgroundColorAsync, setButtonStyleAsync }) => {
        setBackgroundColorAsync(theme.colors.surface)
        setButtonStyleAsync(theme.dark ? 'light' : 'dark')
      })
      .catch(() => {})
  }, [theme])
}

function BottomNavigationComponent<Route extends BottomNavigationRoute>(props: BottomNavigationProps<Route>) {
  const defaults = usePaperDefaults()
  useNavigationBarSync()
  return <PaperBottomNavigation {...(defaults.BottomNavigation as Partial<BottomNavigationProps<Route>>)} {...props} />
}

type BarProps = React.ComponentProps<typeof PaperBottomNavigation.Bar>

function Bar(props: BarProps) {
  useNavigationBarSync()
  return <PaperBottomNavigation.Bar {...props} />
}

BottomNavigationComponent.Bar = Bar
BottomNavigationComponent.SceneMap = PaperBottomNavigation.SceneMap

export const BottomNavigation = BottomNavigationComponent
