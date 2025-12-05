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

interface AddEditorsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    organizacion: { id: number; organizacion_nombre: string } | null
    onSuccess?: () => void
}

export function AddEditorsDialog({
    open,
    onOpenChange,
    organizacion,
    onSuccess,
}: AddEditorsDialogProps) {
    const [editores, setEditores] = useState<Usuario[]>([])
    const [selectedEditores, setSelectedEditores] = useState<number[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingEditores, setLoadingEditores] = useState(false)

    useEffect(() => {
        if (open) {
            loadEditores()
            setSelectedEditores([])
        }
    }, [open])

    const loadEditores = async () => {
        setLoadingEditores(true)
        try {
            const data = await userService.getEditores()
            setEditores(data)
        } catch (error) {
            console.error('Error loading editores:', error)
            toast.error("Error al cargar la lista de editores")
        } finally {
            setLoadingEditores(false)
        }
    }

    const handleAddEditor = (editorId: string) => {
        const id = parseInt(editorId)
        if (!selectedEditores.includes(id)) {
            setSelectedEditores([...selectedEditores, id])
        }
    }

    const handleRemoveEditor = (editorId: number) => {
        setSelectedEditores(selectedEditores.filter(id => id !== editorId))
    }

    const handleSubmit = async () => {
        if (!organizacion?.id) {
            toast.error("Organización inválida")
            return
        }

        if (selectedEditores.length === 0) {
            toast.error("Selecciona al menos un editor")
            return
        }

        setLoading(true)
        try {
            await organizationService.addEditors(organizacion.id, selectedEditores)
            toast.success(`${selectedEditores.length} editor(es) agregado(s) exitosamente`)
            onOpenChange(false)
            onSuccess?.()
        } catch (error: any) {
            console.error('Error adding editores:', error)
            const errorMessage = error.response?.data?.detail ||
                error.response?.data?.editores?.[0] ||
                "Error al agregar editores"
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const getEditorName = (id: number) => {
        const editor = editores.find(e => e.id === id)
        return editor ? `${editor.username} (${editor.email})` : `ID: ${id}`
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Agregar Editores
                    </DialogTitle>
                    <DialogDescription>
                        Agrega editores a la organización <strong>{organizacion?.organizacion_nombre}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Select de editores */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Seleccionar Editores
                        </label>
                        <Select onValueChange={handleAddEditor} disabled={loadingEditores}>
                            <SelectTrigger>
                                <SelectValue placeholder={loadingEditores ? "Cargando..." : "Selecciona un editor"} />
                            </SelectTrigger>
                            <SelectContent>
                                <ScrollArea className="h-[200px]">
                                    {editores.length === 0 && !loadingEditores ? (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            No hay editores disponibles
                                        </div>
                                    ) : (
                                        editores.map((editor) => (
                                            editor.id && (
                                                <SelectItem
                                                    key={editor.id}
                                                    value={editor.id.toString()}
                                                    disabled={selectedEditores.includes(editor.id)}
                                                >
                                                    {editor.username} - {editor.email}
                                                </SelectItem>
                                            )
                                        ))
                                    )}
                                </ScrollArea>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Lista de editores seleccionados */}
                    {selectedEditores.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Editores Seleccionados ({selectedEditores.length})
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {selectedEditores.map((id) => (
                                    <Badge key={id} variant="secondary" className="pr-1">
                                        {getEditorName(id)}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
                                            onClick={() => handleRemoveEditor(id)}
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
                    <Button onClick={handleSubmit} disabled={loading || selectedEditores.length === 0}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Agregar {selectedEditores.length > 0 && `(${selectedEditores.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
