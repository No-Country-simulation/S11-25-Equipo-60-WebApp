"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { testimonialService } from "@/services/testimonial.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2, Calendar, Building2, Tag, Star, AlertCircle } from "lucide-react"
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

export default function VerTestimonioPage() {
    const [testimonial, setTestimonial] = useState<Testimonio | null>(null)
    const [loading, setLoading] = useState(true)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const router = useRouter()
    const params = useParams()
    const id = parseInt(params.id as string)

    useEffect(() => {
        loadTestimonial()
    }, [id])

    const loadTestimonial = async () => {
        try {
            const data = await testimonialService.getTestimonial(id)
            setTestimonial(data)
        } catch (error) {
            console.error('Error loading testimonial:', error)
            toast.error("Error al cargar el testimonio")
            router.push('/dashboard/visitante/mis-testimonios')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        try {
            await testimonialService.deleteTestimonial(id)
            toast.success("Testimonio eliminado exitosamente")
            router.push('/dashboard/visitante/mis-testimonios')
        } catch (error) {
            console.error('Error deleting testimonial:', error)
            toast.error("Error al eliminar el testimonio")
        }
    }

    const getStatusBadge = (estado: string) => {
        const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
            'E': { label: 'En revisión', variant: 'secondary' },
            'A': { label: 'Aprobado', variant: 'default' },
            'R': { label: 'Rechazado', variant: 'destructive' },
            'P': { label: 'Publicado', variant: 'default' },
            'B': { label: 'Bloqueado', variant: 'destructive' },
            'O': { label: 'Oculto', variant: 'outline' },
        }
        const status = statusMap[estado] || { label: estado, variant: 'outline' as const }
        return <Badge variant={status.variant}>{status.label}</Badge>
    }

    const renderStars = (rating: string) => {
        const numRating = parseFloat(rating)
        return (
            <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        className={`h-5 w-5 ${
                            i < numRating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                        }`}
                    />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                    ({rating})
                </span>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!testimonial) {
        return null
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Ver Testimonio</h1>
                        <p className="text-muted-foreground mt-2">
                            Detalles completos del testimonio
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/dashboard/visitante/mis-testimonios/${id}/editar`)}
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl">Testimonio</CardTitle>
                            {testimonial.estado && getStatusBadge(testimonial.estado)}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Feedback de rechazo */}
                    {testimonial.estado === 'R' && testimonial.feedback && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                                <div className="space-y-2 flex-1">
                                    <h3 className="text-sm font-semibold text-destructive">
                                        Feedback del Editor
                                    </h3>
                                    <p className="text-sm text-foreground/80">
                                        {testimonial.feedback}
                                    </p>
                                    <p className="text-xs text-muted-foreground italic">
                                        💡 Puedes editar tu testimonio considerando esta retroalimentación y volver a enviarlo.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Feedback del editor si está rechazado */}
                    {testimonial.estado === 'R' && testimonial.feedback && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                                <div className="space-y-1 flex-1">
                                    <h3 className="text-sm font-semibold text-destructive">
                                        Feedback del Editor
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {testimonial.feedback}
                                    </p>
                                    <p className="text-xs text-muted-foreground italic mt-2">
                                        💡 Puedes editar tu testimonio considerando este feedback y volver a enviarlo.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Comentario */}
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Comentario</h3>
                        <p className="text-lg">{testimonial.comentario}</p>
                    </div>

                    {/* Calificación */}
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Calificación</h3>
                        {renderStars(testimonial.ranking)}
                    </div>

                    {/* Organización */}
                    {testimonial.organizacion_nombre && (
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Organización</h3>
                                <p className="text-base">{testimonial.organizacion_nombre}</p>
                            </div>
                        </div>
                    )}

                    {/* Categoría */}
                    {testimonial.categoria_nombre && (
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Categoría</h3>
                                <p className="text-base">{testimonial.categoria_nombre}</p>
                            </div>
                        </div>
                    )}

                    {/* Fecha */}
                    {testimonial.fecha_comentario && (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Fecha de creación</h3>
                                <p className="text-base">
                                    {new Date(testimonial.fecha_comentario).toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Archivos */}
                    {testimonial.archivos_urls && testimonial.archivos_urls.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-3">
                                Archivos adjuntos ({testimonial.archivos_urls.length})
                            </h3>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {testimonial.archivos_urls.map((url, index) => (
                                    <div key={index} className="border rounded-lg overflow-hidden bg-muted/30 group cursor-pointer" onClick={() => window.open(url, '_blank')}>
                                        {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                            <img
                                                src={url}
                                                alt={`Archivo ${index + 1}`}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-48 bg-muted">
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline text-center p-4"
                                                >
                                                    📎 Ver archivo {index + 1}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El testimonio será eliminado permanentemente.
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
