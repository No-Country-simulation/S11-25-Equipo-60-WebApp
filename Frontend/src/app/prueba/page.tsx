"use client"
import { TableViewer } from "@/components"
import { UsersTable } from "@/components/TableViewer/UsersTable"
import { RolesTable } from "@/components/TableViewer/RolesTable"
import { PermissionsTable } from "@/components/TableViewer/PermissionsTable"
import { CategoriesTable } from "@/components/TableViewer/CategoriesTable"
import { StatusTable } from "@/components/TableViewer/StatusTable"
import { TabsTable } from "@/components/TableViewer/TabsTable"
import { MOCK_USER, MOCK_ROLES, MOCK_PERMISSIONS, MOCK_CATEGORIES, MOCK_STATUS, MOCK_TABS } from "@/mock/DataUserMock"

export default function Prueba() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-8">Tablas Genéricas - Ejemplos con Diferentes Tipos de Datos</h1>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">1. Tabla de Tarjetas (CardType)</h2>
        <p className="text-gray-600 mb-4">Tabla con campos: nombre (string), tasa (number), días (number)</p>
        <TableViewer />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">2. Tabla de Usuarios (IUser)</h2>
        <p className="text-gray-600 mb-4">Gestiona roles con Popover interactivo - click en editar para asignar roles</p>
        <UsersTable users={MOCK_USER} availableRoles={MOCK_ROLES} />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">3. Tabla de Roles (IRole)</h2>
        <p className="text-gray-600 mb-4">Gestiona permisos con Popover interactivo - selecciona múltiples permisos por rol</p>
        <RolesTable roles={MOCK_ROLES} availablePermissions={MOCK_PERMISSIONS} />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">4. Tabla de Permisos (IPermission)</h2>
        <p className="text-gray-600 mb-4">Tabla simple con dos campos de texto</p>
        <PermissionsTable permissions={MOCK_PERMISSIONS} />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">5. Tabla de Categorías (ICategory)</h2>
        <p className="text-gray-600 mb-4">Categorías con iconos y colores personalizados</p>
        <CategoriesTable categories={MOCK_CATEGORIES} />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">6. Tabla de Estados (IStatus)</h2>
        <p className="text-gray-600 mb-4">Estados de testimonios con iconos y colores</p>
        <StatusTable status={MOCK_STATUS} />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">7. Tabla de Tabs (ITab)</h2>
        <p className="text-gray-600 mb-4">Pestañas del sistema con iconos y colores</p>
        <TabsTable tabs={MOCK_TABS} />
      </div>
    </div>
  )
}
