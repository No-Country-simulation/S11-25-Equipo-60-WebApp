"use client"

import { useState } from 'react';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserPlus, Loader2 } from 'lucide-react';

interface CreateEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/**
 * Dialog para crear nuevos usuarios EDITORES
 * NOTA: Los editores NO se crean con POST /app/editores/
 * Se crean como visitantes y luego el admin los asigna a una organización
 * 
 * Según la API:
 * - POST /app/visitantes/ - Crea visitante
 * - POST /app/administradores/ - Crea admin  
 * - NO HAY POST /app/editores/ (los editores son visitantes asignados a organizaciones)
 */
export function CreateEditorDialog({ open, onOpenChange, onSuccess }: CreateEditorDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      // IMPORTANTE: Los editores se crean como visitantes primero
      // Luego se asignan a organizaciones en la página de organizaciones
      await userService.createVisitante(formData);
      
      toast.success('Usuario creado exitosamente');
      toast.info('Ahora asígnalo a una organización para convertirlo en editor');
      
      setFormData({ username: '', email: '', password: '' });
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error creating editor:', error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.email?.[0] ||
        error.response?.data?.username?.[0] ||
        'Error al crear el usuario';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Crear Nuevo Editor
          </DialogTitle>
          <DialogDescription>
            Crea un usuario que podrá gestionar testimonios de organizaciones
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Nombre de usuario *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="usuario123"
              maxLength={150}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="usuario@ejemplo.com"
              maxLength={254}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Mínimo 8 caracteres"
              minLength={8}
              required
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Nota:</strong> Después de crear el usuario, asígnalo a una organización 
              en la sección de Organizaciones para que sea editor.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Usuario'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
