"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Mapeo de rutas a nombres legibles
const routeNames: Record<string, string> = {
    dashboard: "Dashboard",
    visitante: "Visitante",
    editor: "Editor",
    admin: "Administración",
    "mis-testimonios": "Mis Testimonios",
    "crear-testimonio": "Crear Testimonio",
    testimonios: "Testimonios",
    organizaciones: "Organizaciones",
    estadisticas: "Estadísticas",
    usuarios: "Usuarios",
    categorias: "Categorías",
    perfil: "Mi Perfil",
    editar: "Editar",
}

export function DynamicBreadcrumbs() {
    const pathname = usePathname()
    
    // No mostrar breadcrumbs en la raíz del dashboard
    if (pathname === "/dashboard" || pathname === "/dashboard/admin" || pathname === "/dashboard/editor") {
        return null
    }

    // Dividir la ruta en segmentos
    const segments = pathname.split("/").filter(Boolean)
    
    // Construir breadcrumbs
    const breadcrumbs = segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join("/")}`
        const isLast = index === segments.length - 1
        
        // Si es un ID numérico, usar un nombre genérico
        const name = /^\d+$/.test(segment) 
            ? "Detalle" 
            : routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

        return {
            name,
            path,
            isLast,
        }
    })

    return (
        <Breadcrumb className="mb-4">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/dashboard">
                            <Home className="h-4 w-4" />
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                
                {breadcrumbs.map((crumb, index) => (
                    <div key={crumb.path} className="flex items-center gap-1.5">
                        <BreadcrumbSeparator>
                            <ChevronRight className="h-4 w-4" />
                        </BreadcrumbSeparator>
                        
                        <BreadcrumbItem>
                            {crumb.isLast ? (
                                <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link href={crumb.path}>{crumb.name}</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                    </div>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
