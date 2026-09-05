import { createContext, useContext, useState, type ReactNode } from 'react'

export interface CompareItem {
  id: string
  name: string
  kind: 'hosted' | 'operator'
  price: number | null
  destination: string
}

interface CompareCtx {
  selected: CompareItem[]
  add: (item: CompareItem) => void
  remove: (id: string) => void
  isSelected: (id: string) => boolean
  clear: () => void
}

const Ctx = createContext<CompareCtx>(null!)
export const useCompare = () => useContext(Ctx)

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<CompareItem[]>([])
  const add = (item: CompareItem) => {
    setSelected(prev => {
      if (prev.find(x => x.id === item.id)) return prev
      if (prev.length >= 3) return prev
      return [...prev, item]
    })
  }
  const remove = (id: string) => setSelected(prev => prev.filter(x => x.id !== id))
  const isSelected = (id: string) => selected.some(x => x.id === id)
  const clear = () => setSelected([])
  return <Ctx.Provider value={{ selected, add, remove, isSelected, clear }}>{children}</Ctx.Provider>
}
