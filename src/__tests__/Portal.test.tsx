import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Appearance } from 'react-native'
import { MD3LightTheme, Portal, useTheme } from 'react-native-paper'

// The shared react-native-paper mock renders Portal as a plain passthrough, which hides the one
// thing this suite is about: in the real package, Portal content is NOT rendered where <Portal>
// sits. PortalHost's PortalManager renders it as a sibling of the host's own children, so it only
// sees contexts provided above that host. And the real PaperProvider renders a PortalHost around
// its children. This local mock reproduces both (see react-native-paper's
// src/components/Portal/PortalHost.tsx and src/core/PaperProvider.tsx), so a context provided
// below PaperProvider, but above a Portal, is invisible to that Portal's content exactly as it is
// on device.
jest.mock('react-native-paper', () => {
  const React = jest.requireActual<typeof import('react')>('react')
  // Resolves to the shared src/__mocks__/react-native-paper.ts via jest.config.cjs's
  // moduleNameMapper, not real Paper: only Portal, Portal.Host, Provider and Menu are overridden
  // on top of it.
  const sharedMock = jest.requireActual('react-native-paper')

  type Manager = { mount: (key: number, node: ReactNode) => void; unmount: (key: number) => void }
  const PortalContext = React.createContext<Manager | null>(null)

  const Host = ({ children }: { children?: ReactNode }) => {
    const [portals, setPortals] = React.useState<{ key: number; node: ReactNode }[]>([])
    const manager = React.useMemo<Manager>(
      () => ({
        mount: (key, node) => setPortals((prev) => [...prev.filter((portal) => portal.key !== key), { key, node }]),
        unmount: (key) => setPortals((prev) => prev.filter((portal) => portal.key !== key))
      }),
      []
    )
    return (
      <PortalContext.Provider value={manager}>
        {children}
        {portals.map(({ key, node }) => (
          <React.Fragment key={key}>{node}</React.Fragment>
        ))}
      </PortalContext.Provider>
    )
  }

  let nextKey = 0
  const MockPortal = ({ children }: { children?: ReactNode }) => {
    const manager = React.useContext(PortalContext)
    const [key] = React.useState(() => nextKey++)
    React.useEffect(() => {
      manager?.mount(key, children)
    }, [children, key, manager])
    React.useEffect(() => () => manager?.unmount(key), [key, manager])
    return null
  }

  // Paper's own Menu portals its children (the dropdown surface) while visible.
  const MockMenu = ({ anchor, children, visible }: { anchor?: ReactNode; children?: ReactNode; visible?: boolean }) => (
    <>
      {anchor}
      {visible ? <MockPortal>{children}</MockPortal> : null}
    </>
  )

  return {
    ...sharedMock,
    Menu: Object.assign(MockMenu, { Item: sharedMock.Menu.Item }),
    Portal: Object.assign(MockPortal, { Host }),
    Provider: ({ children }: { children?: ReactNode }) => <Host>{children}</Host>
  }
})

// See Dialog.test.tsx for why this one export is mocked locally instead of using the package's own mock.
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 })
}))

// The shared react-native mock's View renders no element, so the DOM can't show whether portal
// content ends up inside Provider's styled root View. This one renders a div, tagged when its
// style carries the marker the layout test below passes through Provider's `style` prop.
jest.mock('react-native', () => {
  const React = jest.requireActual<typeof import('react')>('react')
  return {
    ...jest.requireActual('react-native'),
    View: ({ children, style }: { children?: ReactNode; style?: unknown }) => {
      const isRoot = Array.isArray(style) && style.some((entry) => entry != null && typeof entry === 'object' && 'mockProviderRoot' in entry)
      return React.createElement('div', isRoot ? { 'data-testid': 'provider-root' } : null, children)
    }
  }
})

import { Dialog, type ReanimatedModule } from '../components/Dialog'
import { Menu } from '../components/Menu'
import { usePaperDefaults } from '../PaperDefaultsContext'
import { Provider, useBlurModule, useNavBarContext, useReanimatedModule } from '../ThemeProvider'

const mockAppearance = Appearance as jest.Mocked<typeof Appearance>
const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>

const fakeExpoBlur = {
  BlurView: ({ children }: { children?: ReactNode }) => <div data-testid='expo-blur'>{children}</div>
}
const fakeNavigationBar = { NavigationBar: { setStyle: jest.fn() } }
const fakeReanimated: ReanimatedModule = {
  View: ({ children }: { children?: ReactNode }) => <div>{children}</div>
}

beforeEach(() => {
  jest.clearAllMocks()
  mockAppearance.getColorScheme.mockReturnValue('light')
  mockAppearance.addChangeListener.mockReturnValue({ remove: jest.fn() })
  mockUseTheme.mockReturnValue(MD3LightTheme as any)
})

describe('Portal content under Provider', () => {
  it("sees every module and default Provider injects, not just Paper's own theme", () => {
    const Probe = () => {
      const defaults = usePaperDefaults()
      const { navigationBar, onNavBarChange } = useNavBarContext()
      return <span data-testid='probe'>{JSON.stringify({ blur: Boolean(useBlurModule()), defaults: Boolean(defaults.Button), navigationBar: Boolean(navigationBar), onNavBarChange: Boolean(onNavBarChange), reanimated: Boolean(useReanimatedModule()) })}</span>
    }

    render(
      <Provider defaults={{ Button: { mode: 'contained' } }} expoBlur={fakeExpoBlur} navigationBar={fakeNavigationBar} onNavBarChange={jest.fn()} reanimated={fakeReanimated}>
        <Portal>
          <Probe />
        </Portal>
      </Provider>
    )

    expect(JSON.parse(screen.getByTestId('probe').textContent ?? '')).toEqual({ blur: true, defaults: true, navigationBar: true, onNavBarChange: true, reanimated: true })
  })

  // Guards against only adding the host when a module is injected: defaults alone must still reach portals.
  it('sees PaperDefaults even when no module is injected', () => {
    const Probe = () => <span data-testid='probe'>{usePaperDefaults().Button?.mode ?? 'none'}</span>

    render(
      <Provider defaults={{ Button: { mode: 'contained' } }}>
        <Portal>
          <Probe />
        </Portal>
      </Provider>
    )

    expect(screen.getByTestId('probe').textContent).toBe('contained')
  })

  it('mounts portal content outside the styled root View, so Provider `style` never insets or clips it', () => {
    render(
      <Provider style={{ mockProviderRoot: true } as any}>
        <span data-testid='inline'>inline</span>
        <Portal>
          <span data-testid='portaled'>portaled</span>
        </Portal>
      </Provider>
    )

    const root = screen.getByTestId('provider-root')
    expect(root.contains(screen.getByTestId('inline'))).toBe(true)
    expect(root.contains(screen.getByTestId('portaled'))).toBe(false)
  })

  it("renders Dialog's surface through the injected expo-blur", () => {
    render(
      <Provider expoBlur={fakeExpoBlur}>
        <Dialog blur visible onDismiss={jest.fn()}>
          <span>content</span>
        </Dialog>
      </Provider>
    )

    expect(screen.getByTestId('expo-blur').textContent).toBe('content')
  })

  it("renders Menu's surface through the injected expo-blur", () => {
    render(
      <Provider expoBlur={fakeExpoBlur}>
        <Menu anchor={<span>anchor</span>} blur onDismiss={jest.fn()} visible>
          <span>item</span>
        </Menu>
      </Provider>
    )

    expect(screen.getByTestId('expo-blur').textContent).toBe('item')
  })
})
