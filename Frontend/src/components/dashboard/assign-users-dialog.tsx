"use client"

import { useState, useEffect } from 'react';
import { organizationService } from '@/services/organization.service';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { UserPlus, Users, Loader2 } from 'lucide-react';
import type { Usuario, Organizacion } from '@/interfaces';

interface AssignUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: Organizacion | null;
  type: 'editores' | 'visitantes';
  onSuccess: () => void;
}

/**
 * Dialog para asignar editores o visitantes a una organización
 * 
 * Endpoints:
 * - POST /app/organizacion/{id}/agregar-editores/
 * - POST /app/organizacion/{id}/agregar-visitantes/
 */
export function AssignUsersDialog({ open, onOpenChange, organization, type, onSuccess }: AssignUsersDialogProps) {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (open && organization) {
      loadUsers();
    }
  }, [open, organization, type]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = type === 'editores' 
        ? await userService.getEditores()
        : await userService.getVisitantes();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleToggleUser = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (!organization) return;
    
    if (selectedUsers.length === 0) {
      toast.error('Selecciona al menos un usuario');
      return;
    }

    setLoading(true);
    try {
      if (type === 'editores') {
        await organizationService.addEditors(organization.id, selectedUsers);
        toast.success(`${selectedUsers.length} editor(es) agregado(s) exitosamente`);
      } else {
        await organizationService.addVisitantes(organization.id, selectedUsers);
        toast.success(`${selectedUsers.length} visitante(s) agregado(s) exitosamente`);
      }

      setSelectedUsers([]);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error assigning users:', error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.[type]?.[0] ||
        `Error al asignar ${type}`;
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
            <Users className="h-5 w-5" />
            Agregar {type === 'editores' ? 'Editores' : 'Visitantes'}
          </DialogTitle>
          <DialogDescription>
            Organización: <strong>{organization?.organizacion_nombre}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay {type} disponibles</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-muted-foreground">
                Selecciona los usuarios que deseas agregar ({selectedUsers.length} seleccionados)
              </div>

              <ScrollArea className="h-[300px] rounded-md border p-4">
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={selectedUsers.includes(user.id!)}
                        onCheckedChange={() => handleToggleUser(user.id!)}
                      />
                      <Label
                        htmlFor={`user-${user.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading || selectedUsers.length === 0}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Agregando...
                </>
              ) : (
                `Agregar ${selectedUsers.length} ${type}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
