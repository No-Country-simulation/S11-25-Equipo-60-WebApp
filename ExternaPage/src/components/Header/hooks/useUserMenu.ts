"use client"

import { useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Settings, User as UserIcon } from "lucide-react"
import type { UserMenuOption } from "../types/user.types"
import { ROUTE_PATHS } from "../constants/menu.constants"

/**
 * Custom hook for user menu logic
 * Single Responsibility: Manages menu navigation and logout
 * Strategy Pattern: Different actions for different menu items
 */
interface UseUserMenuProps {
  logout: () => Promise<void>
  t: (key: string) => string
}

export function useUserMenu({ logout, t }: UseUserMenuProps) {
  const router = useRouter()

  const handleLogout = useCallback(async () => {
    await logout()
    router.push(ROUTE_PATHS.LOGIN)
  }, [logout, router])

  const navigateToProfile = useCallback(() => {
    router.push(ROUTE_PATHS.PROFILE)
  }, [router])

  const navigateToSettings = useCallback(() => {
    router.push(ROUTE_PATHS.SETTINGS)
  }, [router])

  const menuOptions: UserMenuOption[] = useMemo(
    () => [
      {
        id: "profile",
        label: t("common.profile"),
        icon: UserIcon,
        onClick: navigateToProfile,
        variant: "default"
      },
      {
        id: "settings",
        label: t("common.settings"),
        icon: Settings,
        onClick: navigateToSettings,
        variant: "default"
      },
      {
        id: "logout",
        label: t("common.logout"),
        icon: LogOut,
        onClick: handleLogout,
        variant: "destructive"
      }
    ],
    [t, navigateToProfile, navigateToSettings, handleLogout]
  )

  return {
    menuOptions,
    handleLogout,
    navigateToProfile,
    navigateToSettings
  }
}
