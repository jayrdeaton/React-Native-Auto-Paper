import { setNavigationBarStyle } from '../navigation-bar'

describe('setNavigationBarStyle', () => {
  it('does nothing when navigationBar is undefined', () => {
    expect(() => setNavigationBarStyle(undefined, true)).not.toThrow()
  })

  it('calls NavigationBar.setStyle with "light" when dark is true', () => {
    const setStyle = jest.fn()
    setNavigationBarStyle({ NavigationBar: { setStyle } }, true)
    expect(setStyle).toHaveBeenCalledWith('light')
  })

  it('calls NavigationBar.setStyle with "dark" when dark is false', () => {
    const setStyle = jest.fn()
    setNavigationBarStyle({ NavigationBar: { setStyle } }, false)
    expect(setStyle).toHaveBeenCalledWith('dark')
  })
})
