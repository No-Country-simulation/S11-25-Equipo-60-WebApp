import type { Usuario } from "@/interfaces"

/**
 * UserInfo Component
 * Single Responsibility: Display user information in menu
 * Presentation Component Pattern
 */
interface UserInfoProps {
  readonly profile: Usuario | null
  readonly t: (key: string) => string
}

export function UserInfo({ profile, t }: Readonly<UserInfoProps>) {
  const displayName = profile?.username || t("common.guest")
  const displayEmail = profile?.email
  const roleDisplay = profile?.rol ? t(`roles.${profile.rol}`) : ""

  return (
    <div className="flex flex-col space-y-1">
      <p className="text-sm font-medium leading-none">
        {displayName}
      </p>
      {displayEmail && (
        <p className="text-xs leading-none text-muted-foreground">
          {displayEmail}
        </p>
      )}
      {roleDisplay && (
        <p className="text-xs leading-none text-muted-foreground">
          {roleDisplay}
        </p>
      )}
    </div>
  )
}
