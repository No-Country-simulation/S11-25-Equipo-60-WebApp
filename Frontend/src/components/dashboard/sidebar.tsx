"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    LayoutDashboard,
    FileText,
    PlusCircle,
    Clock,
    Building2,
    Users,
    FolderKanban,
    BarChart3,
    ChevronDown,
    ChevronsUpDown,
    LogOut
} from "lucide-react"
import { useAuthStore } from "@/store/auth.store"
import { useTranslation } from "@/lib/i18n-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import {
    Sidebar as SidebarPrimitive,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface NavLink {
    name: string
    href: string
    icon: any
    roles: ('visitante' | 'editor' | 'admin')[]
}

// Navegación organizada por secciones
const visitanteLinks: NavLink[] = [
    {
        name: "nav.dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ['visitante', 'editor', 'admin']
    },
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
]

const editorLinks: NavLink[] = [
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
]

const adminLinks: NavLink[] = [
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
    const router = useRouter()
    const { user, logout } = useAuthStore()
    const { t } = useTranslation()

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    // Filtrar links según el rol
    const filteredVisitanteLinks = visitanteLinks.filter(link =>
        user?.role && link.roles.includes(user.role)
    )
    const filteredEditorLinks = editorLinks.filter(link =>
        user?.role && link.roles.includes(user.role)
    )
    const filteredAdminLinks = adminLinks.filter(link =>
        user?.role && link.roles.includes(user.role)
    )

    return (
        <SidebarPrimitive collapsible="icon">
            {/* Header con logo simple */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-linear-to-br from-purple-500 to-blue-600 text-sidebar-primary-foreground">
                                    <LayoutDashboard className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Testimonial App</span>
                                    <span className="truncate text-xs">
                                        {user?.role === 'admin' ? 'Administrador' : user?.role === 'editor' ? 'Editor' : 'Visitante'}
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Sección General */}
                {filteredVisitanteLinks.length > 0 && (
                    <Collapsible defaultOpen className="group/collapsible">
                        <SidebarGroup>
                            <SidebarGroupLabel asChild>
                                <CollapsibleTrigger className="flex w-full items-center">
                                    General
                                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                </CollapsibleTrigger>
                            </SidebarGroupLabel>
                            <CollapsibleContent>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {filteredVisitanteLinks.map((link) => {
                                            const LinkIcon = link.icon
                                            const isActive = pathname === link.href

                                            return (
                                                <SidebarMenuItem key={link.href}>
                                                    <SidebarMenuButton asChild isActive={isActive}>
                                                        <Link href={link.href}>
                                                            <LinkIcon />
                                                            <span>{t(link.name)}</span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            )
                                        })}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </CollapsibleContent>
                        </SidebarGroup>
                    </Collapsible>
                )}

                {/* Sección Editor */}
                {filteredEditorLinks.length > 0 && (
                    <Collapsible defaultOpen className="group/collapsible">
                        <SidebarGroup>
                            <SidebarGroupLabel asChild>
                                <CollapsibleTrigger className="flex w-full items-center">
                                    Editor
                                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                </CollapsibleTrigger>
                            </SidebarGroupLabel>
                            <CollapsibleContent>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {filteredEditorLinks.map((link) => {
                                            const LinkIcon = link.icon
                                            const isActive = pathname === link.href

                                            return (
                                                <SidebarMenuItem key={link.href}>
                                                    <SidebarMenuButton asChild isActive={isActive}>
                                                        <Link href={link.href}>
                                                            <LinkIcon />
                                                            <span>{t(link.name)}</span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            )
                                        })}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </CollapsibleContent>
                        </SidebarGroup>
                    </Collapsible>
                )}

                {/* Sección Admin */}
                {filteredAdminLinks.length > 0 && (
                    <Collapsible defaultOpen className="group/collapsible">
                        <SidebarGroup>
                            <SidebarGroupLabel asChild>
                                <CollapsibleTrigger className="flex w-full items-center">
                                    Administración
                                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                </CollapsibleTrigger>
                            </SidebarGroupLabel>
                            <CollapsibleContent>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {filteredAdminLinks.map((link) => {
                                            const LinkIcon = link.icon
                                            const isActive = pathname === link.href

                                            return (
                                                <SidebarMenuItem key={link.href}>
                                                    <SidebarMenuButton asChild isActive={isActive}>
                                                        <Link href={link.href}>
                                                            <LinkIcon />
                                                            <span>{t(link.name)}</span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            )
                                        })}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </CollapsibleContent>
                        </SidebarGroup>
                    </Collapsible>
                )}
            </SidebarContent>

            {/* Footer con usuario */}
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarFallback className="rounded-lg bg-linear-to-br from-purple-500 to-blue-600 text-white">
                                            {user?.username?.slice(0, 2).toUpperCase() || 'US'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{user?.username || 'Usuario'}</span>
                                        <span className="truncate text-xs">{user?.email}</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarFallback className="rounded-lg bg-linear-to-br from-purple-500 to-blue-600 text-white">
                                                {user?.username?.slice(0, 2).toUpperCase() || 'US'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{user?.username || 'Usuario'}</span>
                                            <span className="truncate text-xs">{user?.email}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/perfil">
                                        <Users className="mr-2 h-4 w-4" />
                                        Mi Perfil
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <div className="flex items-center justify-around px-2 py-2">
                                    <ThemeToggle />
                                    <LanguageToggle />
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Cerrar Sesión
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </SidebarPrimitive>
    )
}
