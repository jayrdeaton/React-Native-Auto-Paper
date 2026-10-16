import { StatusBar } from 'react-native'
import { Appbar as PaperAppbar, type AppbarHeaderProps, useTheme } from 'react-native-paper'

import { usePaperDefaults } from '../PaperDefaultsContext'
import { useStatusBarEnabled } from '../ThemeProvider'

function Header({ style, ...props }: AppbarHeaderProps) {
  const defaults = usePaperDefaults()
  const theme = useTheme()
  // Off under <Provider statusBar={false}>, an app that sets the status bar per screen.
  const statusBar = useStatusBarEnabled()
  return (
    <>
      {statusBar && <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />}
      <PaperAppbar.Header {...defaults.AppbarHeader} {...props} style={style} />
    </>
  )
}

export const Appbar = {
  Header,
  Content: PaperAppbar.Content,
  Action: PaperAppbar.Action,
  BackAction: PaperAppbar.BackAction
}
