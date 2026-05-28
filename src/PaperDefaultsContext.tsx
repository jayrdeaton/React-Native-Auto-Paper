import { createContext, useContext } from 'react'
import type { ButtonProps, ChipProps, FABProps, IconButtonProps, TextInputProps } from 'react-native-paper'

export type PaperDefaults = {
  Button?: Partial<ButtonProps>
  Chip?: Partial<ChipProps>
  FAB?: Partial<FABProps>
  IconButton?: Partial<IconButtonProps>
  TextInput?: Partial<TextInputProps>
}

export const PaperDefaultsContext = createContext<PaperDefaults>({})

export function usePaperDefaults(): PaperDefaults {
  return useContext(PaperDefaultsContext)
}
