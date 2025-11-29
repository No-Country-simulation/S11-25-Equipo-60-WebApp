# ArrayFieldPopover - Gestión de Arrays con Popover

## 📋 Descripción

`ArrayFieldPopover` es un componente que permite gestionar campos de tipo array (relaciones múltiples) mediante un Popover interactivo con checkboxes. Ideal para gestionar relaciones muchos-a-muchos como usuarios-roles, roles-permisos, etc.

## ✨ Características Principales

- ✅ **Popover con checkboxes**: Interfaz intuitiva para seleccionar múltiples opciones
- ✅ **Vista de badges**: Muestra las opciones seleccionadas como badges coloridos
- ✅ **Contador**: Indica cuántas opciones están seleccionadas
- ✅ **Scroll automático**: Lista con scroll para muchas opciones
- ✅ **Descripciones**: Muestra descripción de cada opción si está disponible
- ✅ **Responsive**: Se adapta al tamaño de la pantalla

## 🚀 Uso Básico

### Ejemplo: Gestionar Permisos en Roles

```tsx
import { ArrayFieldPopover } from "./ArrayFieldPopover"
import { MOCK_PERMISSIONS } from "@/app/mock/DataUserMock"

function MyComponent() {
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(['1', '2'])

  return (
    <ArrayFieldPopover
      label="Permisos"
      allOptions={MOCK_PERMISSIONS}
      selectedIds={selectedPermissionIds}
      onChange={setSelectedPermissionIds}
    />
  )
}
```

## 📝 Props

```typescript
interface ArrayFieldPopoverProps<T extends { id: string; name: string }> {
  readonly label: string                    // Etiqueta del campo (ej: "Permisos", "Roles")
  readonly allOptions: T[]                  // Todas las opciones disponibles
  readonly selectedIds: string[]            // IDs de las opciones seleccionadas
  readonly onChange: (selectedIds: string[]) => void  // Callback cuando cambian las selecciones
  readonly disabled?: boolean               // Deshabilitar el componente
}
```

### Parámetros Detallados

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `label` | `string` | ✅ Sí | Texto que aparece en el botón y encabezado del popover |
| `allOptions` | `T[]` | ✅ Sí | Array con todas las opciones disponibles para seleccionar |
| `selectedIds` | `string[]` | ✅ Sí | Array de IDs que están actualmente seleccionados |
| `onChange` | `(ids: string[]) => void` | ✅ Sí | Función que se ejecuta cuando cambian las selecciones |
| `disabled` | `boolean` | ❌ No | Si es `true`, deshabilita la interacción (default: `false`) |

### Tipo de Opciones

Las opciones deben tener al menos estas propiedades:

```typescript
interface MinimalOption {
  id: string      // Identificador único
  name: string    // Nombre para mostrar
  description?: string  // Descripción opcional (se muestra bajo el nombre)
}
```

## 🎯 Integración con GenericTable

### Paso 1: Crear el renderizador personalizado

```tsx
const renderPermissions = (row: IRole, isEditing: boolean, onChange: (value: any) => void) => {
  if (isEditing) {
    const selectedIds = row.permissions.map(p => p.id)
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
  
  // Vista de solo lectura con badges
  return (
    <div className="flex flex-wrap gap-1">
      {row.permissions.slice(0, 3).map((p) => (
        <span key={p.id} className="badge">
          {p.name}
        </span>
      ))}
      {row.permissions.length > 3 && (
        <span>+{row.permissions.length - 3} más</span>
      )}
    </div>
  )
}
```

### Paso 2: Usar en GenericTable

```tsx
<GenericTable
  data={roles}
  setData={setRoles}
  columnLabels={{
    permissions: 'Permisos Asignados',
  }}
  customRenderers={{
    permissions: renderPermissions
  }}
/>
```

## 📦 Ejemplos Completos

### Ejemplo 1: Tabla de Roles con Permisos

```tsx
// RolesTable.tsx
export function RolesTable({ roles, setRoles, availablePermissions }: RolesTableProps) {
  const renderPermissions = (row: IRole, isEditing: boolean, onChange: (value: any) => void) => {
    if (isEditing) {
      return (
        <ArrayFieldPopover
          label="Permisos"
          allOptions={availablePermissions}
          selectedIds={row.permissions.map(p => p.id)}
          onChange={(ids) => {
            const selected = availablePermissions.filter(p => ids.includes(p.id))
            onChange(selected)
          }}
        />
      )
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {row.permissions.map((p) => (
          <span key={p.id} className="badge-blue">
            {p.name}
          </span>
        ))}
      </div>
    )
  }

  return (
    <GenericTable
      data={roles}
      setData={setRoles}
      customRenderers={{ permissions: renderPermissions }}
    />
  )
}
```

