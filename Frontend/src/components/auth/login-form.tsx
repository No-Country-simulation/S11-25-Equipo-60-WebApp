"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { authService } from "@/services/auth.service"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(1, {
        message: "Password is required.",
    }),
})

export function LoginForm() {
    const router = useRouter()
    const { setToken, setUser } = useAuthStore()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            // 1. Login y obtener token
            const loginResponse = await authService.login(values)
            console.log('🔐 Login response:', loginResponse)

            if (!loginResponse.access || !loginResponse.user_id) {
                toast.error("Error en la respuesta del servidor")
                return
            }

            // 2. Guardar token temporalmente
            const token = loginResponse.access
            setToken(token)

            // 3. Detectar rol del usuario usando el servicio
            console.log('🔍 Detectando rol del usuario...')
            const userData = await authService.getUserData(loginResponse.user_id, token)

            console.log('✅ Usuario logueado:', userData)

            // 4. Guardar usuario en el store
            setUser(userData)

            // 5. Mensaje de bienvenida según rol
            const roleMessages: Record<string, string> = {
                visitante: '¡Bienvenido! 🎉',
                editor: '¡Bienvenido, Editor! 📝',
                admin: '¡Bienvenido, Administrador! 👑'
            }
            toast.success(roleMessages[userData.role] || '¡Bienvenido! 🎉')

            // 6. Redirigir al dashboard
            router.push("/dashboard")
        } catch (error: any) {
            console.error('❌ Login error:', error)
            const errorMessage = error.response?.data?.non_field_errors?.[0]
                || error.response?.data?.detail
                || error.message
                || "Credenciales inválidas. Verifica tu email y contraseña."
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="grid gap-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-200">Email</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="tu@email.com"
                                        {...field}
                                        className="h-12 border-white/10 bg-white/5 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                                    />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-200">Contraseña</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        {...field}
                                        className="h-12 border-white/10 bg-white/5 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                                    />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="h-12 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 hover:shadow-purple-500/50"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Iniciando sesión...
                            </span>
                        ) : (
                            "Iniciar Sesión"
                        )}
                    </Button>
                </form>
            </Form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-transparent px-2 text-gray-400">
                        ¿No tienes cuenta?
                    </span>
                </div>
            </div>
            <Link
                href="/register"
                className="block w-full rounded-lg border border-white/10 bg-white/5 py-3 text-center text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20"
            >
                Crear una cuenta nueva
            </Link>
        </div>
    )
}
