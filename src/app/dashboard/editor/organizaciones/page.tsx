"use client"

import { useEffect, useState } from "react"
import { organizationService, Organizacion } from "@/services/organization.service"
import { testimonialService, Testimonio } from "@/services/testimonial.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, FileText, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function EditorOrganizacionesPage() {
    const [organizations, setOrganizations] = useState<Organizacion[]>([])
    const [testimonials, setTestimonials] = useState<Testimonio[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedOrg, setSelectedOrg] = useState<Organizacion | null>(null)
    const [editorIds, setEditorIds] = useState("")
    const [addingEditors, setAddingEditors] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [orgsData, testimonialsData] = await Promise.all([
                organizationService.getEditorOrganizations(),
                testimonialService.getMyTestimonials(),
            ])
            setOrganizations(orgsData)
            setTestimonials(testimonialsData)
        } catch (error) {
            console.error('Error loading data:', error)
            toast.error("Error al cargar las organizaciones")
        } finally {
            setLoading(false)
        }
    }

    const handleAddEditors = async (orgId: number) => {
        if (!editorIds.trim()) {
            toast.error("Ingresa al menos un ID de editor")
            return
        }

        setAddingEditors(true)
        try {
            // Convertir string "1,2,3" a array [1,2,3]
            const ids = editorIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
            
            if (ids.length === 0) {
                toast.error("IDs inválidos. Usa formato: 1,2,3")
                return
            }

            await organizationService.addEditors(orgId, ids)
            toast.success("Editores agregados exitosamente")
            setEditorIds("")
            setSelectedOrg(null)
            loadData()
        } catch (error: any) {
            console.error('Error adding editors:', error)
            const errorMessage = error.response?.data?.detail || 
                error.response?.data?.editores?.[0] ||
                "Error al agregar editores"
            toast.error(errorMessage)
        } finally {
            setAddingEditors(false)
        }
    }

    const getOrgTestimonials = (orgId: number) => {
        return testimonials.filter(t => t.organizacion === orgId)
    }

    const getOrgStats = (orgId: number) => {
        const orgTestimonials = getOrgTestimonials(orgId)
        return {
            total: orgTestimonials.length,
            pending: orgTestimonials.filter(t => t.estado === 'E').length,
            approved: orgTestimonials.filter(t => t.estado === 'A' || t.estado === 'P').length,
        }
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
                <h1 className="text-3xl font-bold tracking-tight">Mis Organizaciones</h1>
                <p className="text-muted-foreground mt-2">
                    Organizaciones que gestiono como editor
                </p>
            </div>

            {organizations.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                            No perteneces a ninguna organización aún. Contacta al administrador.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {organizations.map((org) => {
                        const stats = getOrgStats(org.id)
                        return (
                            <Card key={org.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="flex items-center gap-2">
                                                <Building2 className="h-5 w-5" />
                                                {org.organizacion_nombre}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-1">
                                                <ExternalLink className="h-3 w-3" />
                                                {org.dominio}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline">Editor</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* API Key */}
                                    {org.api_key && (
                                        <div className="p-3 bg-muted rounded-lg">
                                            <p className="text-xs font-medium text-muted-foreground mb-1">API Key</p>
                                            <code className="text-xs break-all">{org.api_key}</code>
                                        </div>
                                    )}

                                    {/* Estadísticas */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="text-center p-2 bg-blue-50 dark:bg-blue-950 rounded">
                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {stats.total}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Total</p>
                                        </div>
                                        <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                                {stats.pending}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Pendientes</p>
                                        </div>
                                        <div className="text-center p-2 bg-green-50 dark:bg-green-950 rounded">
                                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {stats.approved}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Aprobados</p>
                                        </div>
                                    </div>

                                    {/* Editores */}
                                    {org.editores && (
                                        <div className="p-3 bg-muted rounded-lg">
                                            <p className="text-xs font-medium text-muted-foreground mb-1">
                                                Editores
                                            </p>
                                            <p className="text-sm">{org.editores}</p>
                                        </div>
                                    )}

                                    {/* Botón para agregar editores */}
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="w-full"
                                                onClick={() => setSelectedOrg(org)}
                                            >
                                                <Users className="mr-2 h-4 w-4" />
                                                Agregar Editores
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Agregar Editores a {org.organizacion_nombre}</DialogTitle>
                                                <DialogDescription>
                                                    Ingresa los IDs de los editores separados por comas
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="editor-ids">IDs de Editores</Label>
                                                    <Input
                                                        id="editor-ids"
                                                        placeholder="Ej: 8, 9, 10"
                                                        value={editorIds}
                                                        onChange={(e) => setEditorIds(e.target.value)}
                                                    />
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Los IDs deben ser de usuarios con rol de editor
                                                    </p>
                                                </div>
                                                <Button 
                                                    onClick={() => handleAddEditors(org.id)}
                                                    disabled={addingEditors}
                                                    className="w-full"
                                                >
                                                    {addingEditors ? "Agregando..." : "Agregar Editores"}
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
