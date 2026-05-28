import { IconButton as PaperIconButton, type IconButtonProps } from 'react-native-paper'

import { usePaperDefaults } from '../PaperDefaultsContext'

export function IconButton(props: IconButtonProps) {
  const defaults = usePaperDefaults()
  return <PaperIconButton {...defaults.IconButton} {...props} />
}
