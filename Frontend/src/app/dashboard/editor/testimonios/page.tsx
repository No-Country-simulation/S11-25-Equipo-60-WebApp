"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { testimonialService } from "@/services/testimonial.service"
import { organizationService } from "@/services/organization.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Eye, Trash2, Filter, MessageSquare } from "lucide-react"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { FeedbackDialog } from "@/components/dashboard/FeedbackDialog"
import type { Organizacion, Testimonio } from "@/interfaces"

export default function EditorTestimoniosPage() {
    const [testimonials, setTestimonials] = useState<Testimonio[]>([])
    const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonio[]>([])
    const [organizations, setOrganizations] = useState<Organizacion[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonio | null>(null)
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [filterOrg, setFilterOrg] = useState<string>("all")
    const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
    const [feedbackTestimonial, setFeedbackTestimonial] = useState<Testimonio | null>(null)
    const router = useRouter()

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [testimonials, filterStatus, filterOrg])

    const loadData = async () => {
        try {
            // Solo editores pueden usar /app/organizacion/editores/
            const [testimonialsData, organizationsData] = await Promise.all([
                testimonialService.getMyTestimonials(),
                organizationService.getOrganizations(),
            ])
            setTestimonials(testimonialsData)
            setOrganizations(organizationsData)
        } catch (error: any) {
            console.error('Error loading testimonials:', error)
            toast.error("Error al cargar los testimonios")
        } finally {
            setLoading(false)
        }
    }

    const applyFilters = () => {
        let filtered = [...testimonials]

        if (filterStatus !== "all") {
            filtered = filtered.filter(t => t.estado === filterStatus)
        }

        if (filterOrg !== "all") {
            filtered = filtered.filter(t => t.organizacion === parseInt(filterOrg))
        }

        setFilteredTestimonials(filtered)
    }

    const handleChangeStatus = async (id: number, newStatus: 'E' | 'A' | 'R' | 'P' | 'B' | 'O') => {
        try {
            await testimonialService.changeTestimonialStatus(id, newStatus)
            toast.success("Estado actualizado exitosamente")
            loadData()
            setSelectedTestimonial(null)
        } catch (error: any) {
            console.error('Error changing status:', error)
            const errorMessage = error.response?.data?.detail || "Error al cambiar el estado"
            toast.error(errorMessage)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return

        try {
            await testimonialService.deleteTestimonial(deleteId)
            toast.success("Testimonio eliminado exitosamente")
            loadData()
        } catch (error) {
            console.error('Error deleting testimonial:', error)
            toast.error("Error al eliminar el testimonio")
        } finally {
            setDeleteId(null)
        }
    }

    const handleOpenFeedbackDialog = (testimonial: Testimonio) => {
        setFeedbackTestimonial(testimonial)
        setFeedbackDialogOpen(true)
    }

    const handleSubmitFeedback = async (feedback: string) => {
        if (!feedbackTestimonial?.id) return

        try {
            await testimonialService.addFeedback(feedbackTestimonial.id, feedback)
            toast.success("Feedback enviado y testimonio rechazado exitosamente")
            loadData()
            setFeedbackDialogOpen(false)
            setFeedbackTestimonial(null)
        } catch (error: any) {
            console.error('Error adding feedback:', error)
            const errorMessage = error.response?.data?.detail || "Error al enviar feedback"
            throw new Error(errorMessage)
        }
    }

    const getStatusBadge = (estado: string) => {
        const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
            'E': { label: 'En espera', variant: 'secondary' },
            'A': { label: 'Aprobado', variant: 'default' },
            'R': { label: 'Rechazado', variant: 'destructive' },
            'P': { label: 'Publicado', variant: 'default' },
            'B': { label: 'Borrador', variant: 'outline' },
            'O': { label: 'Oculto', variant: 'outline' },
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
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestionar Testimonios</h1>
                <p className="text-muted-foreground mt-2">
                    Revisa y gestiona los testimonios de tus organizaciones
                </p>
            </div>

            {/* Filtros */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtros
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-sm font-medium mb-2 block">Estado</label>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todos los estados" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="E">En espera</SelectItem>
                                <SelectItem value="A">Aprobado</SelectItem>
                                <SelectItem value="R">Rechazado</SelectItem>
                                <SelectItem value="P">Publicado</SelectItem>
                                <SelectItem value="B">Borrador</SelectItem>
                                <SelectItem value="O">Oculto</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1">
                        <label className="text-sm font-medium mb-2 block">Organización</label>
                        <Select value={filterOrg} onValueChange={setFilterOrg}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todas las organizaciones" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                {organizations.map((org) => (
                                    <SelectItem key={org.id} value={org.id.toString()}>
                                        {org.organizacion_nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de testimonios */}
            {filteredTestimonials.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                            No hay testimonios que coincidan con los filtros seleccionados
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTestimonials.map((testimonial) => {
                        const org = organizations.find(o => o.id === testimonial.organizacion)
                        return (
                            <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1 flex-1">
                                            <CardTitle className="line-clamp-2 text-base">
                                                {testimonial.comentario.substring(0, 50)}...
                                            </CardTitle>
                                            <CardDescription>
                                                {org?.organizacion_nombre}
                                            </CardDescription>
                                        </div>
                                        {testimonial.estado && getStatusBadge(testimonial.estado)}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                        {testimonial.comentario}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                                        <span>⭐ {testimonial.ranking}</span>
                                        <span>{new Date(testimonial.fecha_comentario || '').toLocaleDateString('es-ES')}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {/* Botón Agregar Feedback - Solo para testimonios en ESPERA */}
                                        {testimonial.estado === 'E' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenFeedbackDialog(testimonial)}
                                                className="flex-1"
                                            >
                                                <MessageSquare className="mr-2 h-4 w-4" />
                                                Feedback
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedTestimonial(testimonial)}
                                            className={testimonial.estado === 'E' ? '' : 'flex-1'}
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            {testimonial.estado === 'E' ? 'Ver' : 'Ver y Gestionar'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setDeleteId(testimonial.id!)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Dialog para ver y cambiar estado */}
            <Dialog open={!!selectedTestimonial} onOpenChange={() => setSelectedTestimonial(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Gestionar Testimonio</DialogTitle>
                        <DialogDescription>
                            Revisa el testimonio y cambia su estado
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTestimonial && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium mb-2">Comentario</h4>
                                <p className="text-sm">{selectedTestimonial.comentario}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Organización</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedTestimonial.organizacion_nombre}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Categoría</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedTestimonial.categoria_nombre}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Calificación</h4>
                                    <p className="text-sm text-muted-foreground">⭐ {selectedTestimonial.ranking}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Fecha</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(selectedTestimonial.fecha_comentario || '').toLocaleDateString('es-ES')}
                                    </p>
                                </div>
                            </div>

                            {/* Archivos adjuntos */}
                            {selectedTestimonial.archivos_urls && selectedTestimonial.archivos_urls.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Archivos adjuntos ({selectedTestimonial.archivos_urls.length})</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {selectedTestimonial.archivos_urls.map((url, index) => (
                                            <div key={index} className="border rounded-lg overflow-hidden bg-muted/30">
                                                {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                    <img
                                                        src={url}
                                                        alt={`Archivo ${index + 1}`}
                                                        className="w-full h-32 object-cover hover:scale-105 transition-transform cursor-pointer"
                                                        onClick={() => window.open(url, '_blank')}
                                                    />
                                                ) : (
                                                    <a
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center h-32 text-primary hover:underline p-4 text-center"
                                                    >
                                                        📎 Ver archivo {index + 1}
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h4 className="text-sm font-medium mb-2">Cambiar Estado</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button
                                        variant={selectedTestimonial.estado === 'A' ? 'default' : 'outline'}
                                        onClick={() => handleChangeStatus(selectedTestimonial.id!, 'A')}
                                        size="sm"
                                    >
                                        Aprobar
                                    </Button>
                                    <Button
                                        variant={selectedTestimonial.estado === 'R' ? 'default' : 'outline'}
                                        onClick={() => handleChangeStatus(selectedTestimonial.id!, 'R')}
                                        size="sm"
                                    >
                                        Rechazar
                                    </Button>
                                    <Button
                                        variant={selectedTestimonial.estado === 'P' ? 'default' : 'outline'}
                                        onClick={() => handleChangeStatus(selectedTestimonial.id!, 'P')}
                                        size="sm"
                                    >
                                        Publicar
                                    </Button>
                                    <Button
                                        variant={selectedTestimonial.estado === 'E' ? 'default' : 'outline'}
                                        onClick={() => handleChangeStatus(selectedTestimonial.id!, 'E')}
                                        size="sm"
                                    >
                                        En Espera
                                    </Button>
                                    <Button
                                        variant={selectedTestimonial.estado === 'B' ? 'default' : 'outline'}
                                        onClick={() => handleChangeStatus(selectedTestimonial.id!, 'B')}
                                        size="sm"
                                    >
                                        Borrador
                                    </Button>
                                    <Button
                                        variant={selectedTestimonial.estado === 'O' ? 'default' : 'outline'}
                                        onClick={() => handleChangeStatus(selectedTestimonial.id!, 'O')}
                                        size="sm"
                                    >
                                        Ocultar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Dialog de confirmación para eliminar */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
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

            {/* Dialog para agregar feedback */}
            <FeedbackDialog
                open={feedbackDialogOpen}
                onOpenChange={setFeedbackDialogOpen}
                testimonialId={feedbackTestimonial?.id || 0}
                testimonialTitle={feedbackTestimonial?.comentario}
                testimonialImages={feedbackTestimonial?.archivos_urls}
                onSubmit={handleSubmitFeedback}
            />
        </div>
    )
}
