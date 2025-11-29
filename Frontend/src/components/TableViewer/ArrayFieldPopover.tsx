"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ChevronDown } from "lucide-react"

interface ArrayFieldPopoverProps<T extends { id: string; name: string }> {
  readonly label: string
  readonly allOptions: T[]
  readonly selectedIds: string[]
  readonly onChange: (selectedIds: string[]) => void
  readonly disabled?: boolean
}

export function ArrayFieldPopover<T extends { id: string; name: string }>({
  label,
  allOptions,
  selectedIds,
  onChange,
  disabled = false,
}: ArrayFieldPopoverProps<T>) {
  const [open, setOpen] = useState(false)

  const toggleOption = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((sid) => sid !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  const selectedCount = selectedIds.length
  const selectedOptions = allOptions.filter((opt) => selectedIds.includes(opt.id))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          disabled={disabled}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {selectedCount > 0 ? (
              <>
                <Badge variant="secondary" className="shrink-0">
                  {selectedCount}
                </Badge>
                <span className="truncate text-sm flex items-center gap-1.5">
                  {selectedOptions.map((opt, idx) => (
                    <span key={opt.id} className="inline-flex items-center gap-1">
                      {(opt as any).icon && <span>{(opt as any).icon}</span>}
                      <span>{opt.name}</span>
                      {idx < selectedOptions.length - 1 && <span>,</span>}
                    </span>
                  ))}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">
                Seleccionar {label}
              </span>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 border-b">
          <h4 className="font-medium text-sm">Seleccionar {label}</h4>
          <p className="text-xs text-muted-foreground mt-1">
            {selectedCount} de {allOptions.length} seleccionados
          </p>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {allOptions.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No hay opciones disponibles
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {allOptions.map((option) => {
                const isSelected = selectedIds.includes(option.id)
                const icon = (option as any).icon
                return (
                  <div
                    key={option.id}
                    className="flex items-start space-x-3 rounded-md p-3 hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => toggleOption(option.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleOption(option.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none flex items-center gap-2">
                        {icon && <span className="text-base">{icon}</span>}
                        <span>{option.name}</span>
                      </p>
                      {(option as any).description && (
                        <p className="text-xs text-muted-foreground">
                          {(option as any).description}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
