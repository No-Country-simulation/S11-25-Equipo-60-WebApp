"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { authService } from "@/services/auth.service"
import { toast } from "sonner"
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
import Link from "next/link"

const formSchema = z.object({
  email: z.string().email({ message: "Ingresa un email válido" }),
})

type FormValues = z.infer<typeof formSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    try {
      await authService.requestPasswordReset({ email: values.email })
      toast.success(
        "Si existe una cuenta con ese email, recibirás un enlace para restablecer la contraseña."
      )
    } catch (error: any) {
      console.error("Reset password error:", error)
      const message = error?.response?.data || error?.message || "Error al enviar el email."
      toast.error(String(message))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur">
        <h2 className="text-2xl font-semibold text-white mb-4">Recuperar contraseña</h2>
        <p className="text-sm text-gray-300 mb-6">Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <Button type="submit" disabled={isLoading} className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600">
              {isLoading ? "Enviando..." : "Enviar enlace"}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center">
          <Link href="/login" className="text-sm text-gray-300 hover:underline">Volver a iniciar sesión</Link>
        </div>
      </div>
    </div>
  )
}
