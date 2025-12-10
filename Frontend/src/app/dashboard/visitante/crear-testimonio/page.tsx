"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { testimonialService } from "@/services/testimonial.service"
import { categoryService } from "@/services/category.service"
import { organizationService } from "@/services/organization.service"
import { useAuthStore } from "@/store/auth.store"
import { useTranslation } from "@/lib/i18n-provider"
import { useFileUpload } from "@/shared/hooks/useFileUpload"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { ArrowLeft, X, Upload } from "lucide-react"
import type { Categoria, Organizacion } from "@/interfaces"

const formSchema = z.object({
    organizacion: z.string().min(1, {
        message: "Debes seleccionar una organización",
    }),
    comentario: z.string().min(10, {
        message: "El testimonio debe tener al menos 10 caracteres",
    }).max(100, { // backend limit
        message: "El comentario no debe exceder 100 caracteres",
    }),
    categoria: z.string().min(1, {
        message: "Debes seleccionar una categoría",
    }),
    ranking: z.string().min(1, {
        message: "Debes seleccionar una calificación",
    }),
})

export default function CrearTestimonioPage() {
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<Categoria[]>([])
    const [organizations, setOrganizations] = useState<Organizacion[]>([])
    const router = useRouter()
    const { t } = useTranslation()
    const { files, previews, addFiles, removeFile, canAddMore, hasFiles } = useFileUpload()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            organizacion: "",
            comentario: "",
            categoria: "",
            ranking: "",
        },
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [categoriesData, organizationsData] = await Promise.all([
                categoryService.getCategories(),
                organizationService.getOrganizations(),
            ])
            setCategories(categoriesData)
            setOrganizations(organizationsData)
        } catch (error) {
            console.error('Error loading data:', error)
            toast.error("Error al cargar los datos")
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log('🚀 [Page] onSubmit called with values:', values);
        setLoading(true)
        try {
            // Find the selected organization to get its API key
            const selectedOrg = organizations.find(org => org.id.toString() === values.organizacion);
            console.log('🏢 [Page] Selected Organization:', selectedOrg);

            if (!selectedOrg?.api_key) {
                console.error('❌ [Page] Error: Organization has no API Key');
                toast.error("Error: La organización seleccionada no tiene una API Key válida.");
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('organizacion', parseInt(values.organizacion).toString());
            formData.append('api_key', selectedOrg.api_key); // Required by backend
            formData.append('comentario', values.comentario);
            formData.append('categoria', parseInt(values.categoria).toString());
            formData.append('ranking', values.ranking);

            // NO enviar usuario_anonimo_* cuando el usuario está autenticado
            // El backend debe extraer el usuario_registrado del token JWT

            // ✅ NUEVO: Agregar múltiples archivos (máx 4) con nombre 'archivos' (plural)
            if (hasFiles) {
                console.log(`📎 [Page] Adding ${files.length} file(s) to FormData`);
                files.forEach((file, index) => {
                    formData.append('archivos', file);
                    console.log(`   ${index + 1}. ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
                });
            }

            console.log('📤 [Page] Sending FormData to service...');
            await testimonialService.createTestimonial(formData);
            console.log('✅ [Page] Testimonial created successfully');
            toast.success("¡Testimonio creado exitosamente!")
            router.push("/dashboard/visitante/mis-testimonios")
        } catch (error: any) {
            console.error('❌ [Page] Error in onSubmit:', error);
            const errorMessage = error.response?.data?.detail ||
                error.response?.data?.archivos?.[0] ||
                error.response?.data?.api_key?.[0] ||
                "Error al crear el testimonio"
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
                    <h1 className="text-3xl font-bold tracking-tight">{t('testimonials.create')}</h1>
                    <p className="text-muted-foreground mt-2">
                        Comparte tu experiencia con una organización
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Nuevo Testimonio</CardTitle>
                    <CardDescription>
                        Tu testimonio será revisado antes de ser publicado
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="organizacion"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="organizacion-select">Organización *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger id="organizacion-select">
                                                    <SelectValue placeholder="Selecciona una organización" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {organizations.map((org) => (
                                                    <SelectItem key={org.id} value={org.id.toString()}>
                                                        {org.organizacion_nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            ¿Sobre qué organización quieres dejar tu testimonio?
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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

                            {/* Campo de archivos (no parte del formulario react-hook-form) */}
                            <div className="space-y-2">
                                <label htmlFor="archivo-input" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Archivos (Opcional - Máx. 4)
                                </label>
                                {canAddMore && (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="archivo-input"
                                            type="file"
                                            accept="image/*,video/mp4"
                                            multiple
                                            onChange={(e) => {
                                                if (e.target.files) {
                                                    addFiles(e.target.files);
                                                    e.target.value = ''; // Reset input
                                                                }
                                                            }}
                                                            disabled={!canAddMore}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            disabled={!canAddMore}
                                                        >
                                                            <Upload className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                                
                                                {hasFiles && (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {previews.map((preview, index) => (
                                                            <div 
                                                                key={index}
                                                                className="relative group rounded-lg border overflow-hidden bg-muted/30"
                                                            >
                                                                {preview !== 'video-placeholder' && preview !== 'error-preview' ? (
                                                                    <img 
                                                                        src={preview} 
                                                                        alt={`Preview ${index + 1}`}
                                                                        className="w-full h-32 object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-32 flex items-center justify-center bg-muted">
                                                                        <span className="text-xs text-muted-foreground text-center p-2">
                                                                            {files[index].name}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                                    onClick={() => removeFile(index)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                                <div className="p-2 bg-background/80 backdrop-blur-sm">
                                                                    <p className="text-xs text-muted-foreground truncate">
                                                                        {files[index].name}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {(files[index].size / 1024).toFixed(1)} KB
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <p className="text-sm text-muted-foreground mt-4">
                                                    Adjunta hasta 4 imágenes o videos (máx. 5MB cada uno)
                                                </p>
                                            </div>

                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={loading}
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Creando..." : t('common.save')}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
