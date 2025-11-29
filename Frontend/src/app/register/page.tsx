import { Metadata } from "next"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
    title: "Registro - Testimonial App",
    description: "Crea tu cuenta",
}

export default function RegisterPage() {
    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -left-1/2 h-full w-full rounded-full bg-indigo-500/20 blur-3xl animate-pulse" />
                <div className="absolute -bottom-1/2 -right-1/2 h-full w-full rounded-full bg-cyan-500/20 blur-3xl animate-pulse delay-700" />
            </div>

            {/* Register card */}
            <div className="relative z-10 mx-auto w-full max-w-md px-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
                    <div className="mb-8 flex flex-col space-y-2 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg">
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
                                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Crear cuenta
                        </h1>
                        <p className="text-sm text-gray-300">
                            Únete a nuestra plataforma de testimonios
                        </p>
                    </div>
                    <RegisterForm />
                </div>

                {/* Footer text */}
                <p className="mt-6 text-center text-sm text-gray-400">
                    © 2025 Testimonial App. Todos los derechos reservados.
                </p>
            </div>
        </div>
    )
}
