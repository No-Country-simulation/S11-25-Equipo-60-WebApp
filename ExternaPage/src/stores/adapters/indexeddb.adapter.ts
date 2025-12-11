/**
 * IndexedDB Adapter
 * Administrador de IndexedDB para persistencia de datos del store
 * Solo se usa en: Zustand persistence adapter
 *
 * Organización:
 * - Base de datos: TestimonialAppDB
 * - Object Stores separados por dominio:
 *   - auth: Datos de autenticación
 *   - user: Datos del usuario
 *   - testimonial: Testimonios
 *   - organization: Organizaciones
 *   - category: Categorías
 */

const DB_NAME = 'ExternalAppDB';
const DB_VERSION = 1;

// Object stores por dominio
const STORE_NAMES = {
  AUTH: 'auth',
  USER: 'user',
  TESTIMONIAL: 'testimonial',
  ORGANIZATION: 'organization',
  CATEGORY: 'category',
} as const;

// Tipo para los nombres de stores válidos
type StoreName = typeof STORE_NAMES[keyof typeof STORE_NAMES];

// Interface genérica para datos almacenados
interface StoredData {
  id: string;
  [key: string]: any;
}

class IndexedDBManager {
  private readonly dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    // Solo inicializar en el navegador
    if (globalThis.window !== undefined && typeof indexedDB !== 'undefined') {
      // @ts-expect-error - Se asigna en constructor por necesidad de inicialización
      this.dbPromise = this.initDB();
    }
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB no está disponible'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(new Error(request.error?.message || 'Error al abrir IndexedDB'));
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Crear todos los object stores si no existen
        Object.values(STORE_NAMES).forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      };
    });
  }

  /**
   * Obtiene el nombre del store basado en la key
   * Mapea las keys de persistencia a sus respectivos stores
   */
  private getStoreName(key: string): StoreName {
    if (key.includes('auth')) return STORE_NAMES.AUTH;
    if (key.includes('user')) return STORE_NAMES.USER;
    if (key.includes('testimonial')) return STORE_NAMES.TESTIMONIAL;
    if (key.includes('organization')) return STORE_NAMES.ORGANIZATION;
    if (key.includes('category')) return STORE_NAMES.CATEGORY;

    // Por defecto usar auth para retrocompatibilidad
    return STORE_NAMES.AUTH;
  }

  async setItem(key: string, value: any): Promise<void> {
    if (!this.dbPromise) {
      console.warn('[IndexedDB] No disponible en el servidor');
      return;
    }

    const storeName = this.getStoreName(key);
    const db = await this.dbPromise;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put({ ...value, id: key });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(request.error?.message || 'Error al guardar item'));
    });
  }

  async getItem(key: string): Promise<StoredData | null> {
    if (!this.dbPromise) {
      console.warn('[IndexedDB] No disponible en el servidor');
      return null;
    }

    const storeName = this.getStoreName(key);
    const db = await this.dbPromise;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error(request.error?.message || 'Error al obtener item'));
    });
  }

  async removeItem(key: string): Promise<void> {
    if (!this.dbPromise) {
      console.warn('[IndexedDB] No disponible en el servidor');
      return;
    }

    const storeName = this.getStoreName(key);
    const db = await this.dbPromise;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(request.error?.message || 'Error al eliminar item'));
    });
  }

  async clear(): Promise<void> {
    if (!this.dbPromise) {
      console.warn('[IndexedDB] No disponible en el servidor');
      return;
    }

    const db = await this.dbPromise;

    // Limpiar todos los stores
    const clearPromises = Object.values(STORE_NAMES).map(storeName => {
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error(request.error?.message || 'Error al limpiar store'));
      });
    });

    await Promise.all(clearPromises);
  }
}

export const indexedDBManager = new IndexedDBManager();
