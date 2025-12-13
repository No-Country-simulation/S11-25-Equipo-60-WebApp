"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useParams, useRouter } from "next/navigation"
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

const formSchema = z.object({
  new_password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  confirm_password: z.string().min(1, { message: "Confirma la contraseña" }),
})

type FormValues = z.infer<typeof formSchema>

export default function PasswordConfirmPage() {
  const params = useParams() as { uid?: string; token?: string }
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { new_password: "", confirm_password: "" },
  })

  async function onSubmit(values: FormValues) {
    if (values.new_password !== values.confirm_password) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    if (!params.uid || !params.token) {
      toast.error("Parámetros inválidos en la URL")
      return
    }

    setIsLoading(true)
    try {
      await authService.confirmPasswordReset({
        uid: params.uid,
        token: params.token,
        new_password: values.new_password,
      })

      toast.success("Contraseña actualizada correctamente. Ahora puedes iniciar sesión.")
      router.push("/login")
    } catch (error: any) {
      console.error("Confirm reset error:", error)
      const message = error?.response?.data || error?.message || "Error al establecer la nueva contraseña"
      toast.error(String(message))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur">
        <h2 className="text-2xl font-semibold text-white mb-4">Establecer nueva contraseña</h2>
        <p className="text-sm text-gray-300 mb-6">Introduce tu nueva contraseña.</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Nueva contraseña</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Nueva contraseña"
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
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Confirmar contraseña</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Repite la contraseña"
                      {...field}
                      className="h-12 border-white/10 bg-white/5 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600">
              {isLoading ? "Guardando..." : "Establecer contraseña"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
