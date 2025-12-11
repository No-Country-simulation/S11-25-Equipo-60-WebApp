import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MENU_CONFIG } from "../constants/menu.constants"

/**
 * UserAvatar Component
 * Single Responsibility: Display user avatar with initials
 * Props interface for better type safety
 */
interface UserAvatarProps {
  readonly initials: string
  readonly className?: string
}

export function UserAvatar({ initials, className }: UserAvatarProps) {
  return (
    <Avatar className={`${MENU_CONFIG.AVATAR.SIZE} ${className || ""}`}>
      <AvatarFallback
        className={`${MENU_CONFIG.AVATAR.GRADIENT} ${MENU_CONFIG.AVATAR.TEXT_COLOR}`}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
