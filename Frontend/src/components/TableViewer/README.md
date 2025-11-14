# GenericTable - Componente de Tabla Genérica y Reutilizable

## 📋 Descripción

`GenericTable` es un componente React completamente genérico que detecta automáticamente las columnas de cualquier tipo de datos que reciba. Proporciona funcionalidad CRUD completa (Crear, Leer, Actualizar, Eliminar) con edición inline.

## ✨ Características

- **100% Genérico**: Funciona con cualquier tipo de datos TypeScript
- **Detección automática de columnas**: Lee las propiedades del primer objeto
- **Inferencia de tipos**: Detecta automáticamente si un campo es número o texto
- **Edición inline**: Edita directamente en la tabla
- **Localización**: Todos los textos desde JSON
- **TypeScript**: Tipado fuerte con generics
- **Separación de responsabilidades**: Lógica en hooks, componentes presentacionales

## 🏗️ Arquitectura

```
TableViewer/
├── GenericTable.tsx      # Componente principal orquestador
├── useTableLogic.ts      # Hook con toda la lógica CRUD
├── AddRow.tsx            # Componente para agregar filas
├── DataRow.tsx           # Componente para mostrar/editar filas
├── TableViewer.tsx       # Wrapper para CardType (ejemplo)
└── UsersTable.tsx        # Wrapper para IUser (ejemplo)
```

## 🚀 Uso Básico

### Ejemplo 1: Tabla de Tarjetas

```tsx
import GenericTable from "./GenericTable"
import { CardType } from "@/app/interfaces/AppInterfaces"

const data: CardType[] = [
  { id: "1", name: "Visa", fee: 3.5, days: 30 },
  { id: "2", name: "Master", fee: 4.1, days: 30 },
]

function MyComponent() {
  const [cards, setCards] = useState(data)

  return (
    <GenericTable
      data={cards}
      setData={setCards}
      columnLabels={{
        name: "Tarjeta",
        fee: "Tasa (%)",
        days: "Días",
      }}
    />
  )
}
```

### Ejemplo 2: Tabla de Usuarios

```tsx
import GenericTable from "./GenericTable"
import { IUser } from "@/app/interfaces/AppInterfaces"

function UsersComponent() {
  const [users, setUsers] = useState<IUser[]>([
    { id: "1", email: "user@example.com", name: "John", password: "***", role: [...] }
  ])

  return (
    <GenericTable
      data={users}
      setData={setUsers}
      excludeColumns={['password', 'role']}  // Ocultar columnas sensibles
      columnLabels={{
        email: 'Correo Electrónico',
        name: 'Nombre',
      }}
    />
  )
}
```

## 📝 Props de GenericTable

```typescript
interface GenericTableProps<T extends Record<string, any>> {
  // Datos de la tabla
  readonly data: T[]
  readonly setData: Dispatch<SetStateAction<T[]>>
  
  // Configuración opcional
  readonly title?: string                           // Título personalizado
  readonly idField?: keyof T                        // Campo usado como ID (default: 'id')
  readonly excludeColumns?: (keyof T)[]            // Columnas a ocultar
  readonly columnLabels?: Partial<Record<keyof T, string>>  // Etiquetas personalizadas
}
```

### Parámetros

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `data` | `T[]` | ✅ Sí | Array de objetos con los datos |
| `setData` | `Dispatch<SetStateAction<T[]>>` | ✅ Sí | Función para actualizar los datos |
| `title` | `string` | ❌ No | Título de la tabla (default: desde JSON) |
| `idField` | `keyof T` | ❌ No | Campo que actúa como ID (default: `'id'`) |
| `excludeColumns` | `(keyof T)[]` | ❌ No | Array de columnas a NO mostrar |
| `columnLabels` | `Partial<Record<keyof T, string>>` | ❌ No | Etiquetas personalizadas para columnas |

## 🎯 Casos de Uso

### 1. Tabla simple con datos mínimos

```tsx
<GenericTable data={myData} setData={setMyData} />
```

### 2. Tabla con columnas excluidas

```tsx
<GenericTable 
  data={users} 
  setData={setUsers}
  excludeColumns={['password', 'internalId', 'createdAt']}
/>
```

### 3. Tabla con etiquetas personalizadas

```tsx
<GenericTable 
  data={products} 
  setData={setProducts}
  columnLabels={{
    sku: 'Código SKU',
    price: 'Precio (USD)',
    stock: 'Inventario Disponible',
  }}
/>
```

