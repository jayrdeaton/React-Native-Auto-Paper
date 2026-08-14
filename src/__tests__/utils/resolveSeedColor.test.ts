import { resolveSeedColor } from '../../utils/resolveSeedColor'

describe('resolveSeedColor', () => {
  it('passes a plain string color straight through', () => {
    expect(resolveSeedColor('#6750a4')).toBe('#6750a4')
  })

  it("narrows a TriadicPalette down to its own primary", () => {
    expect(resolveSeedColor({ primary: '#ff0000', secondary: '#00ff00', tertiary: '#0000ff' })).toBe('#ff0000')
  })
})
