import { useMemo } from "react"
import { DEFAULT_INITIALS } from "../constants/menu.constants"

/**
 * Custom hook to generate user initials from username
 * Single Responsibility: Only handles initials generation logic
 * Pure Function Pattern
 */
export function useUserInitials(username?: string | null): string {
  return useMemo(() => {
    if (!username) return DEFAULT_INITIALS

    // Generate initials from username (e.g., "Juan Perez" -> "JP", "admin" -> "AD")
    const words = username.trim().split(/\s+/)
    
    if (words.length >= 2) {
      // Multiple words: take first letter of each
      return (words[0][0] + words[1][0]).toUpperCase()
    } else {
      // Single word: take first two letters
      return username.slice(0, 2).toUpperCase()
    }
  }, [username])
}
