"use client"

import { Button } from "@/components/ui/button"
import { useTranslation } from "@/providers"
import { selectIsLoggedIn, useAuthStore } from "@/stores"
import { UserMenu } from "./UserMenu"

/**
 * AuthHeader Component
 * Composition Pattern: Composes UserMenu for authenticated users
 * Single Responsibility: Handles authentication-based UI rendering
 */
export const AuthHeader = () => {
  const { t } = useTranslation()
  const isLoggedIn = useAuthStore(selectIsLoggedIn)

  return (
    <div className="flex gap-2 items-center">
      {isLoggedIn ? (
        <UserMenu />
      ) : (
        <>
          <Button variant="secondary">
            {t("landing.auth.login")}
          </Button>
          <Button>
            {t("landing.auth.register")}
          </Button>
        </>
      )}
    </div>
  )
}



