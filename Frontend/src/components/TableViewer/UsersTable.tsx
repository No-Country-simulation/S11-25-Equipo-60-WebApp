"use client"
import { useState } from "react"
import type { IUser, IRole } from "@/interfaces/app.interface"
import GenericTable from "./GenericTable"
import { ArrayFieldPopover } from "./ArrayFieldPopover"
import { MOCK_ROLES } from "@/mock/DataUserMock"

interface UsersTableProps {
  readonly users?: IUser[]
  readonly setUsers?: React.Dispatch<React.SetStateAction<IUser[]>>
  readonly availableRoles?: IRole[]
}

export function UsersTable({
  users = [],
  setUsers,
  availableRoles = MOCK_ROLES
}: UsersTableProps) {
  const [localData, setLocalData] = useState<IUser[]>(users)
  const data = setUsers ? users : localData
  const setData = setUsers ?? setLocalData

  const renderAvatar = (row: IUser, isEditing: boolean, onChange: (value: any) => void) => {
    if (isEditing) {
      return (
        <input
          type="text"
          value={row.avatar || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-xs"
          placeholder="URL del avatar"
        />
      )
    }
    return (
      <img
        src={row.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
        alt={row.name}
        className="w-10 h-10 rounded-full"
      />
    )
  }

  // Función para renderizar columna personalizada de roles
  const renderRoles = (row: IUser, isEditing: boolean, onChange: (value: any) => void) => {
    if (isEditing) {
      const selectedIds = row.role?.filter(r => r != null).map(r => r.id) || []
      return (
        <ArrayFieldPopover
          label="Roles"
          allOptions={availableRoles}
          selectedIds={selectedIds}
          onChange={(ids) => {
            const selectedRoles = availableRoles.filter(r => ids.includes(r.id))
            onChange(selectedRoles)
          }}
        />
      )
    }

    // Vista de solo lectura
    const roles = (row.role || []).filter(r => r != null)
    return (
      <div className="flex flex-wrap gap-1">
        {roles.length > 0 ? (
          roles.slice(0, 2).map((r) => {
            const bgColor = r.color ? `${r.color}20` : '#f3e8ff'
            const textColor = r.color || '#7c3aed'
            return (
              <span
                key={r.id}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium"
                style={{ backgroundColor: bgColor, color: textColor }}
              >
                <span>{r.icon || '👤'}</span>
                <span>{r.name}</span>
              </span>
            )
          })
        ) : (
          <span className="text-sm text-muted-foreground">Sin roles</span>
        )}
        {roles.length > 2 && (
          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
            +{roles.length - 2} más
          </span>
        )}
      </div>
    )
  }

  return (
    <GenericTable
      data={data}
      setData={setData}
      title="Users"
      excludeColumns={['password']}
      firstColumns={['avatar']}
      customRenderers={{
        avatar: renderAvatar,
        role: renderRoles
      }}
    />
  )
}