### Ejemplo 2: Tabla de Usuarios con Roles

```tsx
// UsersTable.tsx
export function UsersTable({ users, setUsers, availableRoles }: UsersTableProps) {
  const renderRoles = (row: IUser, isEditing: boolean, onChange: (value: any) => void) => {
    if (isEditing) {
      return (
        <ArrayFieldPopover
          label="Roles"
          allOptions={availableRoles}
          selectedIds={row.role.map(r => r.id)}
          onChange={(ids) => {
            const selected = availableRoles.filter(r => ids.includes(r.id))
            onChange(selected)
          }}
        />
      )
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {row.role.map((r) => (
          <span key={r.id} className="badge-purple">
            {r.name}
          </span>
        ))}
      </div>
    )
  }

  return (
    <GenericTable
      data={users}
      setData={setUsers}
      customRenderers={{ role: renderRoles }}
    />
  )
}
```

## 🎨 Personalización Visual

### Badges Personalizados

Puedes personalizar los colores de los badges en modo lectura:

```tsx
// Badge azul para permisos
<span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
  {permission.name}
</span>

// Badge morado para roles
<span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
  {role.name}
</span>

// Badge gris para "más opciones"
<span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
  +{count} más
</span>
```

### Limitar Badges Mostrados

```tsx
// Mostrar solo los primeros 3
{row.permissions.slice(0, 3).map((p) => (
  <Badge key={p.id}>{p.name}</Badge>
))}
{row.permissions.length > 3 && (
  <span>+{row.permissions.length - 3} más</span>
)}
```

## 🔧 Funcionalidades Internas

### Estado del Popover

- **Abierto/Cerrado**: Gestionado con `useState` local
- **Toggle**: Click en checkbox o en la fila completa
- **Cierre automático**: Al hacer click fuera del popover

### Manejo de Cambios

```typescript
const toggleOption = (id: string) => {
  if (selectedIds.includes(id)) {
    // Quitar selección
    onChange(selectedIds.filter((sid) => sid !== id))
  } else {
    // Agregar selección
    onChange([...selectedIds, id])
  }
}
```

### Contador y Vista Previa

```typescript
const selectedCount = selectedIds.length
const selectedNames = allOptions
  .filter((opt) => selectedIds.includes(opt.id))
  .map((opt) => opt.name)
  .join(", ")
```

## 🎬 Flujo de Uso

1. **Usuario hace click en "Editar"** → La celda muestra el componente ArrayFieldPopover
2. **Usuario hace click en el botón** → Se abre el Popover con todas las opciones
3. **Usuario marca/desmarca checkboxes** → Se actualiza el array de `selectedIds`
4. **Se ejecuta `onChange`** → Los IDs se convierten en objetos completos
5. **Usuario hace click en "Guardar"** → Los cambios se persisten en la tabla

## 📊 Casos de Uso

### ✅ Ideal para:

- Gestión de permisos en roles
- Asignación de roles a usuarios
- Categorías de productos
- Tags de artículos
- Miembros de equipos
- Etiquetas de tareas

### ❌ NO usar para:

- Campos simples de texto/número (usar Input normal)
- Relaciones uno-a-uno (usar Select simple)
- Arrays muy grandes (>100 opciones, considerar búsqueda)

## 🐛 Troubleshooting

### El Popover no abre

**Causa**: Conflicto con z-index u otros popovers.

**Solución**: Verifica que no haya otros elementos con z-index superior.

### Los cambios no se guardan

**Causa**: El `onChange` no está actualizando correctamente el objeto completo.

**Solución**: Asegúrate de convertir los IDs en objetos:

```tsx
onChange={(ids) => {
  const selectedObjects = allOptions.filter(opt => ids.includes(opt.id))
  onChange(selectedObjects)  // ✅ Pasar objetos, no solo IDs
}}
```

### Las descripciones no aparecen

**Causa**: Las opciones no tienen el campo `description`.

**Solución**: Agrega `description` opcional a tus interfaces:

```typescript
interface MyOption {
  id: string
  name: string
  description?: string  // Opcional
}
```

## 🔮 Futuras Mejoras

- [ ] Búsqueda de opciones dentro del Popover
- [ ] Selección masiva (Seleccionar todos / Deseleccionar todos)
- [ ] Grupos de opciones (categorías)
- [ ] Drag & drop para reordenar
- [ ] Vista de tabla dentro del Popover
- [ ] Lazy loading para muchas opciones

## 📚 Componentes Relacionados

- `GenericTable` - Tabla principal que usa este componente
- `DataRow` - Componente que renderiza las celdas con customRenderers
- `RolesTable` - Ejemplo de uso con permisos
- `UsersTable` - Ejemplo de uso con roles

## 📄 Licencia

Este componente es parte del proyecto S11-25-Equipo-60-WebApp.
