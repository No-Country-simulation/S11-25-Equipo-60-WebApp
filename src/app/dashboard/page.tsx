"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"

export default function DashboardPage() {
    const { user } = useAuthStore()
    const router = useRouter()

    useEffect(() => {
        // Redirigir según el rol del usuario
        if (user?.role === 'visitante') {
            router.push('/dashboard/visitante/mis-testimonios')
        } else if (user?.role === 'editor') {
            router.push('/dashboard/editor')
        } else if (user?.role === 'admin') {
            router.push('/dashboard/admin')
        }
    }, [user, router])

    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    )
}
