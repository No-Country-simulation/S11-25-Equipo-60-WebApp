"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { testimonialService } from "@/services/testimonial.service"
import { useTranslation } from "@/lib/i18n-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/dashboard/empty-state"
import { FileText, Plus, Edit, Trash2, Eye, AlertCircle } from "lucide-react"
import { toast } from "sonner"
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
import type { Testimonio } from "@/interfaces"

export default function MisTestimoniosPage() {
    const [testimonials, setTestimonials] = useState<Testimonio[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const router = useRouter()
    const { t } = useTranslation()

    useEffect(() => {
        loadTestimonials()
    }, [])

    const loadTestimonials = async () => {
        try {
            const data = await testimonialService.getMyTestimonials()
            setTestimonials(data)
        } catch (error: any) {
            console.error('Error loading testimonials:', error)
            if (error.response?.status === 401) {
                toast.error('No se pueden cargar tus testimonios. Por favor, contacta al soporte.')
            } else {
                toast.error('Error al cargar los testimonios')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return

        try {
            await testimonialService.deleteTestimonial(deleteId)
            toast.success("Testimonio eliminado exitosamente")
            loadTestimonials()
        } catch (error) {
            console.error('Error deleting testimonial:', error)
            toast.error("Error al eliminar el testimonio")
        } finally {
            setDeleteId(null)
        }
    }

    const getStatusBadge = (estado: string) => {
        const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
            'E': { label: t('testimonials.status.pending'), variant: 'secondary' },
            'A': { label: t('testimonials.status.approved'), variant: 'default' },
            'R': { label: t('testimonials.status.rejected'), variant: 'destructive' },
            'P': { label: t('testimonials.status.published'), variant: 'default' },
        }
        const status = statusMap[estado] || { label: estado, variant: 'outline' as const }
        return <Badge variant={status.variant}>{status.label}</Badge>
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
                    <h1 className="text-3xl font-bold tracking-tight">Mis Testimonios</h1>
                    <p className="text-muted-foreground mt-2">
                        Gestiona todos tus testimonios
                    </p>
                </div>
                <Button onClick={() => router.push('/dashboard/visitante/crear-testimonio')}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('testimonials.create')}
                </Button>
            </div>

            {testimonials.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <EmptyState
                            icon={FileText}
                            title={t('testimonials.empty.title')}
                            description={t('testimonials.empty.description')}
                            action={{
                                label: t('testimonials.create'),
                                onClick: () => router.push('/dashboard/visitante/crear-testimonio')
                            }}
                        />
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((testimonial) => (
                        <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1 flex-1">
                                        <CardTitle className="line-clamp-2">
                                            {testimonial.comentario.substring(0, 50)}...
                                        </CardTitle>
                                        <CardDescription>
                                            {new Date(testimonial.fecha_comentario || '').toLocaleDateString('es-ES')}
                                        </CardDescription>
                                    </div>
                                    {testimonial.estado && getStatusBadge(testimonial.estado)}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                    {testimonial.comentario}
                                </p>

                                {/* Mostrar feedback si el testimonio está rechazado */}
                                {testimonial.estado === 'R' && testimonial.feedback && (
                                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium text-destructive">Feedback del Editor</p>
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {testimonial.feedback}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push(`/dashboard/visitante/mis-testimonios/${testimonial.id}`)}
                                    >
                                        <Eye className="mr-2 h-4 w-4" />
                                        Ver
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push(`/dashboard/visitante/mis-testimonios/${testimonial.id}/editar`)}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        {t('common.edit')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setDeleteId(testimonial.id!)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        {t('common.delete')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El testimonio será eliminado permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            {t('common.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
