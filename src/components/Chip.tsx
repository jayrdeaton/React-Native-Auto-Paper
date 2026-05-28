import { Chip as PaperChip, type ChipProps } from 'react-native-paper'

import { usePaperDefaults } from '../PaperDefaultsContext'

export function Chip(props: ChipProps) {
  const defaults = usePaperDefaults()
  return <PaperChip {...defaults.Chip} {...props} />
}
