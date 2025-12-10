"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, PlusCircle } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
    const { user } = useAuthStore()
    const router = useRouter()

    useEffect(() => {
        // Redirigir automáticamente según el rol
        if (user?.role === 'admin') {
            router.replace('/dashboard/admin')
        } else if (user?.role === 'editor') {
            router.replace('/dashboard/editor')
        }
        // Si es visitante, se queda en /dashboard y muestra su contenido
    }, [user?.role, router])

    // Mientras redirige, mostrar loading
    if (user?.role === 'admin' || user?.role === 'editor') {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Contenido para visitantes
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {user?.username || 'Usuario'}</h1>
                <p className="text-muted-foreground mt-2">
                    Panel de cliente - Gestiona tus testimonios
                </p>
            </div>

            {/* Visitante */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Mis Testimonios
                            </CardTitle>
                            <CardDescription>Ver y gestionar tus testimonios</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href="/dashboard/visitante/mis-testimonios">Ver Testimonios</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PlusCircle className="h-5 w-5" />
                                Crear Testimonio
                            </CardTitle>
                            <CardDescription>Comparte tu experiencia</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href="/dashboard/visitante/crear-testimonio">Crear Nuevo</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
        </div>
    )
}