### 4. Tabla con campo ID personalizado

```tsx
<GenericTable 
  data={items} 
  setData={setItems}
  idField="uuid"  // Si tu objeto usa 'uuid' en vez de 'id'
/>
```

## 🔧 Cómo Funciona

### 1. Detección de Columnas

El componente inspecciona el primer objeto del array `data` y extrae todas sus propiedades:

```typescript
const columns = Object.keys(data[0])  // ['id', 'name', 'fee', 'days']
  .filter(k => k !== idField)          // Excluye el ID
  .filter(k => !excludeColumns.has(k)) // Excluye columnas especificadas
```

### 2. Inferencia de Tipos

Detecta automáticamente si un campo es número o texto:

```typescript
const isNumber = typeof data[0][field] === "number"
const inputType = isNumber ? "number" : "text"
```

### 3. Formateo de Labels

Convierte `camelCase` a `Title Case` automáticamente:

```typescript
// 'firstName' → 'First Name'
// 'totalAmount' → 'Total Amount'
```

## 📦 Estructura Interna

### useTableLogic Hook

Maneja todo el estado y las operaciones CRUD:

- **Estado**: `editingId`, `editValues`, `isAdding`, `newValues`, `columns`
- **Acciones**: `startEdit`, `cancelEdit`, `handleChange`, `saveEdit`, `handleDelete`, `handleAdd`

### AddRow Component

Renderiza la fila de inputs para agregar nuevos elementos.

### DataRow Component

Renderiza cada fila de datos con modo vista/edición.

## 🌍 Localización

Los textos provienen de `es.json`:

```json
{
  "table": {
    "title": "Tipos de Tarjeta",
    "add": "Agregar",
    "headers": {
      "actions": "Acciones"
    },
    "buttons": {
      "save": "Guardar",
      "cancel": "Cancelar",
      "edit": "Editar",
      "delete": "Eliminar"
    }
  }
}
```

## 🎨 Personalización

### Crear un Wrapper Personalizado

```tsx
import GenericTable from "./GenericTable"

interface MyCustomTableProps {
  readonly items: MyType[]
  readonly setItems?: React.Dispatch<React.SetStateAction<MyType[]>>
}

export function MyCustomTable({ items, setItems }: MyCustomTableProps) {
  const [localData, setLocalData] = useState(items)
  const data = setItems ? items : localData
  const setData = setItems ?? setLocalData

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mi Tabla Personalizada</CardTitle>
      </CardHeader>
      <CardContent>
        <GenericTable
          data={data}
          setData={setData}
          excludeColumns={['internalField']}
          columnLabels={{
            myField: 'Mi Campo Personalizado',
          }}
        />
      </CardContent>
    </Card>
  )
}
```

## 🐛 Troubleshooting

### Error: "Cannot read properties of undefined"

**Causa**: El array `data` está vacío.

**Solución**: Asegúrate de que `data` tenga al menos un elemento, o maneja el caso vacío:

```tsx
{data.length > 0 ? (
  <GenericTable data={data} setData={setData} />
) : (
  <p>No hay datos disponibles</p>
)}
```

### Las columnas no aparecen

**Causa**: El campo `idField` no coincide con tu estructura de datos.

**Solución**: Especifica el campo ID correcto:

```tsx
<GenericTable data={data} setData={setData} idField="uuid" />
```

### Los números no se detectan correctamente

**Causa**: Los datos están en formato string (`"3.5"` en vez de `3.5`).

**Solución**: Convierte los datos al tipo correcto antes de pasarlos:

```tsx
const parsedData = rawData.map(item => ({
  ...item,
  fee: Number(item.fee),
  days: Number(item.days),
}))
```

## 📚 Ejemplos Completos

Ver archivos de ejemplo:
- `TableViewer.tsx` - Wrapper para CardType
- `UsersTable.tsx` - Wrapper para IUser
- `/app/prueba/page.tsx` - Página de demostración

## 🔮 Futuras Mejoras

- [ ] Soporte para tipos de datos más complejos (fechas, booleanos)
- [ ] Validación de campos requeridos
- [ ] Ordenamiento de columnas
- [ ] Búsqueda/filtrado
- [ ] Paginación
- [ ] Exportar a CSV/Excel
- [ ] Columnas personalizadas con render functions

## 📄 Licencia

Este componente es parte del proyecto S11-25-Equipo-60-WebApp.
