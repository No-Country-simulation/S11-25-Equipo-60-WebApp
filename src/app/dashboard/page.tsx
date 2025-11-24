"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/auth.store"
import { useTranslation } from "@/lib/i18n-provider"
import { testimonialService, Testimonio } from "@/services/testimonial.service"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react"

export default function DashboardPage() {
    const { user } = useAuthStore()
    const { t } = useTranslation()
    const [testimonials, setTestimonials] = useState<Testimonio[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user?.role === 'visitante') {
            loadTestimonials()
        } else {
            setLoading(false)
        }
    }, [user])

    const loadTestimonials = async () => {
        try {
            const data = await testimonialService.getMyTestimonials()
            setTestimonials(data)
        } catch (error) {
            console.error('Error loading testimonials:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStats = () => {
        const total = testimonials.length
        const pending = testimonials.filter(t => t.estado === 'E').length
        const approved = testimonials.filter(t => t.estado === 'A' || t.estado === 'P').length
        const rejected = testimonials.filter(t => t.estado === 'R').length

        return { total, pending, approved, rejected }
    }

    const stats = getStats()

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
                <h1 className="text-3xl font-bold tracking-tight">
                    {t('dashboard.welcomeMessage')}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {user?.role && `${t('roles.' + user.role)} - ${user.username || user.email}`}
                </p>
            </div>

            {user?.role === 'visitante' && (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatsCard
                            title={t('dashboard.stats.totalTestimonials')}
                            value={stats.total}
                            icon={FileText}
                            description="Total de testimonios creados"
                            className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"
                        />
                        <StatsCard
                            title={t('dashboard.stats.pending')}
                            value={stats.pending}
                            icon={Clock}
                            description="En revisión"
                            className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900"
                        />
                        <StatsCard
                            title={t('dashboard.stats.approved')}
                            value={stats.approved}
                            icon={CheckCircle}
                            description="Aprobados y publicados"
                            className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900"
                        />
                        <StatsCard
                            title={t('dashboard.stats.rejected')}
                            value={stats.rejected}
                            icon={XCircle}
                            description="Rechazados"
                            className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900"
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Últimos Testimonios</CardTitle>
                            <CardDescription>
                                Tus testimonios más recientes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {testimonials.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No tienes testimonios aún. ¡Crea tu primer testimonio!
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {testimonials.slice(0, 5).map((testimonial) => (
                                        <div
                                            key={testimonial.id}
                                            className="flex items-start justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium line-clamp-1">
                                                    {testimonial.comentario}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {new Date(testimonial.fecha_comentario || '').toLocaleDateString('es-ES')}
                                                </p>
                                            </div>
                                            <div className="ml-4">
                                                {testimonial.estado === 'E' && (
                                                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                        Pendiente
                                                    </span>
                                                )}
                                                {(testimonial.estado === 'A' || testimonial.estado === 'P') && (
                                                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                        Aprobado
                                                    </span>
                                                )}
                                                {testimonial.estado === 'R' && (
                                                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                        Rechazado
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {user?.role === 'editor' && (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                            Panel de Editor - Próximamente
                        </p>
                    </CardContent>
                </Card>
            )}

            {user?.role === 'admin' && (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                            Panel de Administrador - Próximamente
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
