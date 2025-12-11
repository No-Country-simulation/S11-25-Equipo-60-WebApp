"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/stores/hooks/useAuth"
import { useTranslation } from "@/providers"
import { UserAvatar } from "./UserAvatar"
import { UserInfo } from "./UserInfo"
import { UserMenuItems } from "./UserMenuItems"
import { MENU_CONFIG } from "../constants/menu.constants"
import { useUserInitials } from "../hooks/useUserInitials"
import { useUserMenu } from "../hooks/useUserMenu"

/**
 * UserMenu Component
 * Composition Pattern: Combines smaller components
 * Dependency Inversion: Depends on abstractions (hooks, types)
 * Facade Pattern: Uses useAuth hook to simplify store interaction
 */
export function UserMenu() {
  const { profile, logout } = useAuth()
  const { t } = useTranslation()

  const initials = useUserInitials(profile?.username)
  const { menuOptions } = useUserMenu({ logout, t })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full"
          aria-label={t("common.userMenu")}
        >
          <UserAvatar initials={initials} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={MENU_CONFIG.DROPDOWN.WIDTH}
        align={MENU_CONFIG.DROPDOWN.ALIGN}
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <UserInfo profile={profile} t={t} />
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <UserMenuItems options={menuOptions} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
