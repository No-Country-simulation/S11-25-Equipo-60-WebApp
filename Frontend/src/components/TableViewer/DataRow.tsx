import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TableCell, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Save, X } from "lucide-react"

type CustomRenderer<T> = (
  row: T,
  isEditing: boolean,
  onChange: (value: any) => void
) => React.ReactNode

interface DataRowProps<T extends Record<string, any>> {
  row: T
  columns: (keyof T)[]
  rowId: string
  isEditing: boolean
  editValues: Partial<T> | undefined
  handleChange: (id: string, field: keyof T, value: any) => void
  saveEdit: (id: string) => void
  cancelEdit: (id?: string) => void
  startEdit: (id: string) => void
  handleDelete: (id: string) => void
  translations: {
    buttons: { save: string; cancel: string; edit: string; delete: string }
  }
  customRenderers?: Partial<Record<keyof T, CustomRenderer<T>>>
}

export function DataRow<T extends Record<string, any>>(props: Readonly<DataRowProps<T>>) {
  const {
    row,
    columns,
    rowId,
    isEditing,
    editValues,
    handleChange,
    saveEdit,
    cancelEdit,
    startEdit,
    handleDelete,
    translations,
    customRenderers,
  } = props
  const { buttons } = translations

  const getInputType = (value: any): string => {
    if (typeof value === "number") return "number"
    return "text"
  }

  const formatValue = (value: any): string => {
    if (typeof value === "number") {
      return value % 1 === 0 ? String(value) : value.toFixed(2)
    }
    return String(value ?? "")
  }

  return (
    <TableRow>
      {columns.map((col) => {
        const value = row[col]
        const editValue = editValues?.[col] ?? value
        const inputType = getInputType(value)
        const customRenderer = customRenderers?.[col]

        // Crear un objeto combinado con los valores originales y los cambios pendientes
        const currentRow = isEditing && editValues ? { ...row, ...editValues } : row

        return (
          <TableCell key={String(col)}>
            {customRenderer ? (
              customRenderer(
                currentRow,
                isEditing,
                (newValue: any) => {
                  if (isEditing) {
                    handleChange(rowId, col, newValue)
                  }
                }
              )
            ) : (
              <>
                {isEditing ? (
                  <Input
                    type={inputType}
                    step={inputType === "number" ? "0.01" : undefined}
                    value={String(editValue ?? "")}
                    onChange={(e) => handleChange(rowId, col, e.target.value)}
                  />
                ) : (
                  formatValue(value)
                )}
              </>
            )}
          </TableCell>
        )
      })}
      <TableCell>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => saveEdit(rowId)}
                aria-label={buttons.save}
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => cancelEdit(rowId)}
                aria-label={buttons.cancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => startEdit(rowId)}
                aria-label={buttons.edit}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDelete(rowId)}
                aria-label={buttons.delete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}
