/**
 * Zustand IndexedDB Storage Adapter
 * Conecta Zustand persist middleware con IndexedDB
 * Permite usar persist() de Zustand con IndexedDB en lugar de localStorage
 */

import { StateStorage } from 'zustand/middleware'
import { indexedDBManager } from './indexeddb.adapter'

/**
 * Storage adapter para Zustand persist middleware
 * 
 * @example
 * ```ts
 * import { persist, createJSONStorage } from 'zustand/middleware'
 * import { indexedDBStorage } from '@/store/adapters'
 * 
 * export const useStore = create(
 *   persist(
 *     (set) => ({ ... }),
 *     {
 *       name: 'my-store',
 *       storage: createJSONStorage(() => indexedDBStorage),
 *     }
 *   )
 * )
 * ```
 */
export const indexedDBStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const data = await indexedDBManager.getItem(name)
      return data ? JSON.stringify(data) : null
    } catch (error) {
      console.error(`[IndexedDB Storage] Error al obtener item "${name}":`, error)
      return null
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const parsedValue = JSON.parse(value)
      await indexedDBManager.setItem(name, parsedValue)
    } catch (error) {
      console.error(`[IndexedDB Storage] Error al guardar item "${name}":`, error)
      throw error
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      await indexedDBManager.removeItem(name)
    } catch (error) {
      console.error(`[IndexedDB Storage] Error al eliminar item "${name}":`, error)
      throw error
    }
  },
}
