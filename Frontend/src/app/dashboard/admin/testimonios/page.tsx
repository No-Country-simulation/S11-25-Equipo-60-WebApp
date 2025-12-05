"use client"

import { useEffect, useState } from "react"
import { testimonialService } from "@/services/testimonial.service"
import { organizationService } from "@/services/organization.service"
import { categoryService } from "@/services/category.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChangeStatusDialog } from "@/components"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { FileText, Filter, Eye, Star, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Categoria, Organizacion, Testimonio } from "@/interfaces"
import { getTestimonialUsername } from "@/lib/testimonial-utils"

export default function AdminTestimoniosPage() {
    const [testimonials, setTestimonials] = useState<Testimonio[]>([])
    const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonio[]>([])
    const [organizations, setOrganizations] = useState<Organizacion[]>([])
    const [categories, setCategories] = useState<Categoria[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedTestimonio, setSelectedTestimonio] = useState<Testimonio | null>(null)
    const [changeStatusTestimonio, setChangeStatusTestimonio] = useState<Testimonio | null>(null)

    // Filtros
    const [filterOrg, setFilterOrg] = useState<string>("all")
    const [filterCategory, setFilterCategory] = useState<string>("all")
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [testimonials, filterOrg, filterCategory, filterStatus, searchTerm])

    const loadData = async () => {
        try {
            // ✅ CORRECCIÓN: Admin ve TODOS los testimonios (cualquier estado) usando getAllTestimonials
            // Este endpoint usa GET /app/testimonios-totales/ que devuelve TODOS los testimonios para admin
            const [testimonialsData, orgsData, catsData] = await Promise.all([
                testimonialService.getAllTestimonials(), // GET /app/testimonios-totales/
                organizationService.getOrganizations(),
                categoryService.getCategories(),
            ])
            setTestimonials(testimonialsData)
            setOrganizations(orgsData)
            setCategories(catsData)
        } catch (error) {
            console.error('Error loading testimonials:', error)
            toast.error("Error al cargar los testimonios")
        } finally {
            setLoading(false)
        }
    }

    const applyFilters = () => {
        let filtered = [...testimonials]

        // Filtrar por organización
        if (filterOrg !== "all") {
            filtered = filtered.filter(t => t.organizacion.toString() === filterOrg)
        }

        // Filtrar por categoría
        if (filterCategory !== "all") {
            filtered = filtered.filter(t => t.categoria.toString() === filterCategory)
        }

        // Filtrar por estado
        if (filterStatus !== "all") {
            filtered = filtered.filter(t => t.estado === filterStatus)
        }

        // Buscar por texto
        if (searchTerm) {
            const search = searchTerm.toLowerCase()
            filtered = filtered.filter(t =>
                t.comentario.toLowerCase().includes(search) ||
                t.organizacion_nombre?.toLowerCase().includes(search) ||
                getTestimonialUsername(t).toLowerCase().includes(search)
            )
        }

        setFilteredTestimonials(filtered)
    }

    const getStatusBadge = (estado: string) => {
        const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
            'E': { label: 'En Espera', variant: 'secondary' },
            'A': { label: 'Aprobado', variant: 'default' },
            'R': { label: 'Rechazado', variant: 'destructive' },
            'P': { label: 'Publicado', variant: 'default' },
            'B': { label: 'Borrador', variant: 'outline' },
            'O': { label: 'Oculto', variant: 'outline' },
        }
        const status = statusMap[estado] || { label: estado, variant: 'outline' as const }
        return <Badge variant={status.variant}>{status.label}</Badge>
    }

    const stats = {
        total: testimonials.length,
        approved: testimonials.filter(t => t.estado === 'A' || t.estado === 'P').length,
        pending: testimonials.filter(t => t.estado === 'E').length,
        rejected: testimonials.filter(t => t.estado === 'R').length,
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
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <FileText className="h-8 w-8" />
                    Testimonios del Sistema
                </h1>
                <p className="text-muted-foreground mt-2">
                    Vista global de todos los testimonios públicos aprobados
                </p>
            </div>

            {/* Estadísticas */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Aprobados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">En Espera</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Rechazados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtros
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div>
                            <Input
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <Select value={filterOrg} onValueChange={setFilterOrg}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Organización" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las organizaciones</SelectItem>
                                    {organizations.map(org => (
                                        <SelectItem key={org.id} value={org.id.toString()}>
                                            {org.organizacion_nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las categorías</SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.nombre_categoria}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los estados</SelectItem>
                                    <SelectItem value="E">En Espera</SelectItem>
                                    <SelectItem value="A">Aprobado</SelectItem>
                                    <SelectItem value="R">Rechazado</SelectItem>
                                    <SelectItem value="P">Publicado</SelectItem>
                                    <SelectItem value="B">Borrador</SelectItem>
                                    <SelectItem value="O">Oculto</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de Testimonios */}
            <Card>
                <CardHeader>
                    <CardTitle>Testimonios ({filteredTestimonials.length})</CardTitle>
                    <CardDescription>
                        Testimonios públicos del sistema
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredTestimonials.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No se encontraron testimonios con los filtros aplicados
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {filteredTestimonials.map((testimonial) => (
                                <div
                                    key={testimonial.id}
                                    className="flex items-start justify-between border-b pb-4 last:border-0"
                                >
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">{testimonial.organizacion_nombre}</Badge>
                                            <Badge variant="outline">{testimonial.categoria_nombre}</Badge>
                                            {getStatusBadge(testimonial.estado || 'E')}
                                        </div>
                                        <p className="text-sm font-medium line-clamp-2">
                                            {testimonial.comentario}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span>Por: {getTestimonialUsername(testimonial)}</span>
                                            <span>•</span>
                                            <span>{new Date(testimonial.fecha_comentario || '').toLocaleDateString('es-ES')}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                {testimonial.ranking}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedTestimonio(testimonial)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setChangeStatusTestimonio(testimonial)}
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog Ver Detalles */}
            <Dialog open={!!selectedTestimonio} onOpenChange={() => setSelectedTestimonio(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detalles del Testimonio</DialogTitle>
                        <DialogDescription>
                            Testimonio #{selectedTestimonio?.id}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTestimonio && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Organización</p>
                                    <p className="text-sm">{selectedTestimonio.organizacion_nombre}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Categoría</p>
                                    <p className="text-sm">{selectedTestimonio.categoria_nombre}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Usuario</p>
                                    <p className="text-sm">
                                        {getTestimonialUsername(selectedTestimonio)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Calificación</p>
                                    <p className="text-sm flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        {selectedTestimonio.ranking} / 5.0
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Estado</p>
                                    {getStatusBadge(selectedTestimonio.estado || 'E')}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                                    <p className="text-sm">
                                        {new Date(selectedTestimonio.fecha_comentario || '').toLocaleString('es-ES')}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Comentario</p>
                                <p className="text-sm p-4 bg-muted rounded-lg">
                                    {selectedTestimonio.comentario}
                                </p>
                            </div>
                            {selectedTestimonio.archivos_urls && selectedTestimonio.archivos_urls.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Archivos</p>
                                    <div className="space-y-2">
                                        {selectedTestimonio.archivos_urls.map((url, index) => (
                                            <a
                                                key={index}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:underline block"
                                            >
                                                Ver archivo {index + 1}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Dialog Cambiar Estado */}
            <ChangeStatusDialog
                open={!!changeStatusTestimonio}
                onOpenChange={(open) => {
                    if (!open) setChangeStatusTestimonio(null);
                }}
                testimonio={changeStatusTestimonio}
                onSuccess={async () => {
                    setChangeStatusTestimonio(null);
                    await loadData();
                }}
            />
        </div>
    )
}
