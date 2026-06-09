import { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Icon, TouchableRipple } from 'react-native-paper'

import { useBlur } from '../BlurContext'
import { Dialog } from './Dialog'

export type SeedColor = { label: string; value: string }

const DEFAULT_COLORS: SeedColor[] = [
  { label: 'Red', value: '#f44336' },
  { label: 'Coral', value: '#ff5722' },
  { label: 'Orange', value: '#ff6d00' },
  { label: 'Amber', value: '#ff9800' },
  { label: 'Yellow', value: '#fdd835' },
  { label: 'Lime', value: '#8bc34a' },
  { label: 'Emerald', value: '#4caf50' },
  { label: 'Teal', value: '#009688' },
  { label: 'Cyan', value: '#00bcd4' },
  { label: 'Blue', value: '#2196f3' },
  { label: 'Indigo', value: '#3f51b5' },
  { label: 'Deep Purple', value: '#673ab7' },
  { label: 'Violet', value: '#9c27b0' },
  { label: 'Magenta', value: '#d500f9' },
  { label: 'Pink', value: '#ec407a' },
  { label: 'Rose', value: '#e91e63' },
  { label: 'Brown', value: '#795548' },
  { label: 'Blue Grey', value: '#607d8b' }
]

type Props = {
  value: string
  onChange: (color: string) => void
  colors?: SeedColor[]
  blur?: boolean
}

export const ColorPicker = ({ value, onChange, colors = DEFAULT_COLORS, blur: blurProp }: Props) => {
  const blur = useBlur(blurProp)
  const [open, setOpen] = useState(false)

  return (
    <>
      <TouchableRipple onPress={() => setOpen(true)} style={[styles.trigger, { backgroundColor: value }]} borderless>
        <Icon source='palette' size={20} color='white' />
      </TouchableRipple>

      <Dialog blur={blur} visible={open} onDismiss={() => setOpen(false)}>
        <Dialog.Content>
          <View style={styles.swatches}>
            {colors.map(({ value: hex }) => (
              <TouchableOpacity
                key={hex}
                onPress={() => {
                  onChange(hex)
                  setOpen(false)
                }}
                style={[styles.swatch, { backgroundColor: hex }, value === hex && styles.selected]}
              >
                {value === hex && <Icon source='check' size={20} color='white' />}
              </TouchableOpacity>
            ))}
          </View>
        </Dialog.Content>
      </Dialog>
    </>
  )
}

const styles = StyleSheet.create({
  selected: { borderColor: 'white', borderWidth: 3 },
  swatch: { alignItems: 'center', borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 12 },
  trigger: { alignItems: 'center', alignSelf: 'flex-start', borderRadius: 24, height: 48, justifyContent: 'center', width: 48 }
})
