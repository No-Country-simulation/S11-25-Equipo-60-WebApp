import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import type { UserMenuOption } from "../types/user.types"

/**
 * UserMenuItem Component
 * Single Responsibility: Render individual menu item
 */
interface UserMenuItemProps {
  readonly option: UserMenuOption
}

export function UserMenuItem({ option }: UserMenuItemProps) {
  const Icon = option.icon
  const isDestructive = option.variant === "destructive"

  return (
    <DropdownMenuItem
      onClick={option.onClick}
      className={isDestructive ? "text-red-600 dark:text-red-400" : ""}
    >
      <Icon className="mr-2 h-4 w-4" />
      <span>{option.label}</span>
    </DropdownMenuItem>
  )
}

/**
 * UserMenuItems Component
 * Single Responsibility: Render list of menu items with separators
 */
interface UserMenuItemsProps {
  options: UserMenuOption[]
}

export function UserMenuItems({ options }: UserMenuItemsProps) {
  // Separate logout from other options for better UX
  const regularOptions = options.filter(opt => opt.variant !== "destructive")
  const destructiveOptions = options.filter(opt => opt.variant === "destructive")

  return (
    <>
      {regularOptions.map((option) => (
        <UserMenuItem key={option.id} option={option} />
      ))}
      {destructiveOptions.length > 0 && (
        <>
          <DropdownMenuSeparator />
          {destructiveOptions.map((option) => (
            <UserMenuItem key={option.id} option={option} />
          ))}
        </>
      )}
    </>
  )
}

// Import statement for DropdownMenuSeparator
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
