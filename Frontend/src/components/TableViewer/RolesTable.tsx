"use client"
import { useState } from "react"
import type { IRole, IPermission } from "@/interfaces/app.interface"
import GenericTable from "./GenericTable"
import { ArrayFieldPopover } from "./ArrayFieldPopover"
import { MOCK_PERMISSIONS } from "@/mock/DataUserMock"

interface RolesTableProps {
  readonly roles?: IRole[]
  readonly setRoles?: React.Dispatch<React.SetStateAction<IRole[]>>
  readonly availablePermissions?: IPermission[]
}

export function RolesTable({
  roles = [],
  setRoles,
  availablePermissions = MOCK_PERMISSIONS
}: RolesTableProps) {
  const [localData, setLocalData] = useState<IRole[]>(roles)
  const data = setRoles ? roles : localData
  const setData = setRoles ?? setLocalData

  const renderIcon = (row: IRole, isEditing: boolean, onChange: (value: any) => void) => {
    if (isEditing) {
      return (
        <input
          type="text"
          value={row.icon || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 text-center text-2xl"
          placeholder="👤"
        />
      )
    }
    return <span className="text-2xl">{row.icon || '👤'}</span>
  }

  // Función para renderizar columna personalizada de permissions
  const renderPermissions = (row: IRole, isEditing: boolean, onChange: (value: any) => void) => {
    if (isEditing) {
      const selectedIds = row.permissions?.filter(p => p != null).map(p => p.id) || []
      return (
        <ArrayFieldPopover
          label="Permisos"
          allOptions={availablePermissions}
          selectedIds={selectedIds}
          onChange={(ids) => {
            const selectedPermissions = availablePermissions.filter(p => ids.includes(p.id))
            onChange(selectedPermissions)
          }}
        />
      )
    }

    // Vista de solo lectura
    const permissions = (row.permissions || []).filter(p => p != null)
    return (
      <div className="flex flex-wrap gap-1">
        {permissions.length > 0 ? (
          permissions.slice(0, 3).map((p) => {
            const bgColor = p.color ? `${p.color}20` : '#dbeafe'
            const textColor = p.color || '#1e40af'
            return (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium"
                style={{ backgroundColor: bgColor, color: textColor }}
              >
                <span>{p.icon || '🔒'}</span>
                <span>{p.name}</span>
              </span>
            )
          })
        ) : (
          <span className="text-sm text-muted-foreground">Sin permisos</span>
        )}
        {permissions.length > 3 && (
          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
            +{permissions.length - 3} más
          </span>
        )}
      </div>
    )
  }

  return (
    <GenericTable
      data={data}
      setData={setData}
      title="Roles"
      firstColumns={['icon']}
      customRenderers={{
        icon: renderIcon,
        permissions: renderPermissions
      }}
    />
  )
}
