"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, UserPlus, X } from "lucide-react"
import { toast } from "sonner"
import { organizationService } from "@/services/organization.service"
import { userService } from "@/services/user.service"
import type { Usuario } from "@/interfaces"

interface AddVisitantesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    organizacion: { id: number; organizacion_nombre: string } | null
    onSuccess?: () => void
}

export function AddVisitantesDialog({
    open,
    onOpenChange,
    organizacion,
    onSuccess,
}: AddVisitantesDialogProps) {
    const [visitantes, setVisitantes] = useState<Usuario[]>([])
    const [selectedVisitantes, setSelectedVisitantes] = useState<number[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingVisitantes, setLoadingVisitantes] = useState(false)

    useEffect(() => {
        if (open) {
            loadVisitantes()
            setSelectedVisitantes([])
        }
    }, [open])

    const loadVisitantes = async () => {
        setLoadingVisitantes(true)
        try {
            const data = await userService.getVisitantes()
            setVisitantes(data)
        } catch (error) {
            console.error('Error loading visitantes:', error)
            toast.error("Error al cargar la lista de visitantes")
        } finally {
            setLoadingVisitantes(false)
        }
    }

    const handleAddVisitante = (visitanteId: string) => {
        const id = parseInt(visitanteId)
        if (!selectedVisitantes.includes(id)) {
            setSelectedVisitantes([...selectedVisitantes, id])
        }
    }

    const handleRemoveVisitante = (visitanteId: number) => {
        setSelectedVisitantes(selectedVisitantes.filter(id => id !== visitanteId))
    }

    const handleSubmit = async () => {
        if (!organizacion?.id) {
            toast.error("Organización inválida")
            return
        }

        if (selectedVisitantes.length === 0) {
            toast.error("Selecciona al menos un visitante")
            return
        }

        setLoading(true)
        try {
            await organizationService.addVisitantes(organizacion.id, selectedVisitantes)
            toast.success(`${selectedVisitantes.length} visitante(s) agregado(s) exitosamente`)
            onOpenChange(false)
            onSuccess?.()
        } catch (error: any) {
            console.error('Error adding visitantes:', error)
            const errorMessage = error.response?.data?.detail ||
                error.response?.data?.visitantes?.[0] ||
                "Error al agregar visitantes"
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const getVisitanteName = (id: number) => {
        const visitante = visitantes.find(v => v.id === id)
        return visitante ? `${visitante.username} (${visitante.email})` : `ID: ${id}`
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Agregar Visitantes
                    </DialogTitle>
                    <DialogDescription>
                        Agrega visitantes a la organización <strong>{organizacion?.organizacion_nombre}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Select de visitantes */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Seleccionar Visitantes
                        </label>
                        <Select onValueChange={handleAddVisitante} disabled={loadingVisitantes}>
                            <SelectTrigger>
                                <SelectValue placeholder={loadingVisitantes ? "Cargando..." : "Selecciona un visitante"} />
                            </SelectTrigger>
                            <SelectContent>
                                <ScrollArea className="h-[200px]">
                                    {visitantes.map((visitante) => (
                                        visitante.id && (
                                            <SelectItem
                                                key={visitante.id}
                                                value={visitante.id.toString()}
                                                disabled={selectedVisitantes.includes(visitante.id)}
                                            >
                                                {visitante.username} - {visitante.email}
                                            </SelectItem>
                                        )
                                    ))}
                                </ScrollArea>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Lista de visitantes seleccionados */}
                    {selectedVisitantes.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Visitantes Seleccionados ({selectedVisitantes.length})
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {selectedVisitantes.map((id) => (
                                    <Badge key={id} variant="secondary" className="pr-1">
                                        {getVisitanteName(id)}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
                                            onClick={() => handleRemoveVisitante(id)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || selectedVisitantes.length === 0}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Agregar {selectedVisitantes.length > 0 && `(${selectedVisitantes.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
