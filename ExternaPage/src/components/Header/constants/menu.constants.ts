/**
 * Menu configuration constants
 * Following Open/Closed Principle - easy to extend without modification
 */

export const MENU_CONFIG = {
  AVATAR: {
    SIZE: "h-9 w-9",
    GRADIENT: "bg-gradient-to-br from-purple-500 to-blue-500",
    TEXT_COLOR: "text-white"
  },
  DROPDOWN: {
    WIDTH: "w-56",
    ALIGN: "end" as const
  }
} as const

export const ROUTE_PATHS = {
  PROFILE: "/dashboard/perfil",
  SETTINGS: "/dashboard/configuracion",
  LOGIN: "/login"
} as const

export const DEFAULT_INITIALS = "U"
export const INITIALS_LENGTH = 2
