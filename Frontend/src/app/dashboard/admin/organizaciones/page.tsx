"use client"

import { useEffect, useState } from "react"
import { organizationService } from "@/services/organization.service"
import { userService } from "@/services/user.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AssignUsersDialog } from "@/components"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Building2, Plus, Edit, Trash2, Key, Users, UserPlus } from "lucide-react"
import { toast } from "sonner"
import type { Organizacion } from "@/interfaces"

export default function AdminOrganizacionesPage() {
    const [organizations, setOrganizations] = useState<Organizacion[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState<Organizacion | null>(null)
    const [deleteOrg, setDeleteOrg] = useState<number | null>(null)
    const [assignUsers, setAssignUsers] = useState<{ org: Organizacion; type: 'editores' | 'visitantes' } | null>(null)
    const [formData, setFormData] = useState({ organizacion_nombre: '', dominio: '', editores: '' })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const data = await organizationService.getOrganizations()
            setOrganizations(data)
        } catch (error) {
            console.error('Error loading organizations:', error)
            toast.error("Error al cargar las organizaciones")
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!formData.organizacion_nombre || !formData.dominio) {
            toast.error("Nombre y dominio son obligatorios")
            return
        }

        try {
            const editoresArray = formData.editores
                ? formData.editores.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
                : []

            await organizationService.createOrganization({
                organizacion_nombre: formData.organizacion_nombre,
                dominio: formData.dominio,
                editores: editoresArray.length > 0 ? editoresArray : undefined
            })

            toast.success("Organización creada exitosamente")
            setFormData({ organizacion_nombre: '', dominio: '', editores: '' })
            setShowCreateDialog(false)
            loadData()
        } catch (error: any) {
            console.error('Error creating organization:', error)
            const errorMessage = error.response?.data?.detail ||
                error.response?.data?.organizacion_nombre?.[0] ||
                error.response?.data?.dominio?.[0] ||
                "Error al crear la organización"
            toast.error(errorMessage)
        }
    }

    const handleEdit = async () => {
        if (!showEditDialog) return

        try {
            await organizationService.updateOrganization(showEditDialog.id, {
                organizacion_nombre: formData.organizacion_nombre,
                dominio: formData.dominio
            })

            toast.success("Organización actualizada exitosamente")
            setShowEditDialog(null)
            setFormData({ organizacion_nombre: '', dominio: '', editores: '' })
            loadData()
        } catch (error: any) {
            console.error('Error updating organization:', error)
            toast.error(error.response?.data?.detail || "Error al actualizar la organización")
        }
    }

    const handleDelete = async () => {
        if (!deleteOrg) return

        try {
            await organizationService.deleteOrganization(deleteOrg)
            toast.success("Organización eliminada exitosamente")
            setDeleteOrg(null)
            loadData()
        } catch (error: any) {
            console.error('Error deleting organization:', error)
            toast.error(error.response?.data?.detail || "Error al eliminar la organización")
        }
    }

    const openEditDialog = (org: Organizacion) => {
        setFormData({
            organizacion_nombre: org.organizacion_nombre,
            dominio: org.dominio,
            editores: ''
        })
        setShowEditDialog(org)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Building2 className="h-8 w-8" />
                        Gestión de Organizaciones
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Administra las organizaciones del sistema
                    </p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Organización
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {organizations.map((org) => (
                    <Card key={org.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                {org.organizacion_nombre}
                            </CardTitle>
                            <CardDescription>{org.dominio}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {org.api_key && (
                                <div className="p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Key className="h-3 w-3" />
                                        <p className="text-xs font-medium">API Key</p>
                                    </div>
                                    <code className="text-xs break-all">{org.api_key}</code>
                                </div>
                            )}

                            {org.editores && (
                                <div className="p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Users className="h-3 w-3" />
                                        <p className="text-xs font-medium">Editores</p>
                                    </div>
                                    <p className="text-xs">{org.editores}</p>
                                </div>
                            )}

                            <div className="flex flex-col gap-2 pt-2">
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEditDialog(org)}
                                        className="flex-1"
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setDeleteOrg(org.id)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setAssignUsers({ org, type: 'editores' })}
                                        className="flex-1"
                                    >
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Agregar Editores
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setAssignUsers({ org, type: 'visitantes' })}
                                        className="flex-1"
                                    >
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Agregar Visitantes
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Dialog Crear */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nueva Organización</DialogTitle>
                        <DialogDescription>
                            Crea una nueva organización en el sistema
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="nombre">Nombre de la Organización *</Label>
                            <Input
                                id="nombre"
                                value={formData.organizacion_nombre}
                                onChange={(e) => setFormData({ ...formData, organizacion_nombre: e.target.value })}
                                placeholder="Mi Empresa"
                            />
                        </div>
                        <div>
                            <Label htmlFor="dominio">Dominio *</Label>
                            <Input
                                id="dominio"
                                value={formData.dominio}
                                onChange={(e) => setFormData({ ...formData, dominio: e.target.value })}
                                placeholder="miempresa.com"
                            />
                        </div>
                        <div>
                            <Label htmlFor="editores">IDs de Editores (opcional)</Label>
                            <Input
                                id="editores"
                                value={formData.editores}
                                onChange={(e) => setFormData({ ...formData, editores: e.target.value })}
                                placeholder="1, 2, 3"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Separa los IDs con comas
                            </p>
                        </div>
                        <Button onClick={handleCreate} className="w-full">
                            Crear Organización
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog Editar */}
            <Dialog open={!!showEditDialog} onOpenChange={() => setShowEditDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Organización</DialogTitle>
                        <DialogDescription>
                            Actualiza la información de la organización
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-nombre">Nombre de la Organización</Label>
                            <Input
                                id="edit-nombre"
                                value={formData.organizacion_nombre}
                                onChange={(e) => setFormData({ ...formData, organizacion_nombre: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-dominio">Dominio</Label>
                            <Input
                                id="edit-dominio"
                                value={formData.dominio}
                                onChange={(e) => setFormData({ ...formData, dominio: e.target.value })}
                            />
                        </div>
                        <Button onClick={handleEdit} className="w-full">
                            Guardar Cambios
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog Eliminar */}
            <AlertDialog open={!!deleteOrg} onOpenChange={() => setDeleteOrg(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente la organización y todos sus datos asociados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog Asignar Usuarios */}
            {assignUsers && (
                <AssignUsersDialog
                    organization={assignUsers.org}
                    type={assignUsers.type}
                    open={!!assignUsers}
                    onOpenChange={(open) => {
                        if (!open) setAssignUsers(null);
                    }}
                    onSuccess={async () => {
                        setAssignUsers(null)
                        await loadData()
                        toast.success(`${assignUsers.type === 'editores' ? 'Editores' : 'Visitantes'} asignados correctamente`)
                    }}
                />
            )}
        </div>
    )
}
