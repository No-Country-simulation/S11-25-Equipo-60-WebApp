import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TableCell, TableRow } from "@/components/ui/table"
import { Save, X } from "lucide-react"

interface AddRowProps<T extends Record<string, any>> {
  columns: (keyof T)[]
  newValues: Partial<T>
  handleChangeNew: (field: keyof T, value: string) => void
  handleAdd: () => void
  cancelEdit: (id?: string) => void
  translations: {
    placeholders: Record<string, string>
    buttons: { save: string; cancel: string }
  }
}

export function AddRow<T extends Record<string, any>>(props: Readonly<AddRowProps<T>>) {
  const { columns, newValues, handleChangeNew, handleAdd, cancelEdit, translations } = props
  const { placeholders, buttons } = translations

  const getInputType = (value: any): string => {
    if (typeof value === "number") return "number"
    return "text"
  }

  return (
    <TableRow>
      {columns.map((col) => {
        const value = newValues[col]
        const inputType = getInputType(value)
        
        return (
          <TableCell key={String(col)}>
            <Input
              type={inputType}
              step={inputType === "number" ? "0.01" : undefined}
              value={value ?? ""}
              onChange={(e) => handleChangeNew(col, e.target.value)}
              placeholder={placeholders[String(col)] || String(col)}
            />
          </TableCell>
        )
      })}
      <TableCell>
        <div className="flex space-x-2">
          <Button size="icon" variant="ghost" onClick={handleAdd} aria-label={buttons.save}>
            <Save className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => cancelEdit(undefined)} aria-label={buttons.cancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
