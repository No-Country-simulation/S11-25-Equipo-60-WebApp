"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Loader2, Trash2, Save, Shield } from "lucide-react"
import { toast } from "sonner"
import { userService } from "@/services/user.service"
import { useAuthStore } from "@/store/auth.store"

export default function PerfilPage() {
    const router = useRouter()
    const user = useAuthStore((state) => state.user)
    const logout = useAuthStore((state) => state.logout)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [profile, setProfile] = useState({
        username: "",
        email: "",
    })
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    })

    useEffect(() => {
        if (user?.id && user?.role) {
            loadProfile()
        } else {
            setLoading(false)
        }
    }, [user])

    const loadProfile = async () => {
        if (!user?.id || !user?.role) return

        try {
            let data
            // Cargar perfil según el rol del usuario
            switch (user.role) {
                case 'visitante':
                    data = await userService.getVisitante(user.id)
                    break
                case 'editor':
                    data = await userService.getEditor(user.id)
                    break
                case 'admin':
                    data = await userService.getAdministrador(user.id)
                    break
                default:
                    throw new Error('Rol de usuario no válido')
            }

            setProfile({
                username: data.username || "",
                email: data.email || "",
            })
            setFormData({
                username: data.username || "",
                email: data.email || "",
                password: "",
                confirmPassword: "",
            })
        } catch (error) {
            console.error('Error loading profile:', error)
            toast.error("Error al cargar el perfil")
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateProfile = async () => {
        if (!user?.id || !user?.role) {
            toast.error("Usuario no válido")
            return
        }

        // Validaciones
        if (!formData.username.trim()) {
            toast.error("El nombre de usuario es requerido")
            return
        }

        if (!formData.email.trim() || !formData.email.includes('@')) {
            toast.error("El email es inválido")
            return
        }

        // Si está cambiando contraseña, validar
        if (formData.password) {
            if (formData.password.length < 8) {
                toast.error("La contraseña debe tener al menos 8 caracteres")
                return
            }
            if (formData.password !== formData.confirmPassword) {
                toast.error("Las contraseñas no coinciden")
                return
            }
        }

        setSaving(true)
        try {
            const updateData: any = {
                username: formData.username,
                email: formData.email,
            }

            // Solo incluir contraseña si se proporcionó
            if (formData.password) {
                updateData.password = formData.password
            }

            // Actualizar según el rol
            switch (user.role) {
                case 'visitante':
                    await userService.updateVisitante(user.id, updateData)
                    break
                case 'editor':
                    await userService.updateEditor(user.id, updateData)
                    break
                case 'admin':
                    await userService.updateAdministrador(user.id, updateData)
                    break
            }

            toast.success("Perfil actualizado exitosamente")
            
            // Limpiar campos de contraseña
            setFormData({
                ...formData,
                password: "",
                confirmPassword: "",
            })

            // Recargar perfil
            loadProfile()
        } catch (error: any) {
            console.error('Error updating profile:', error)
            const errorMessage = error.response?.data?.detail ||
                error.response?.data?.email?.[0] ||
                error.response?.data?.username?.[0] ||
                "Error al actualizar el perfil"
            toast.error(errorMessage)
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (!user?.id || !user?.role) {
            toast.error("Usuario no válido")
            return
        }

        setDeleting(true)
        try {
            // Eliminar según el rol
            switch (user.role) {
                case 'visitante':
                    await userService.deleteVisitante(user.id)
                    break
                case 'editor':
                    await userService.deleteEditorAccount(user.id)
                    break
                case 'admin':
                    await userService.deleteAdministrador(user.id)
                    break
            }

            toast.success("Cuenta eliminada exitosamente")
            
            // Cerrar sesión y redirigir
            logout()
            router.push("/login")
        } catch (error: any) {
            console.error('Error deleting account:', error)
            const errorMessage = error.response?.data?.detail || "Error al eliminar la cuenta"
            toast.error(errorMessage)
            setDeleting(false)
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
    }

    const getRoleBadge = () => {
        const roleConfig = {
            visitante: { label: 'Visitante', color: 'bg-blue-500' },
            editor: { label: 'Editor', color: 'bg-purple-500' },
            admin: { label: 'Administrador', color: 'bg-red-500' },
        }

        const config = roleConfig[user?.role as keyof typeof roleConfig] || roleConfig.visitante

        return (
            <Badge className={`${config.color} text-white`}>
                <Shield className="mr-1 h-3 w-3" />
                {config.label}
            </Badge>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) {
        router.push("/login")
        return null
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
                <p className="text-muted-foreground mt-2">
                    Gestiona tu información personal y configuración de cuenta
                </p>
            </div>

            <div className="grid gap-6">
                {/* Información del Usuario */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información Personal</CardTitle>
                        <CardDescription>
                            Actualiza tu información básica de usuario
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Avatar y Rol */}
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl">
                                    {getInitials(profile.username || user.username || 'U')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h3 className="text-xl font-semibold">{profile.username}</h3>
                                {getRoleBadge()}
                            </div>
                        </div>

                        {/* Formulario */}
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="username">Nombre de Usuario</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="johndoe"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleUpdateProfile}
                                disabled={saving}
                                className="w-full"
                            >
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2 h-4 w-4" />
                                Guardar Cambios
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Cambiar Contraseña */}
                <Card>
                    <CardHeader>
                        <CardTitle>Cambiar Contraseña</CardTitle>
                        <CardDescription>
                            Actualiza tu contraseña (opcional)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="password">Nueva Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Mínimo 8 caracteres"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Repite la contraseña"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Deja estos campos vacíos si no deseas cambiar tu contraseña
                        </p>
                    </CardContent>
                </Card>

                {/* Zona de Peligro */}
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
                        <CardDescription>
                            Acciones irreversibles en tu cuenta
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar Cuenta
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Se eliminará permanentemente tu cuenta
                                        y todos los datos asociados a ella.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDeleteAccount}
                                        disabled={deleting}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Sí, eliminar mi cuenta
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
