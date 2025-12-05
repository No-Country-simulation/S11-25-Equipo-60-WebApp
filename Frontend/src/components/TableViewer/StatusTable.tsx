"use client"
import { useState } from "react"
import type { IStatus } from "@/interfaces/app.interface"
import GenericTable from "./GenericTable"

interface StatusTableProps {
  readonly status?: IStatus[]
  readonly setStatus?: React.Dispatch<React.SetStateAction<IStatus[]>>
}

export function StatusTable({ status = [], setStatus }: StatusTableProps) {
  const [localData, setLocalData] = useState<IStatus[]>(status)
  const data = setStatus ? status : localData
  const setData = setStatus ?? setLocalData

  const renderIcon = (row: IStatus, isEditing: boolean, onChange: (value: any) => void) => {
    if (isEditing) {
      return (
        <input
          type="text"
          value={row.icon || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 text-center text-2xl"
          placeholder="📌"
        />
      )
    }
    return <span className="text-2xl">{row.icon || '📌'}</span>
  }

  const renderColor = (row: IStatus, isEditing: boolean, onChange: (value: any) => void) => {
    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={row.color || '#6b7280'}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-8 rounded cursor-pointer"
          />
          <input
            type="text"
            value={row.color || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-24 px-2 py-1 border rounded text-sm"
            placeholder="#000000"
          />
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded border"
          style={{ backgroundColor: row.color || '#6b7280' }}
        />
        <span className="text-sm font-mono">{row.color || '#6b7280'}</span>
      </div>
    )
  }

  return (
    <GenericTable
      data={data}
      setData={setData}
      title="Status"
      firstColumns={['icon']}
      customRenderers={{
        icon: renderIcon,
        color: renderColor
      }}
    />
  )
}
