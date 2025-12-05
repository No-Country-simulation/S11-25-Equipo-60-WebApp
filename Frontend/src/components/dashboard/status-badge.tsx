import { Badge } from '@/components/ui/badge';
import type { EstadoTestimonio } from '@/interfaces';

interface StatusBadgeProps {
  estado: EstadoTestimonio;
  className?: string;
}

/**
 * Componente para mostrar el estado de un testimonio con colores y texto descriptivo
 * 
 * Estados:
 * - E: ESPERA (amarillo)
 * - A: APROBADO (verde)
 * - R: RECHAZADO (rojo)
 * - P: PUBLICADO (azul)
 * - B: BORRADOR (gris)
 * - O: OCULTO (gris oscuro)
 */
export const StatusBadge = ({ estado, className = '' }: StatusBadgeProps) => {
  const statusConfig: Record<EstadoTestimonio, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
    E: {
      label: 'En Espera',
      variant: 'outline',
      className: 'bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-400',
    },
    A: {
      label: 'Aprobado',
      variant: 'default',
      className: 'bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-400',
    },
    R: {
      label: 'Rechazado',
      variant: 'destructive',
      className: 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-400',
    },
    P: {
      label: 'Publicado',
      variant: 'default',
      className: 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400',
    },
    B: {
      label: 'Borrador',
      variant: 'secondary',
      className: 'bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-900 dark:text-gray-400',
    },
    O: {
      label: 'Oculto',
      variant: 'outline',
      className: 'bg-gray-100 text-gray-600 border-gray-400 dark:bg-gray-800 dark:text-gray-500',
    },
  };

  const config = statusConfig[estado] || statusConfig.E;

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className} ${className}`}
    >
      {config.label}
    </Badge>
  );
};
