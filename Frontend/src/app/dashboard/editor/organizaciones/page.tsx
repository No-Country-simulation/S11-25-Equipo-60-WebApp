"use client"

import { useEffect, useState } from "react"
import { organizationService } from "@/services/organization.service"
import { testimonialService } from "@/services/testimonial.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, FileText, ExternalLink, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { AddVisitantesDialog, AddEditorsDialog } from "@/components"
import type { Organizacion, Testimonio } from "@/interfaces"

export default function EditorOrganizacionesPage() {
    const [organizations, setOrganizations] = useState<Organizacion[]>([])
    const [testimonials, setTestimonials] = useState<Testimonio[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedOrgForEditores, setSelectedOrgForEditores] = useState<Organizacion | null>(null)
    const [selectedOrgForVisitantes, setSelectedOrgForVisitantes] = useState<Organizacion | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [orgsData, testimonialsData] = await Promise.all([
                organizationService.getOrganizations(),
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
                                            <p className="text-sm">
                                                {Array.isArray(org.editores)
                                                    ? org.editores.map((e: any) => e.username || e.email).join(', ')
                                                    : org.editores}
                                            </p>
                                        </div>
                                    )}

                                    {/* Botón para agregar editores */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => setSelectedOrgForEditores(org)}
                                    >
                                        <Users className="mr-2 h-4 w-4" />
                                        Agregar Editores
                                    </Button>

                                    {/* Botón para agregar visitantes */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => setSelectedOrgForVisitantes(org)}
                                    >
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Agregar Visitantes
                                    </Button>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Dialog para agregar editores */}
            <AddEditorsDialog
                open={!!selectedOrgForEditores}
                onOpenChange={(open) => {
                    if (!open) setSelectedOrgForEditores(null)
                }}
                organizacion={selectedOrgForEditores}
                onSuccess={loadData}
            />

            {/* Dialog para agregar visitantes */}
            <AddVisitantesDialog
                open={!!selectedOrgForVisitantes}
                onOpenChange={(open) => {
                    if (!open) setSelectedOrgForVisitantes(null)
                }}
                organizacion={selectedOrgForVisitantes}
                onSuccess={async () => {
                    setSelectedOrgForVisitantes(null)
                    await loadData()
                }}
            />
        </div>
    )
}
