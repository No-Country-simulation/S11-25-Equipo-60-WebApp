import { validateApiResponse, extractErrorMessage, type ApiError } from "@/core/errors";

/**
 * Helper genérico para ejecutar acciones asíncronas con manejo automático de estado
 * Implementa el patrón: set loading → execute → validate → set success/error
 * 
 * @param set - Función set del store de Zustand
 * @param action - Función asíncrona que retorna el resultado
 * @param context - Contexto de la operación para tracking de errores
 * @param onSuccess - Callback que transforma el resultado en el nuevo estado
 * @param onError - Callback opcional para manejar estado adicional en error
 * 
 * @example
 * ```typescript
 * fetchProfile: async (userId, role) => {
 *   await executeAsyncAction(
 *     set,
 *     () => getRoleEndpoints(role).fetch(userId),
 *     'fetchProfile',
 *     (profile) => ({ profile })
 *   )
 * }
 * ```
 */
export const executeAsyncAction = async <
  TResult,
  TState extends { isLoading: boolean; error: string | null }
>(
  set: (state: Partial<TState>) => void,
  action: () => Promise<TResult | ApiError>,
  context: string,
  onSuccess: (data: TResult) => Partial<TState>,
  onError?: (errorMessage: string) => Partial<TState>
): Promise<void> => {
  // 1. Iniciar loading
  set({ isLoading: true, error: null } as any);

  try {
    // 2. Ejecutar acción
    const result = await action();

    // 3. Validar respuesta
    const validatedData = validateApiResponse<TResult>(result, context);

    // 4. Actualizar estado con éxito
    set({
      ...onSuccess(validatedData),
      isLoading: false,
      error: null,
    } as any);

  } catch (error: any) {
    // 5. Manejar error
    const errorMessage = extractErrorMessage(error, 'Error desconocido', context);
    
    const errorState = onError 
      ? onError(errorMessage)
      : { error: errorMessage };

    set({
      ...errorState,
      isLoading: false,
    } as any);

    // 6. Re-lanzar error para que el caller pueda manejarlo
    throw new Error(errorMessage);
  }
};
