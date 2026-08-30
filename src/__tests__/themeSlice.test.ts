import { createThemeReducer, selectThemeAppearance, selectThemeBlur, selectThemeColor, selectThemeHarmony, themeActions, themeReducer, ThemeState } from '../redux/themeSlice'

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

  describe('createThemeReducer', () => {
    it('merges a partial initial state into defaultInitialState', () => {
      const reducer = createThemeReducer({ color: '#123456' })
      const state = reducer(undefined, { type: '@@INIT' })
      expect(state).toEqual({ appearance: 'system', blur: true, color: '#123456', harmony: 'split-complementary' })
    })

    it('falls back to the full defaultInitialState when called with no args', () => {
      const reducer = createThemeReducer()
      const state = reducer(undefined, { type: '@@INIT' })
      expect(state).toEqual(initial)
    })

    it('returned reducer still handles dispatched actions via reduce', () => {
      const reducer = createThemeReducer({ color: '#123456' })
      const state = reducer(undefined, themeActions.setAppearance('dark'))
      expect(state.appearance).toBe('dark')
      expect(state.color).toBe('#123456')
    })
  })

  describe('selectors', () => {
    const state: ThemeState = { appearance: 'dark', blur: false, color: '#abcdef', harmony: 'triadic' }

    it('selectThemeAppearance reads appearance', () => {
      expect(selectThemeAppearance(state)).toBe('dark')
    })

    it('selectThemeBlur reads blur', () => {
      expect(selectThemeBlur(state)).toBe(false)
    })

    it('selectThemeColor reads color', () => {
      expect(selectThemeColor(state)).toBe('#abcdef')
    })

    it('selectThemeHarmony reads harmony', () => {
      expect(selectThemeHarmony(state)).toBe('triadic')
    })
  })
})
