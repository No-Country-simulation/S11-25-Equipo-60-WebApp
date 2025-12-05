"use client"

import { useEffect, useState } from "react"
import { testimonialService } from "@/services/testimonial.service"
import { organizationService } from "@/services/organization.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    BarChart3,
    TrendingUp,
    Star,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Building2
} from "lucide-react"
import { toast } from "sonner"
import type { Organizacion, Testimonio } from "@/interfaces"

export default function EditorEstadisticasPage() {
    const [testimonials, setTestimonials] = useState<Testimonio[]>([])
    const [organizations, setOrganizations] = useState<Organizacion[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [testimonialsData, organizationsData] = await Promise.all([
                testimonialService.getMyTestimonials(),
                organizationService.getEditorOrganizations(),
            ])
            setTestimonials(testimonialsData)
            setOrganizations(organizationsData)
        } catch (error) {
            console.error('Error loading statistics:', error)
            toast.error("Error al cargar las estadísticas")
        } finally {
            setLoading(false)
        }
    }

    // Estadísticas generales
    const generalStats = {
        total: testimonials.length,
        pending: testimonials.filter(t => t.estado === 'E').length,
        approved: testimonials.filter(t => t.estado === 'A' || t.estado === 'P').length,
        rejected: testimonials.filter(t => t.estado === 'R').length,
        draft: testimonials.filter(t => t.estado === 'B').length,
        hidden: testimonials.filter(t => t.estado === 'O').length,
    }

    // Promedio de calificaciones
    const averageRating = testimonials.length > 0
        ? (testimonials.reduce((sum, t) => sum + parseFloat(t.ranking || "0"), 0) / testimonials.length).toFixed(1)
        : "0.0"

    // Estadísticas por organización
    const orgStats = organizations.map(org => {
        const orgTestimonials = testimonials.filter(t => t.organizacion === org.id)
        return {
            name: org.organizacion_nombre,
            total: orgTestimonials.length,
            pending: orgTestimonials.filter(t => t.estado === 'E').length,
            approved: orgTestimonials.filter(t => t.estado === 'A' || t.estado === 'P').length,
            avgRating: orgTestimonials.length > 0
                ? (orgTestimonials.reduce((sum, t) => sum + parseFloat(t.ranking || "0"), 0) / orgTestimonials.length).toFixed(1)
                : "0.0"
        }
    })

    // Testimonios por categoría
    const categoryStats = testimonials.reduce((acc, t) => {
        const category = t.categoria_nombre || 'Sin categoría'
        if (!acc[category]) {
            acc[category] = 0
        }
        acc[category]++
        return acc
    }, {} as Record<string, number>)

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
                    <BarChart3 className="h-8 w-8" />
                    Estadísticas
                </h1>
                <p className="text-muted-foreground mt-2">
                    Análisis de testimonios de tus organizaciones
                </p>
            </div>

            {/* Estadísticas Generales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Testimonios</CardTitle>
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {generalStats.total}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Todos los testimonios
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">En Espera</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                            {generalStats.pending}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Pendientes de revisar
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {generalStats.approved}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {((generalStats.approved / generalStats.total) * 100 || 0).toFixed(0)}% del total
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
                        <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                            {averageRating} ⭐
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            De 5.0 estrellas
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Distribución de Estados */}
            <Card>
                <CardHeader>
                    <CardTitle>Distribución por Estado</CardTitle>
                    <CardDescription>Cantidad de testimonios en cada estado</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                                <span className="text-sm">En Espera</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-2xl font-bold">{generalStats.pending}</span>
                                <div className="w-32 bg-muted rounded-full h-2">
                                    <div
                                        className="bg-yellow-500 h-2 rounded-full"
                                        style={{ width: `${(generalStats.pending / generalStats.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                <span className="text-sm">Aprobados</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-2xl font-bold">{generalStats.approved}</span>
                                <div className="w-32 bg-muted rounded-full h-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full"
                                        style={{ width: `${(generalStats.approved / generalStats.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                <span className="text-sm">Rechazados</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-2xl font-bold">{generalStats.rejected}</span>
                                <div className="w-32 bg-muted rounded-full h-2">
                                    <div
                                        className="bg-red-500 h-2 rounded-full"
                                        style={{ width: `${(generalStats.rejected / generalStats.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                                <span className="text-sm">Borradores</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-2xl font-bold">{generalStats.draft}</span>
                                <div className="w-32 bg-muted rounded-full h-2">
                                    <div
                                        className="bg-gray-500 h-2 rounded-full"
                                        style={{ width: `${(generalStats.draft / generalStats.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Estadísticas por Organización */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Por Organización
                        </CardTitle>
                        <CardDescription>Testimonios recibidos por organización</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {orgStats.map((org, index) => (
                                <div key={index} className="border-b pb-3 last:border-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium">{org.name}</span>
                                        <span className="text-2xl font-bold">{org.total}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                                            <div className="font-bold text-yellow-600">{org.pending}</div>
                                            <div className="text-muted-foreground">Pendientes</div>
                                        </div>
                                        <div className="text-center p-2 bg-green-50 dark:bg-green-950 rounded">
                                            <div className="font-bold text-green-600">{org.approved}</div>
                                            <div className="text-muted-foreground">Aprobados</div>
                                        </div>
                                        <div className="text-center p-2 bg-purple-50 dark:bg-purple-950 rounded">
                                            <div className="font-bold text-purple-600">{org.avgRating} ⭐</div>
                                            <div className="text-muted-foreground">Rating</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Testimonios por Categoría */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Por Categoría
                        </CardTitle>
                        <CardDescription>Distribución de testimonios por categoría</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(categoryStats)
                                .sort(([, a], [, b]) => b - a)
                                .map(([category, count], index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{category}</span>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xl font-bold">{count}</span>
                                            <div className="w-24 bg-muted rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full"
                                                    style={{ width: `${(count / generalStats.total) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
