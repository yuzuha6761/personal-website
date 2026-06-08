import { create } from 'zustand'
import type {GlobalStore} from '~types'

const useGlobalStore = create<GlobalStore>((set) => ({
  timestamp: 0,
  setTimestamp: (value: number) => set(() => ({ timestamp: value }))
}))

export default useGlobalStore
