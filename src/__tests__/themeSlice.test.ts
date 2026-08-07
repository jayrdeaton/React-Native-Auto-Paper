import { themeActions, themeReducer, ThemeState } from '../redux/themeSlice'

const initial: ThemeState = { appearance: 'system', blur: true, color: '#6750a4', harmony: 'split-complementary' }

describe('themeSlice', () => {
  it('has correct initial state', () => {
    expect(themeReducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  it('setAppearance updates appearance', () => {
    const state = themeReducer(initial, themeActions.setAppearance('dark'))
    expect(state.appearance).toBe('dark')
    expect(state.color).toBe(initial.color)
  })

  it('setColor updates color', () => {
    const state = themeReducer(initial, themeActions.setColor('#ff0000'))
    expect(state.color).toBe('#ff0000')
    expect(state.appearance).toBe(initial.appearance)
  })

  it('setColor accepts an explicit { primary, secondary, tertiary } triad', () => {
    const triad = { primary: '#ff0000', secondary: '#00ff00', tertiary: '#0000ff' }
    const state = themeReducer(initial, themeActions.setColor(triad))
    expect(state.color).toEqual(triad)
  })

  it('initialize does a partial merge', () => {
    const state = themeReducer(initial, themeActions.initialize({ color: '#00ff00' }))
    expect(state.color).toBe('#00ff00')
    expect(state.appearance).toBe('system')
  })

  it('initialize can update both fields', () => {
    const state = themeReducer(initial, themeActions.initialize({ appearance: 'light', color: '#0000ff' }))
    expect(state.appearance).toBe('light')
    expect(state.color).toBe('#0000ff')
  })
})
