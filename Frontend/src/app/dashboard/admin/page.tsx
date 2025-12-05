"use client"

import { useEffect, useState } from "react"
import { userService } from "@/services/user.service"
import { organizationService } from "@/services/organization.service"
import { categoryService} from "@/services/category.service"
import { testimonialService} from "@/services/testimonial.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Users, Building2, FolderKanban, FileText, Shield } from "lucide-react"
import { toast } from "sonner"
import type { Categoria, Organizacion, Testimonio, Usuario } from "@/interfaces"

export default function AdminDashboardPage() {
    const [visitantes, setVisitantes] = useState<Usuario[]>([])
    const [editores, setEditores] = useState<Usuario[]>([])
    const [administradores, setAdministradores] = useState<Usuario[]>([])
    const [organizations, setOrganizations] = useState<Organizacion[]>([])
    const [categories, setCategories] = useState<Categoria[]>([])
    const [testimonials, setTestimonials] = useState<Testimonio[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            // Admin NO puede usar /app/testimonios-totales/ (endpoint exclusivo de visitantes/editores)
            // Admin usa /app/organizacion/ para ver todas las organizaciones
            // Admin usa /app/testimonios/ para ver testimonios públicos aprobados (en la página de testimonios)
            const [
                visitantesData,
                editoresData,
                adminsData,
                orgsData,
                catsData
            ] = await Promise.all([
                userService.getVisitantes(),
                userService.getEditores(),
                userService.getAdministradores(),
                organizationService.getOrganizations(), // GET /app/organizacion/ - Admin ve TODAS las organizaciones
                categoryService.getCategories(),
            ])

            setVisitantes(visitantesData)
            setEditores(editoresData)
            setAdministradores(adminsData)
            setOrganizations(orgsData)
            setCategories(catsData)
            // Admin NO tiene acceso a /app/testimonios-totales/ en el dashboard principal
            // Para ver testimonios, admin debe ir a /dashboard/admin/testimonios
            setTestimonials([])
        } catch (error) {
            console.error('Error loading admin data:', error)
            toast.error("Error al cargar los datos del dashboard")
        } finally {
            setLoading(false)
        }
    }

    const totalUsers = visitantes.length + editores.length + administradores.length

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
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Shield className="h-8 w-8" />
                    Panel de Administración
                </h1>
                <p className="text-muted-foreground mt-2">
                    Control total del sistema Testimonial
                </p>
            </div>

            {/* Estadísticas Generales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <StatsCard
                    title="Total Usuarios"
                    value={totalUsers}
                    icon={Users}
                    description="Todos los usuarios del sistema"
                    className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900"
                />
                <StatsCard
                    title="Visitantes"
                    value={visitantes.length}
                    icon={Users}
                    description="Usuarios visitantes"
                    className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"
                />
                <StatsCard
                    title="Editores"
                    value={editores.length}
                    icon={Users}
                    description="Usuarios editores"
                    className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900"
                />
                <StatsCard
                    title="Organizaciones"
                    value={organizations.length}
                    icon={Building2}
                    description="Organizaciones registradas"
                    className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900"
                />
                <StatsCard
                    title="Categorías"
                    value={categories.length}
                    icon={FolderKanban}
                    description="Categorías creadas"
                    className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Usuarios por Rol */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribución de Usuarios</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                    <span className="text-sm font-medium">Visitantes</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl font-bold">{visitantes.length}</span>
                                    <div className="w-32 bg-muted rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full"
                                            style={{ width: `${(visitantes.length / totalUsers) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                    <span className="text-sm font-medium">Editores</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl font-bold">{editores.length}</span>
                                    <div className="w-32 bg-muted rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: `${(editores.length / totalUsers) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                                    <span className="text-sm font-medium">Administradores</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl font-bold">{administradores.length}</span>
                                    <div className="w-32 bg-muted rounded-full h-2">
                                        <div
                                            className="bg-purple-500 h-2 rounded-full"
                                            style={{ width: `${(administradores.length / totalUsers) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Actividad Reciente */}
                <Card>
                    <CardHeader>
                        <CardTitle>Actividad del Sistema</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Testimonios Totales</p>
                                    <p className="text-xs text-muted-foreground">En todo el sistema</p>
                                </div>
                                <div className="text-2xl font-bold">{testimonials.length}</div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Organizaciones Activas</p>
                                    <p className="text-xs text-muted-foreground">Con testimonios</p>
                                </div>
                                <div className="text-2xl font-bold">
                                    {new Set(testimonials.map(t => t.organizacion)).size}
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Categorías en Uso</p>
                                    <p className="text-xs text-muted-foreground">Con testimonios</p>
                                </div>
                                <div className="text-2xl font-bold">
                                    {new Set(testimonials.map(t => t.categoria)).size}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
