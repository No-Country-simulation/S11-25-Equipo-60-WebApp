"use client"

import { useEffect, useState } from "react"
import { testimonialService, Testimonio } from "@/services/testimonial.service"
import { organizationService, Organizacion } from "@/services/organization.service"
import { useTranslation } from "@/lib/i18n-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle, Clock, XCircle, Building2 } from "lucide-react"
import { toast } from "sonner"

export default function EditorDashboardPage() {
    const [testimonials, setTestimonials] = useState<Testimonio[]>([])
    const [organizations, setOrganizations] = useState<Organizacion[]>([])
    const [loading, setLoading] = useState(true)
    const { t } = useTranslation()

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
        } catch (error: any) {
            console.error('Error loading data:', error)
            toast.error("Error al cargar los datos del dashboard")
        } finally {
            setLoading(false)
        }
    }

    // Estadísticas
    const stats = {
        total: testimonials.length,
        pending: testimonials.filter(t => t.estado === 'E').length,
        approved: testimonials.filter(t => t.estado === 'A' || t.estado === 'P').length,
        rejected: testimonials.filter(t => t.estado === 'R').length,
        organizations: organizations.length,
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
                <h1 className="text-3xl font-bold tracking-tight">Dashboard de Editor</h1>
                <p className="text-muted-foreground mt-2">
                    Gestiona los testimonios de tus organizaciones
                </p>
            </div>

            {/* Estadísticas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <StatsCard
                    title="Total Testimonios"
                    value={stats.total}
                    icon={FileText}
                    description="Todos los testimonios"
                />
                <StatsCard
                    title="En Espera"
                    value={stats.pending}
                    icon={Clock}
                    description="Pendientes de revisar"
                    trend={{ value: stats.pending, isPositive: false }}
                />
                <StatsCard
                    title="Aprobados"
                    value={stats.approved}
                    icon={CheckCircle}
                    description="Testimonios aprobados"
                    trend={{ value: stats.approved, isPositive: true }}
                />
                <StatsCard
                    title="Rechazados"
                    value={stats.rejected}
                    icon={XCircle}
                    description="Testimonios rechazados"
                />
                <StatsCard
                    title="Organizaciones"
                    value={stats.organizations}
                    icon={Building2}
                    description="Organizaciones que gestiono"
                />
            </div>

            {/* Organizaciones */}
            <Card>
                <CardHeader>
                    <CardTitle>Mis Organizaciones</CardTitle>
                    <CardDescription>
                        Organizaciones a las que perteneces como editor
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {organizations.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No perteneces a ninguna organización aún</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {organizations.map((org) => (
                                <Card key={org.id}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{org.organizacion_nombre}</CardTitle>
                                        <CardDescription>{org.dominio}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                {testimonials.filter(t => t.organizacion === org.id).length} testimonios
                                            </span>
                                            <Badge variant="outline">Editor</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Testimonios recientes */}
            <Card>
                <CardHeader>
                    <CardTitle>Testimonios Recientes</CardTitle>
                    <CardDescription>
                        Últimos testimonios recibidos en tus organizaciones
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {testimonials.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No hay testimonios aún</p>
                    ) : (
                        <div className="space-y-4">
                            {testimonials.slice(0, 5).map((testimonial) => {
                                const org = organizations.find(o => o.id === testimonial.organizacion)
                                return (
                                    <div key={testimonial.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium line-clamp-2">
                                                {testimonial.comentario}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">
                                                    {org?.organizacion_nombre}
                                                </span>
                                                <span className="text-xs text-muted-foreground">•</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(testimonial.fecha_comentario || '').toLocaleDateString('es-ES')}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge variant={
                                            testimonial.estado === 'A' || testimonial.estado === 'P' ? 'default' :
                                            testimonial.estado === 'E' ? 'secondary' : 'destructive'
                                        }>
                                            {testimonial.estado === 'E' && 'En espera'}
                                            {testimonial.estado === 'A' && 'Aprobado'}
                                            {testimonial.estado === 'R' && 'Rechazado'}
                                            {testimonial.estado === 'P' && 'Publicado'}
                                            {testimonial.estado === 'B' && 'Borrador'}
                                            {testimonial.estado === 'O' && 'Oculto'}
                                        </Badge>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
