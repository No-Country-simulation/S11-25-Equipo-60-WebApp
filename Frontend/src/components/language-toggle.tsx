"use client"

import { Languages } from "lucide-react"
import { useTranslation } from "@/lib/i18n-provider"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LanguageToggle() {
    const { locale, setLocale } = useTranslation()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Languages className="h-5 w-5" />
                    <span className="sr-only">Cambiar idioma</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => setLocale('es')}
                    className={locale === 'es' ? 'bg-accent' : ''}
                >
                    🇪🇸 Español
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setLocale('en')}
                    className={locale === 'en' ? 'bg-accent' : ''}
                >
                    🇺🇸 English
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
