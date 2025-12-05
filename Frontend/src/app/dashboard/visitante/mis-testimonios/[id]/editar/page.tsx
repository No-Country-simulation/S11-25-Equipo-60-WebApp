"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { testimonialService} from "@/services/testimonial.service"
import { categoryService } from "@/services/category.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import type { Categoria, Testimonio } from "@/interfaces"

const formSchema = z.object({
    comentario: z.string().min(10, {
        message: "El testimonio debe tener al menos 10 caracteres",
    }).max(100, {
        message: "El comentario no debe exceder 100 caracteres",
    }),
    categoria: z.string().min(1, {
        message: "Debes seleccionar una categoría",
    }),
    ranking: z.string().min(1, {
        message: "Debes seleccionar una calificación",
    }),
})

export default function EditarTestimonioPage() {
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [categories, setCategories] = useState<Categoria[]>([])
    const [testimonial, setTestimonial] = useState<Testimonio | null>(null)
    const router = useRouter()
    const params = useParams()
    const id = parseInt(params.id as string)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            comentario: "",
            categoria: "",
            ranking: "",
        },
    })

    useEffect(() => {
        loadData()
    }, [id])

    const loadData = async () => {
        try {
            const [testimonialData, categoriesData] = await Promise.all([
                testimonialService.getTestimonial(id),
                categoryService.getCategories(),
            ])

            setTestimonial(testimonialData)
            setCategories(categoriesData)

            // Populate form with existing data
            form.reset({
                comentario: testimonialData.comentario,
                categoria: testimonialData.categoria.toString(),
                ranking: testimonialData.ranking,
            })
        } catch (error) {
            console.error('Error loading data:', error)
            toast.error("Error al cargar los datos")
            router.push('/dashboard/visitante/mis-testimonios')
        } finally {
            setLoadingData(false)
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            const updateData = {
                comentario: values.comentario,
                categoria: parseInt(values.categoria),
                ranking: values.ranking,
            }

            await testimonialService.updateTestimonial(id, updateData)
            toast.success("¡Testimonio actualizado exitosamente!")
            router.push('/dashboard/visitante/mis-testimonios')
        } catch (error: any) {
            console.error('Error updating testimonial:', error)
            const errorMessage = error.response?.data?.detail ||
                error.response?.data?.comentario?.[0] ||
                "Error al actualizar el testimonio"
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const rankings = [
        { value: "1.0", label: "⭐ Muy malo" },
        { value: "2.0", label: "⭐⭐ Malo" },
        { value: "3.0", label: "⭐⭐⭐ Regular" },
        { value: "4.0", label: "⭐⭐⭐⭐ Bueno" },
        { value: "5.0", label: "⭐⭐⭐⭐⭐ Excelente" },
    ]

    if (loadingData) {
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
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Editar Testimonio</h1>
                    <p className="text-muted-foreground mt-2">
                        Actualiza la información de tu testimonio
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Editar Testimonio</CardTitle>
                    <CardDescription>
                        Modifica los campos que desees actualizar. La organización no puede ser cambiada.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {testimonial.organizacion_nombre && (
                        <div className="mb-6 p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Organización</p>
                            <p className="font-medium">{testimonial.organizacion_nombre}</p>
                        </div>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="comentario"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="comentario-input">Testimonio * (Máx. 100 caracteres)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Textarea
                                                    id="comentario-input"
                                                    placeholder="Escribe tu testimonio aquí..."
                                                    className="min-h-[100px] resize-none pr-12"
                                                    maxLength={100}
                                                    {...field}
                                                />
                                                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                                                    {field.value.length}/100
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Sé breve y conciso.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="categoria"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="categoria-select">Categoría *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger id="categoria-select">
                                                    <SelectValue placeholder="Selecciona una categoría" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.nombre_categoria}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Elige la categoría que mejor describa tu testimonio
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="ranking"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="ranking-select">Calificación *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger id="ranking-select">
                                                    <SelectValue placeholder="Selecciona tu calificación" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {rankings.map((rank) => (
                                                    <SelectItem key={rank.value} value={rank.value}>
                                                        {rank.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            ¿Cómo calificarías tu experiencia?
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Guardando..." : "Guardar cambios"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
