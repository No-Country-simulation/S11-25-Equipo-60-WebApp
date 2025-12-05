"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { User, Mail, Loader2, Trash2, Save } from "lucide-react"
import { toast } from "sonner"
import { userService } from "@/services/user.service"
import { useAuthStore } from "@/store/auth.store"

export default function EditorPerfilPage() {
    const router = useRouter()
    const user = useAuthStore((state) => state.user)
    const logout = useAuthStore((state) => state.logout)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [profile, setProfile] = useState({
        username: "",
        email: "",
        profile_picture_url: "",
    })
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    })

    useEffect(() => {
        if (user?.id) {
            loadProfile()
        }
    }, [user])

    const loadProfile = async () => {
        if (!user?.id) return

        try {
            const data = await userService.getEditor(user.id)
            setProfile(data)
            setFormData({
                username: data.username,
                email: data.email,
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

    const handleSave = async () => {
        if (!user?.id) return

        // Validaciones
        if (!formData.username.trim()) {
            toast.error("El nombre de usuario es requerido")
            return
        }

        if (!formData.email.trim()) {
            toast.error("El email es requerido")
            return
        }

        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error("Las contraseñas no coinciden")
            return
        }

        if (formData.password && formData.password.length < 8) {
            toast.error("La contraseña debe tener al menos 8 caracteres")
            return
        }

        setSaving(true)
        try {
            const updateData: any = {
                username: formData.username,
                email: formData.email,
            }

            if (formData.password) {
                updateData.password = formData.password
            }

            await userService.updateEditor(user.id, updateData)
            toast.success("Perfil actualizado exitosamente")
            loadProfile()
            setFormData({ ...formData, password: "", confirmPassword: "" })
        } catch (error: any) {
            console.error('Error updating profile:', error)
            const errorMessage = error.response?.data?.detail ||
                error.response?.data?.username?.[0] ||
                error.response?.data?.email?.[0] ||
                "Error al actualizar el perfil"
            toast.error(errorMessage)
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (!user?.id) return

        setDeleting(true)
        try {
            await userService.deleteEditor(user.id)
            toast.success("Cuenta eliminada exitosamente")
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
                <p className="text-muted-foreground mt-2">
                    Gestiona tu información personal y configuración de cuenta
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Columna izquierda - Avatar y datos básicos */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Foto de Perfil</CardTitle>
                        <CardDescription>Tu avatar en la plataforma</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4">
                        <Avatar className="h-32 w-32">
                            <AvatarImage src={profile.profile_picture_url} />
                            <AvatarFallback className="text-3xl">
                                {getInitials(profile.username)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                            <p className="font-semibold">{profile.username}</p>
                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Columna derecha - Formulario */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Información Personal</CardTitle>
                        <CardDescription>
                            Actualiza tu información de perfil
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">
                                <User className="inline h-4 w-4 mr-2" />
                                Nombre de Usuario
                            </Label>
                            <Input
                                id="username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="Tu nombre de usuario"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">
                                <Mail className="inline h-4 w-4 mr-2" />
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="tu@email.com"
                            />
                        </div>

                        <div className="border-t pt-4 mt-4">
                            <h4 className="font-medium mb-4">Cambiar Contraseña (opcional)</h4>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Nueva Contraseña</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Mínimo 8 caracteres"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        placeholder="Repite la contraseña"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button onClick={handleSave} disabled={saving} className="flex-1">
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Guardar Cambios
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Zona de peligro */}
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
                            <Button variant="destructive" disabled={deleting}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar Cuenta
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminará permanentemente tu cuenta
                                    y todos los datos asociados.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeleteAccount}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {deleting ? "Eliminando..." : "Eliminar Cuenta"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
    )
}
