"use client"

import { useState } from 'react';
import { testimonialService } from '@/services/testimonial.service';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { RefreshCw, Loader2, AlertCircle, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';
import type { Testimonio } from '@/interfaces';

interface ChangeStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonio: Testimonio | null;
  onSuccess: () => void;
}

const STATUS_INFO = {
  'E': { 
    label: 'En Espera', 
    icon: Clock,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    description: 'El testimonio está esperando revisión'
  },
  'A': { 
    label: 'Aprobado', 
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950',
    description: 'El testimonio ha sido aprobado para publicación'
  },
  'R': { 
    label: 'Rechazado', 
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950',
    description: 'El testimonio ha sido rechazado'
  },
  'P': { 
    label: 'Publicado', 
    icon: FileText,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    description: 'El testimonio está publicado públicamente'
  },
  'B': { 
    label: 'Bloqueado', 
    icon: AlertCircle,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    description: 'El testimonio ha sido bloqueado'
  },
  'O': { 
    label: 'Oculto', 
    icon: AlertCircle,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-950',
    description: 'El testimonio está oculto temporalmente'
  }
} as const;

export function ChangeStatusDialog({ open, onOpenChange, testimonio, onSuccess }: ChangeStatusDialogProps) {
  const [newStatus, setNewStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!testimonio || !newStatus) {
      toast.error('Selecciona un nuevo estado');
      return;
    }

    if (!testimonio.id) {
      toast.error('Testimonio inválido');
      return;
    }

    if (newStatus === testimonio.estado) {
      toast.error('El testimonio ya tiene ese estado');
      return;
    }

    setLoading(true);
    try {
      await testimonialService.changeTestimonialStatus(
        testimonio.id, 
        newStatus as 'E' | 'A' | 'R' | 'P' | 'B' | 'O'
      );
      
      toast.success(`Estado cambiado a: ${STATUS_INFO[newStatus as keyof typeof STATUS_INFO].label}`);
      setNewStatus('');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error changing status:', error);
      const errorMessage = error.response?.data?.detail || 'Error al cambiar el estado';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!testimonio) return null;

  const CurrentIcon = STATUS_INFO[testimonio.estado as keyof typeof STATUS_INFO]?.icon || Clock;
  const currentInfo = STATUS_INFO[testimonio.estado as keyof typeof STATUS_INFO];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Cambiar Estado del Testimonio
          </DialogTitle>
          <DialogDescription>
            Cambia el estado del testimonio según su situación actual
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Estado Actual */}
          <div className={`p-4 rounded-lg border ${currentInfo?.bgColor}`}>
            <Label className="text-xs font-medium text-muted-foreground">Estado Actual</Label>
            <div className="flex items-center gap-2 mt-2">
              <CurrentIcon className={`h-5 w-5 ${currentInfo?.color}`} />
              <span className={`font-semibold ${currentInfo?.color}`}>
                {currentInfo?.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{currentInfo?.description}</p>
          </div>

          {/* Selector de Nuevo Estado */}
          <div className="space-y-2">
            <Label htmlFor="newStatus">Nuevo Estado *</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger id="newStatus">
                <SelectValue placeholder="Selecciona un estado..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_INFO).map(([key, info]) => {
                  const Icon = info.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${info.color}`} />
                        <span>{info.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {newStatus && (
              <p className="text-xs text-muted-foreground">
                {STATUS_INFO[newStatus as keyof typeof STATUS_INFO]?.description}
              </p>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !newStatus}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cambiando...
                </>
              ) : (
                'Cambiar Estado'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
