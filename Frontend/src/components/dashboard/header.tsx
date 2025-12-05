"use client"

import { useAuthStore } from "@/store/auth.store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, Settings, User } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useTranslation } from "@/lib/i18n-provider"

export function Header() {
    const { user, logout } = useAuthStore()
    const router = useRouter()
    const { t } = useTranslation()

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    const getInitials = () => {
        if (user?.username) {
            return user.username.substring(0, 2).toUpperCase()
        }
        if (user?.email) {
            return user.email.substring(0, 2).toUpperCase()
        }
        return "U"
    }

    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold">{t('dashboard.overview')}</h2>
                </div>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <LanguageToggle />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                                        {getInitials()}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {user?.username || user?.email}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.role && t(`roles.${user.role}`)}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push('/dashboard/perfil')}>
                                <User className="mr-2 h-4 w-4" />
                                <span>{t('common.profile')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/dashboard/configuracion')}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>{t('common.settings')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>{t('common.logout')}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
