import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Position, GraphNode } from '@/types'

interface NavigationContextType {
  position: Position | null
  setPosition: (pos: Position) => void
  destination: GraphNode | null
  setDestination: (node: GraphNode | null) => void
  path: GraphNode[]
  setPath: (path: GraphNode[]) => void
  isCalibrated: boolean
  setIsCalibrated: (v: boolean) => void
}

const NavigationContext = createContext<NavigationContextType | null>(null)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [position, setPosition] = useState<Position | null>(null)
  const [destination, setDestination] = useState<GraphNode | null>(null)
  const [path, setPath] = useState<GraphNode[]>([])
  const [isCalibrated, setIsCalibrated] = useState(false)

  return (
    <NavigationContext.Provider value={{ position, setPosition, destination, setDestination, path, setPath, isCalibrated, setIsCalibrated }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider')
  return ctx
}
