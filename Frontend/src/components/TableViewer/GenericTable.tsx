"use client"
import { Dispatch, SetStateAction, useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, EyeOff } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { useTableLogic } from "./useTableLogic"
import { usePagination } from "./usePagination"
import { TablePagination } from "./TablePagination"
import { AddRow } from "./AddRow"
import { DataRow } from "./DataRow"
import es from "@/lib/locales/es.json"

type CustomRenderer<T> = (
  row: T,
  isEditing: boolean,
  onChange: (value: any) => void
) => React.ReactNode

interface GenericTableProps<T extends Record<string, any>> {
  readonly title?: string
  readonly icon?: React.ReactNode
  readonly data: T[]
  readonly setData: Dispatch<SetStateAction<T[]>>
  readonly idField?: keyof T
  readonly excludeColumns?: (keyof T)[]
  readonly columnLabels?: Partial<Record<keyof T, string>>
  readonly customRenderers?: Partial<Record<keyof T, CustomRenderer<T>>>
  readonly autoTitle?: boolean // Si es true, no muestra título
  readonly firstColumns?: (keyof T)[] // Columnas que deben aparecer primero
  readonly itemsPerPage?: number // Cantidad de filas por página (default: 10)
}

export default function GenericTable<T extends Record<string, any>>({
  title,
  icon,
  data,
  setData,
  idField = 'id' as keyof T,
  excludeColumns = [],
  columnLabels = {},
  customRenderers = {},
  autoTitle = false,
  firstColumns = [],
  itemsPerPage = 10,
}: GenericTableProps<T>) {
  const {
    editingId,
    editValues,
    isAdding,
    newValues,
    columns: baseColumns,
    startEdit,
    cancelEdit,
    handleChange,
    handleChangeNew,
    saveEdit,
    handleDelete,
    handleAdd,
    startAdding,
  } = useTableLogic({ data, setData, idField, excludeColumns })

  const t = es.table

  // Reordenar columnas poniendo firstColumns al inicio
  const allColumns = [
    ...firstColumns.filter(col => baseColumns.includes(col)),
    ...baseColumns.filter(col => !firstColumns.includes(col))
  ]

  // Estado para columnas visibles
  const [hiddenColumns, setHiddenColumns] = useState<Set<keyof T>>(new Set())

  // Filtrar columnas visibles
  const columns = allColumns.filter(col => !hiddenColumns.has(col))

  // Toggle visibilidad de columna
  const toggleColumn = (col: keyof T) => {
    setHiddenColumns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(col)) {
        newSet.delete(col)
      } else {
        newSet.add(col)
      }
      return newSet
    })
  }

  // Paginación
  const {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    changePageSize,
    hasNextPage,
    hasPreviousPage,
  } = usePagination({ totalItems: data.length, itemsPerPage })

  // Datos paginados
  const paginatedData = data.slice(startIndex, endIndex)

  // Función para formatear nombres de columnas automáticamente
  const getColumnLabel = (col: keyof T): string => {
    if (columnLabels?.[col]) return columnLabels[col]
    // Tomar el nombre del key y poner primera letra en mayúscula, resto en minúscula
    const label = String(col)
    return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()
  }

  return (
    <div className="border rounded-lg">
      <div className="p-4 flex justify-between items-center border-b bg-muted/50">
        {!autoTitle && (
          <div className="flex items-center gap-2">
            {icon && <div className="text-muted-foreground">{icon}</div>}
            <h2 className="text-lg font-semibold">{title || t.title}</h2>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                {hiddenColumns.size > 0 ? (
                  <EyeOff className="h-4 w-4 mr-2" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Columnas ({columns.length}/{allColumns.length})
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-2">
                <div className="font-semibold text-sm mb-3">Mostrar/Ocultar Columnas</div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allColumns.map((col) => (
                    <div key={String(col)} className="flex items-center space-x-2">
                      <Checkbox
                        id={String(col)}
                        checked={!hiddenColumns.has(col)}
                        onCheckedChange={() => toggleColumn(col)}
                      />
                      <label
                        htmlFor={String(col)}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {getColumnLabel(col)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={startAdding} 
            disabled={isAdding}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t.add}
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={String(col)}>{getColumnLabel(col)}</TableHead>
            ))}
            <TableHead className="w-[100px]">{t.headers.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isAdding && (
            <AddRow
              columns={columns}
              newValues={newValues}
              handleChangeNew={handleChangeNew}
              handleAdd={handleAdd}
              cancelEdit={cancelEdit}
              translations={{
                placeholders: t.placeholders,
                buttons: t.buttons,
              }}
            />
          )}

          {paginatedData.map((row) => {
            const rowId = String(row[idField])
            return (
              <DataRow
                key={rowId}
                row={row}
                columns={columns}
                rowId={rowId}
                isEditing={editingId === rowId}
                editValues={editValues[rowId]}
                handleChange={handleChange}
                saveEdit={saveEdit}
                cancelEdit={cancelEdit}
                startEdit={startEdit}
                handleDelete={handleDelete}
                translations={{ buttons: t.buttons }}
                customRenderers={customRenderers}
              />
            )
          })}
        </TableBody>
      </Table>
      
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={data.length}
        startIndex={startIndex}
        endIndex={endIndex}
        onPageChange={goToPage}
        onPageSizeChange={changePageSize}
        onNextPage={goToNextPage}
        onPreviousPage={goToPreviousPage}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />
    </div>
  )
}
