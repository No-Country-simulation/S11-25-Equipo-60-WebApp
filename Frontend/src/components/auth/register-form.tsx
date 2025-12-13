"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
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
    username: z.string().min(3, {
        message: "Username must be at least 3 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export function RegisterForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            await authService.register({
                username: values.username,
                email: values.email,
                password: values.password,
            })
            toast.success("¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.")
            router.push("/login")
        } catch (error: any) {
            console.error(error)
            const errorMessage = error.response?.data?.username?.[0]
                || error.response?.data?.email?.[0]
                || error.response?.data?.password?.[0]
                || "Error al crear la cuenta. Intenta de nuevo."
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="grid gap-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-200">Nombre de usuario</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="juanperez"
                                        {...field}
                                        className="h-12 border-white/10 bg-white/5 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                                    />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                            </FormItem>
                        )}
                    />
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
                                        className="h-12 border-white/10 bg-white/5 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20"
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
                                        className="h-12 border-white/10 bg-white/5 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                                    />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-200">Confirmar contraseña</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        {...field}
                                        className="h-12 border-white/10 bg-white/5 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                                    />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="h-12 w-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold shadow-lg hover:from-indigo-700 hover:to-cyan-700 transition-all duration-200 hover:shadow-indigo-500/50"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creando cuenta...
                            </span>
                        ) : (
                            "Crear cuenta"
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
                        ¿Ya tienes cuenta?
                    </span>
                </div>
            </div>
            <Link
                href="/login"
                className="block w-full rounded-lg border border-white/10 bg-white/5 py-3 text-center text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20"
            >
                Iniciar sesión
            </Link>

            <Link
                href="/password/forgot"
                className="mt-2 block w-full rounded-lg border border-transparent bg-transparent py-2 text-center text-sm text-gray-300 hover:underline"
            >
                ¿Olvidaste tu contraseña?
            </Link>
        </div>
    )
}
