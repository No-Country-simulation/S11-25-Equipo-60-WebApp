/**
 * User-related type definitions
 * Following Interface Segregation Principle - only necessary properties
 * Aligned with auth.store structure
 */

/**
 * Auth User - Matches the actual auth store structure
 */
export interface AuthUser {
  userId: number | null
  role: string | null
}

/**
 * User display information
 */
export interface UserDisplayInfo {
  displayName: string
  initials: string
  role?: string
}

/**
 * Menu option configuration
 */
export interface UserMenuOption {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  variant?: "default" | "destructive"
}
