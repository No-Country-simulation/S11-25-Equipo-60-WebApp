import { Dispatch, SetStateAction, useMemo, useState } from "react"

interface UseTableLogicProps<T extends Record<string, any>> {
  data: T[]
  setData: Dispatch<SetStateAction<T[]>>
  idField?: keyof T
  excludeColumns?: (keyof T)[]
}

export function useTableLogic<T extends Record<string, any>>({
  data,
  setData,
  idField = 'id' as keyof T,
  excludeColumns = [],
}: UseTableLogicProps<T>) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, Partial<T>>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [newValues, setNewValues] = useState<Partial<T>>({})

  // Columns inferred from first row (exclude id and specified columns)
  const columns = useMemo(() => {
    const first = data[0]
    if (!first) return [] as (keyof T)[]
    const allKeys = Object.keys(first) as (keyof T)[]
    const excludeSet = new Set([idField, ...excludeColumns])
    return allKeys.filter((k) => !excludeSet.has(k))
  }, [data, idField, excludeColumns])

  const startEdit = (id: string) => {
    const row = data.find((r) => r.id === id)
    setEditValues((s) => ({ ...s, [id]: row ? { ...row } : {} }))
    setEditingId(id)
  }

  const cancelEdit = (id?: string) => {
    if (id) {
      setEditValues((s) => {
        const copy = { ...s }
        delete copy[id]
        return copy
      })
    } else {
      setNewValues({} as Partial<T>)
      setIsAdding(false)
    }
    setEditingId(null)
  }

  const handleChange = (id: string, field: keyof T, value: any) => {
    // Si el valor ya es del tipo correcto (array, object, etc), usarlo directamente
    let parsed: any = value
    
    // Solo parsear si es un string y el campo original es numérico
    if (typeof value === 'string') {
      const sample = data.find((d) => String(d[idField]) === id)
      const isNumber = sample ? typeof sample[field] === "number" : false
      parsed = isNumber ? (value === "" ? undefined : Number(value)) : value
    }

    setEditValues((s) => ({
      ...s,
      [id]: {
        ...(s[id] || {}),
        [field]: parsed,
      },
    }))
  }

  const handleChangeNew = (field: keyof T, value: any) => {
    // Si el valor ya es del tipo correcto (array, object, etc), usarlo directamente
    let parsed: any = value
    
    // Solo parsear si es un string y el campo original es numérico
    if (typeof value === 'string') {
      const sample = data[0]
      const isNumber = sample ? typeof sample[field] === "number" : false
      parsed = isNumber ? (value === "" ? undefined : Number(value)) : value
    }
    
    setNewValues((s) => ({ ...s, [field]: parsed }))
  }

  const saveEdit = (id: string) => {
    const changes = editValues[id]
    if (!changes) return
    setData((prev) =>
      prev.map((row) => (String(row[idField]) === id ? { ...row, ...changes } : row))
    )
    setEditValues((s) => {
      const copy = { ...s }
      delete copy[id]
      return copy
    })
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((r) => String(r[idField]) !== id))
    if (editingId === id) cancelEdit(id)
  }

  const handleAdd = () => {
    // Validar que al menos un campo tenga valor
    if (Object.keys(newValues).length === 0) return
    
    const newRow = {
      ...newValues,
      [idField]: Date.now().toString(),
    } as T
    
    setData((prev) => [...prev, newRow])
    setNewValues({} as Partial<T>)
    setIsAdding(false)
  }

  const startAdding = () => setIsAdding(true)

  return {
    // State
    editingId,
    editValues,
    isAdding,
    newValues,
    columns,
    // Actions
    startEdit,
    cancelEdit,
    handleChange,
    handleChangeNew,
    saveEdit,
    handleDelete,
    handleAdd,
    startAdding,
  }
}
