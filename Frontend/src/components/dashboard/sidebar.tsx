"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    FileText,
    PlusCircle,
    Clock,
    Building2,
    Users,
    FolderKanban,
    BarChart3
} from "lucide-react"
import { useAuthStore } from "@/store/auth.store"
import { useTranslation } from "@/lib/i18n-provider"
import { cn } from "@/lib/utils"

interface NavLink {
    name: string
    href: string
    icon: any
    roles: ('visitante' | 'editor' | 'admin')[]
}

const navLinks: NavLink[] = [
    {
        name: "nav.dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ['visitante', 'editor', 'admin']
    },
    // === SECCIÓN VISITANTE (Cliente) ===
    // Todos los usuarios pueden crear y gestionar SUS testimonios como clientes
    {
        name: "Mis Testimonios",
        href: "/dashboard/visitante/mis-testimonios",
        icon: FileText,
        roles: ['visitante', 'editor', 'admin']
    },
    {
        name: "Crear Testimonio",
        href: "/dashboard/visitante/crear-testimonio",
        icon: PlusCircle,
        roles: ['visitante', 'editor', 'admin']
    },
    // === SECCIÓN EDITOR (Staff de Organización) ===
    // Solo editores y admins gestionan testimonios de organizaciones
    {
        name: "Gestionar Testimonios",
        href: "/dashboard/editor/testimonios",
        icon: Clock,
        roles: ['editor', 'admin']
    },
    {
        name: "Mis Organizaciones",
        href: "/dashboard/editor/organizaciones",
        icon: Building2,
        roles: ['editor', 'admin']
    },
    {
        name: "Estadísticas",
        href: "/dashboard/editor/estadisticas",
        icon: BarChart3,
        roles: ['editor', 'admin']
    },
    // === SECCIÓN ADMIN (Supervisión) ===
    // Solo admins tienen acceso administrativo total
    {
        name: "Usuarios",
        href: "/dashboard/admin/usuarios",
        icon: Users,
        roles: ['admin']
    },
    {
        name: "Testimonios Públicos",
        href: "/dashboard/admin/testimonios",
        icon: FileText,
        roles: ['admin']
    },
    {
        name: "Organizaciones",
        href: "/dashboard/admin/organizaciones",
        icon: Building2,
        roles: ['admin']
    },
    {
        name: "Categorías",
        href: "/dashboard/admin/categorias",
        icon: FolderKanban,
        roles: ['admin']
    },
]

export function Sidebar() {
    const pathname = usePathname()
    const { user } = useAuthStore()
    const { t } = useTranslation()

    // Filtrar links según el rol del usuario
    const filteredLinks = navLinks.filter(link =>
        user?.role && link.roles.includes(user.role)
    )

    return (
        <div className="pb-12 w-64 border-r min-h-screen bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block">
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <Link href="/dashboard" className="mb-6 block">
                        <h2 className="px-4 text-xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Testimonial App
                        </h2>
                    </Link>
                    <div className="space-y-1 mt-6">
                        {filteredLinks.map((link) => {
                            const LinkIcon = link.icon
                            const isActive = pathname === link.href

                            return (
                                <Button
                                    key={link.href}
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start transition-all",
                                        isActive && "bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-l-2 border-purple-500"
                                    )}
                                    asChild
                                >
                                    <Link href={link.href}>
                                        <LinkIcon className="mr-2 h-4 w-4" />
                                        {t(link.name)}
                                    </Link>
                                </Button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
