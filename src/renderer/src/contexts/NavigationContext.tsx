import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type AppPage = 'home' | 'playlist' | 'youtube' | 'downloads' | 'settings'

interface NavigationContextValue {
  activePage: AppPage
  setActivePage: (page: AppPage) => void
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

export function NavigationProvider({ children }: { children: ReactNode }): JSX.Element {
  const [activePage, setActivePage] = useState<AppPage>('home')
  const value = useMemo(() => ({ activePage, setActivePage }), [activePage])

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

export function useNavigation(): NavigationContextValue {
  const value = useContext(NavigationContext)

  if (!value) {
    throw new Error('useNavigation must be used inside NavigationProvider')
  }

  return value
}
