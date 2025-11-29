"use client"

import { useAuthStore } from "@/store/auth.store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Building2, Users, Shield, PlusCircle, Clock } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
    const { user } = useAuthStore()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {user?.username || 'Usuario'}</h1>
                <p className="text-muted-foreground mt-2">
                    {user?.role === 'visitante' && 'Panel de cliente - Gestiona tus testimonios'}
                    {user?.role === 'editor' && 'Panel de editor - Gestiona testimonios de tus organizaciones'}
                    {user?.role === 'admin' && 'Panel de administración - Control total del sistema'}
                </p>
            </div>

            {/* Visitante */}
            {user?.role === 'visitante' && (
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
            )}

            {/* Editor */}
            {user?.role === 'editor' && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Mis Testimonios Personales
                            </CardTitle>
                            <CardDescription>Testimonios que creaste como cliente</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/dashboard/visitante/mis-testimonios">Ver Mis Testimonios</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Gestionar Testimonios
                            </CardTitle>
                            <CardDescription>Testimonios de tus organizaciones</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href="/dashboard/editor/testimonios">Gestionar</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Mis Organizaciones
                            </CardTitle>
                            <CardDescription>Organizaciones que gestionas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/dashboard/editor/organizaciones">Ver Organizaciones</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Admin */}
            {user?.role === 'admin' && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Usuarios
                            </CardTitle>
                            <CardDescription>Gestión de usuarios</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href="/dashboard/admin/usuarios">Gestionar</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Testimonios
                            </CardTitle>
                            <CardDescription>Ver testimonios públicos</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href="/dashboard/admin/testimonios">Ver Todos</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Organizaciones
                            </CardTitle>
                            <CardDescription>Gestión de organizaciones</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href="/dashboard/admin/organizaciones">Gestionar</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Panel Admin
                            </CardTitle>
                            <CardDescription>Vista completa del sistema</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/dashboard/admin">Ver Dashboard</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
