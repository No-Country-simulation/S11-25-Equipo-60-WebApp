/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { categoryService } from "@/services/category.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Tag, Plus, Edit, Trash2, Palette } from "lucide-react"
import { toast } from "sonner"
import type { Categoria } from "@/interfaces"

export default function AdminCategoriasPage() {
    const [categories, setCategories] = useState<Categoria[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState<Categoria | null>(null)
    const [deleteCategory, setDeleteCategory] = useState<number | null>(null)
    const [formData, setFormData] = useState({ nombre_categoria: '', icono: '', color: '#3b82f6' })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const data = await categoryService.getCategories()
            setCategories(data)
        } catch (error) {
            console.error('Error loading categories:', error)
            toast.error("Error al cargar las categorías")
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!formData.nombre_categoria) {
            toast.error("El nombre de la categoría es obligatorio")
            return
        }
        if (!formData.icono) {
            toast.error("El icono es obligatorio")
            return
        }
        if (!formData.color) {
            toast.error("El color es obligatorio")
            return
        }

        try {
            await categoryService.createCategory(formData)
            toast.success("Categoría creada exitosamente")
            setFormData({ nombre_categoria: '', icono: '', color: '#3b82f6' })
            setShowCreateDialog(false)
            loadData()

        } catch (error: any) {
            console.error('Error creating category:', error)
            const errorMessage = error.response?.data?.detail ||
                error.response?.data?.nombre_categoria?.[0] ||
                "Error al crear la categoría"
            toast.error(errorMessage)
        }
    }

    const handleEdit = async () => {
        if (!showEditDialog) return

        if (!formData.nombre_categoria || !formData.icono || !formData.color) {
            toast.error("Todos los campos son obligatorios")
            return
        }

        try {
            await categoryService.updateCategory(showEditDialog.id, formData)
            toast.success("Categoría actualizada exitosamente")
            setShowEditDialog(null)
            setFormData({ nombre_categoria: '', icono: '', color: '#3b82f6' })
            loadData()
        } catch (error: any) {
            console.error('Error updating category:', error)
            toast.error(error.response?.data?.detail || "Error al actualizar la categoría")
        }
    }

    const handleDelete = async () => {
        if (!deleteCategory) return

        try {
            await categoryService.deleteCategory(deleteCategory)
            toast.success("Categoría eliminada exitosamente")
            setDeleteCategory(null)
            loadData()
        } catch (error: any) {
            console.error('Error deleting category:', error)
            toast.error(error.response?.data?.detail || "Error al eliminar la categoría")
        }
    }

    const openEditDialog = (category: Categoria) => {
        setFormData({
            nombre_categoria: category.nombre_categoria,
            icono: category.icono || '',
            color: category.color || '#3b82f6'
        })
        setShowEditDialog(category)
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
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Tag className="h-8 w-8" />
                        Gestión de Categorías
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Administra las categorías del sistema
                    </p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Categoría
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categories.map((cat) => (
                    <Card key={cat.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                                    style={{ backgroundColor: cat.color || '#3b82f6' }}
                                >
                                    {cat.icono || <Tag className="h-4 w-4" />}
                                </div>
                                {cat.nombre_categoria}
                            </CardTitle>
                            <CardDescription>ID: {cat.id}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Palette className="h-3 w-3" />
                                    <p className="text-xs font-medium">Color</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-6 h-6 rounded border"
                                        style={{ backgroundColor: cat.color || '#3b82f6' }}
                                    />
                                    <code className="text-xs">{cat.color || '#3b82f6'}</code>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditDialog(cat)}
                                    className="flex-1"
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeleteCategory(cat.id)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Dialog Crear */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nueva Categoría</DialogTitle>
                        <DialogDescription>
                            Crea una nueva categoría en el sistema
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="nombre">Nombre de la Categoría *</Label>
                            <Input
                                id="nombre"
                                value={formData.nombre_categoria}
                                onChange={(e) => setFormData({ ...formData, nombre_categoria: e.target.value })}
                                placeholder="Tecnología"
                            />
                        </div>
                        <div>
                            <Label htmlFor="icono">Icono *</Label>
                            <Input
                                id="icono"
                                value={formData.icono}
                                onChange={(e) => setFormData({ ...formData, icono: e.target.value })}
                                placeholder="💻"
                                maxLength={2}
                                required
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Ingresa un emoji o símbolo
                            </p>
                        </div>
                        <div>
                            <Label htmlFor="color">Color *</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="color"
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="w-20 h-10"
                                    required
                                />
                                <Input
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    placeholder="#3b82f6"
                                    className="flex-1"
                                    required
                                />
                            </div>
                        </div>
                        <Button onClick={handleCreate} className="w-full">
                            Crear Categoría
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog Editar */}
            <Dialog open={!!showEditDialog} onOpenChange={() => setShowEditDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Categoría</DialogTitle>
                        <DialogDescription>
                            Actualiza la información de la categoría
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-nombre">Nombre de la Categoría</Label>
                            <Input
                                id="edit-nombre"
                                value={formData.nombre_categoria}
                                onChange={(e) => setFormData({ ...formData, nombre_categoria: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-icono">Icono *</Label>
                            <Input
                                id="edit-icono"
                                value={formData.icono}
                                onChange={(e) => setFormData({ ...formData, icono: e.target.value })}
                                maxLength={2}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-color">Color *</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="edit-color"
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="w-20 h-10"
                                    required
                                />
                                <Input
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="flex-1"
                                    required
                                />
                            </div>
                        </div>
                        <Button onClick={handleEdit} className="w-full">
                            Guardar Cambios
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog Eliminar */}
            <AlertDialog open={!!deleteCategory} onOpenChange={() => setDeleteCategory(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente la categoría.
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
