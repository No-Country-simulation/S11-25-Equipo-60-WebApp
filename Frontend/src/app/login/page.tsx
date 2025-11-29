import { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Login - Testimonial App",
  description: "Login to your account",
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 h-full w-full rounded-full bg-purple-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 h-full w-full rounded-full bg-blue-500/20 blur-3xl animate-pulse delay-700" />
      </div>

      {/* Login card */}
      <div className="relative z-10 mx-auto w-full max-w-md px-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 flex flex-col space-y-2 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Bienvenido de nuevo
            </h1>
            <p className="text-sm text-gray-300">
              Ingresa tus credenciales para continuar
            </p>
          </div>
          <LoginForm />
        </div>

        {/* Footer text */}
        <p className="mt-6 text-center text-sm text-gray-400">
          © 2025 Testimonial App. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}