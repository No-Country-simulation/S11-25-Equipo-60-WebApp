"use client"

import { useEffect, useState } from "react"
import { userService } from "@/services/user.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Users, Plus, Edit, Trash2, Shield, Eye } from "lucide-react"
import { toast } from "sonner"
import type { Usuario } from "@/interfaces"

export default function AdminUsuariosPage() {
    const [visitantes, setVisitantes] = useState<Usuario[]>([])
    const [editores, setEditores] = useState<Usuario[]>([])
    const [administradores, setAdministradores] = useState<Usuario[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState<{ user: Usuario; type: 'visitante' | 'editor' | 'admin' } | null>(null)
    const [deleteUser, setDeleteUser] = useState<{ id: number; type: 'visitante' | 'editor' | 'admin' } | null>(null)
    const [showCreateDialog, setShowCreateDialog] = useState<'visitante' | 'admin' | null>(null)
    const [formData, setFormData] = useState({ username: '', email: '', password: '' })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [visitantesData, editoresData, adminsData] = await Promise.all([
                userService.getVisitantes(),
                userService.getEditores(),
                userService.getAdministradores(),
            ])
            setVisitantes(visitantesData)
            setEditores(editoresData)
            setAdministradores(adminsData)
        } catch (error) {
            console.error('Error loading users:', error)
            toast.error("Error al cargar los usuarios")
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!showCreateDialog) return

        if (!formData.username || !formData.email || !formData.password) {
            toast.error("Todos los campos son obligatorios")
            return
        }

        if (formData.password.length < 8) {
            toast.error("La contraseña debe tener al menos 8 caracteres")
            return
        }

        try {
            if (showCreateDialog === 'visitante') {
                await userService.createVisitante(formData)
            } else {
                await userService.createAdministrador(formData)
            }
            toast.success("Usuario creado exitosamente")
            setFormData({ username: '', email: '', password: '' })
            setShowCreateDialog(null)
            loadData()
        } catch (error: any) {
            console.error('Error creating user:', error)
            const errorMessage = error.response?.data?.email?.[0] ||
                error.response?.data?.username?.[0] ||
                error.response?.data?.detail ||
                "Error al crear el usuario"
            toast.error(errorMessage)
        }
    }

    const handleDelete = async () => {
        if (!deleteUser) return

        try {
            if (deleteUser.type === 'visitante') {
                await userService.deleteVisitante(deleteUser.id)
            } else if (deleteUser.type === 'editor') {
                await userService.deleteEditor(deleteUser.id)
            } else {
                await userService.deleteAdministrador(deleteUser.id)
            }
            toast.success("Usuario eliminado exitosamente")
            setDeleteUser(null)
            loadData()
        } catch (error: any) {
            console.error('Error deleting user:', error)
            const errorMessage = error.response?.data?.detail || "Error al eliminar el usuario"
            toast.error(errorMessage)
        }
    }

    const UserTable = ({ users, type }: { users: Usuario[]; type: 'visitante' | 'editor' | 'admin' }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Fecha de Registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No hay usuarios registrados
                        </TableCell>
                    </TableRow>
                ) : (
                    users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.id}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                {user.date_joined ? new Date(user.date_joined).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                }) : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedUser({ user, type })}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => user.id && setDeleteUser({ id: user.id, type })}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    )

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
                        <Users className="h-8 w-8" />
                        Gestión de Usuarios
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Administra visitantes, editores y administradores
                    </p>
                </div>
            </div>

            <Tabs defaultValue="visitantes" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="visitantes">
                        Visitantes ({visitantes.length})
                    </TabsTrigger>
                    <TabsTrigger value="editores">
                        Editores ({editores.length})
                    </TabsTrigger>
                    <TabsTrigger value="administradores">
                        Administradores ({administradores.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="visitantes">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Visitantes</CardTitle>
                                <CardDescription>
                                    Usuarios con permisos básicos para crear testimonios
                                </CardDescription>
                            </div>
                            <Button onClick={() => setShowCreateDialog('visitante')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Crear Visitante
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <UserTable users={visitantes} type="visitante" />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="editores">
                    <Card>
                        <CardHeader>
                            <CardTitle>Editores</CardTitle>
                            <CardDescription>
                                Usuarios que gestionan testimonios de organizaciones
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UserTable users={editores} type="editor" />
                            <p className="text-sm text-muted-foreground mt-4">
                                💡 Los editores se crean manualmente en el backend. Contacta al equipo técnico.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="administradores">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Administradores</CardTitle>
                                <CardDescription>
                                    Usuarios con control total del sistema
                                </CardDescription>
                            </div>
                            <Button onClick={() => setShowCreateDialog('admin')}>
                                <Shield className="mr-2 h-4 w-4" />
                                Crear Administrador
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <UserTable users={administradores} type="admin" />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Dialog Crear Usuario */}
            <Dialog open={!!showCreateDialog} onOpenChange={() => setShowCreateDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Crear {showCreateDialog === 'visitante' ? 'Visitante' : 'Administrador'}
                        </DialogTitle>
                        <DialogDescription>
                            Completa los datos para crear un nuevo usuario
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="john_doe"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john@example.com"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Mínimo 8 caracteres"
                            />
                        </div>
                        <Button onClick={handleCreate} className="w-full">
                            Crear Usuario
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog Ver Detalles */}
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detalles del Usuario</DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">ID</p>
                                    <p className="text-lg font-semibold">{selectedUser.user.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Rol</p>
                                    <Badge>
                                        {selectedUser.type === 'visitante' && 'Visitante'}
                                        {selectedUser.type === 'editor' && 'Editor'}
                                        {selectedUser.type === 'admin' && 'Administrador'}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Username</p>
                                    <p className="text-base">{selectedUser.user.username}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                                    <p className="text-base">{selectedUser.user.email}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm font-medium text-muted-foreground">Fecha de Registro</p>
                                    <p className="text-base">
                                        {selectedUser.user.date_joined ? new Date(selectedUser.user.date_joined).toLocaleString('es-ES') : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Dialog Eliminar */}
            <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El usuario será eliminado permanentemente del sistema.
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
        </div>
    )
}
