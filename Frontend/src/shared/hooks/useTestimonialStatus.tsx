import { useState } from 'react';
import { testimonialService } from '@/services/testimonial.service';
import { toast } from 'sonner';
import type { EstadoTestimonio } from '@/interfaces';

interface UseTestimonialStatusReturn {
  changeStatus: (testimonialId: number, newStatus: EstadoTestimonio) => Promise<void>;
  isChanging: boolean;
  error: string | null;
}

/**
 * Hook para cambiar el estado de testimonios
 * Solo editores pueden cambiar el estado de testimonios de SU organización
 * 
 * Estados disponibles:
 * - E: ESPERA (default al crear)
 * - A: APROBADO (testimonio visible públicamente)
 * - R: RECHAZADO (testimonio rechazado)
 * - P: PUBLICADO (testimonio publicado)
 * - B: BORRADOR (testimonio en borrador)
 * - O: OCULTO (testimonio oculto)
 */
export const useTestimonialStatus = (): UseTestimonialStatusReturn => {
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeStatus = async (testimonialId: number, newStatus: EstadoTestimonio) => {
    setIsChanging(true);
    setError(null);

    try {
      await testimonialService.changeTestimonialStatus(testimonialId, newStatus);
      
      // Mensajes personalizados según el estado
      const statusMessages: Record<EstadoTestimonio, string> = {
        E: 'Testimonio marcado como En Espera',
        A: 'Testimonio Aprobado exitosamente',
        R: 'Testimonio Rechazado',
        P: 'Testimonio Publicado',
        B: 'Testimonio guardado como Borrador',
        O: 'Testimonio Oculto',
      };

      toast.success(statusMessages[newStatus]);
    } catch (err: any) {
      const errorMessage = 
        err.response?.data?.detail || 
        err.response?.data?.estado?.[0] ||
        'Error al cambiar el estado del testimonio';
      
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsChanging(false);
    }
  };

  return {
    changeStatus,
    isChanging,
    error,
  };
};
